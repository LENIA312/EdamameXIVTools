// 抽選(制約充足)アルゴリズム

function shuffled(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// そのキャラクターにとって抽選対象になり得るジョブID一覧(ロール要求は含まない)
function computeEligibleJobs(character, settings) {
  const minLevel = Math.max(settings.levelThreshold, settings.excludeUnreleased ? 1 : 0);
  return JOBS.filter((job) => {
    if (character.excludedJobIds.has(job.id)) return false;
    const level = character.jobLevels[job.id] ?? 0;
    return level >= minLevel;
  }).map((job) => job.id);
}

// characters: [{ jobLevels, excludedJobIds }], roleTemplate: SLOT_REQ[] (characters と同じ長さ)
function drawAssignment(characters, roleTemplate, settings) {
  const n = characters.length;

  const eligiblePerSlot = characters.map((character, i) => {
    const base = computeEligibleJobs(character, settings);
    const matched = base.filter((jobId) => jobMatchesRequirement(JOBS_BY_ID[jobId], roleTemplate[i]));
    // 指定のロールを満たすジョブがない場合、そのキャラクターだけロール指定を諦めて自由枠として扱う
    return shuffled(matched.length > 0 ? matched : base);
  });

  const emptySlot = eligiblePerSlot.findIndex((jobs) => jobs.length === 0);
  if (emptySlot !== -1) {
    return {
      success: false,
      error: `${emptySlot + 1}人目の条件(レベル制限・抽選対象設定)を満たすジョブがありません`,
    };
  }

  const order = shuffled([...Array(n).keys()]);
  const assignment = new Array(n).fill(null);
  const usedJobs = new Set();

  function backtrack(pos) {
    if (pos === n) return true;
    const slot = order[pos];
    for (const jobId of eligiblePerSlot[slot]) {
      if (settings.noDuplicateJobs && usedJobs.has(jobId)) continue;
      assignment[slot] = jobId;
      usedJobs.add(jobId);
      if (backtrack(pos + 1)) return true;
      usedJobs.delete(jobId);
      assignment[slot] = null;
    }
    return false;
  }

  if (!backtrack(0)) {
    return { success: false, error: "条件を満たす組み合わせが見つかりませんでした" };
  }
  return { success: true, assignment };
}
