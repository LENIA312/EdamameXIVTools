// 抽選(制約充足)アルゴリズム
//
// ロール構成は「どのキャラクターがどの役割を担うか」を固定しない、役割要求の集合として扱う。
// 各役割スロットについて、まだ役割が決まっていない全キャラクター×そのキャラクターの
// 抽選対象ジョブを試し、成立する組み合わせがあれば必ずそれを採用する。
// どの組み合わせでも成立しない場合にのみエラーとする。

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

// characters: [{ jobLevels, excludedJobIds }], roleTemplate: SLOT_REQ[] (characters と同じ長さ、役割要求の集合として扱う)
function drawAssignment(characters, roleTemplate, settings) {
  const n = characters.length;

  const eligiblePerCharacter = characters.map((character) => computeEligibleJobs(character, settings));

  const emptyCharIndex = eligiblePerCharacter.findIndex((jobs) => jobs.length === 0);
  if (emptyCharIndex !== -1) {
    return { success: false, reason: "no-eligible-job", slotIndex: emptyCharIndex };
  }

  const slotOrder = shuffled([...Array(n).keys()]);
  const charOrder = shuffled([...Array(n).keys()]);

  const assignment = new Array(n).fill(null); // assignment[characterIndex] = jobId
  const usedCharacters = new Array(n).fill(false);
  const usedJobs = new Set();

  function backtrack(slotPos) {
    if (slotPos === n) return true;
    const requirement = roleTemplate[slotOrder[slotPos]];

    for (const charIndex of charOrder) {
      if (usedCharacters[charIndex]) continue;

      const candidateJobs = shuffled(
        eligiblePerCharacter[charIndex].filter((jobId) => jobMatchesRequirement(JOBS_BY_ID[jobId], requirement))
      );

      for (const jobId of candidateJobs) {
        if (settings.noDuplicateJobs && usedJobs.has(jobId)) continue;

        usedCharacters[charIndex] = true;
        usedJobs.add(jobId);
        assignment[charIndex] = jobId;

        if (backtrack(slotPos + 1)) return true;

        usedCharacters[charIndex] = false;
        usedJobs.delete(jobId);
        assignment[charIndex] = null;
      }
    }
    return false;
  }

  if (!backtrack(0)) {
    return { success: false, reason: "no-combination" };
  }
  return { success: true, assignment };
}
