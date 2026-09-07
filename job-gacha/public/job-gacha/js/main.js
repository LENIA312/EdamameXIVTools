const MAX_SLOTS = 8;

function createEmptyCharacter() {
  return {
    lodestoneId: null,
    name: "",
    world: "",
    dataCenter: "",
    avatarUrl: "",
    jobLevels: {},
    excludedJobIds: new Set(),
  };
}

const state = {
  levelThreshold: 100,
  noDuplicateJobs: false,
  excludeUnreleased: true,
  roleMode: "recommended", // "recommended" | "free"
  roleOverrides: {}, // slotIndex -> SLOT_REQ (手動上書き)
  characters: Array.from({ length: MAX_SLOTS }, createEmptyCharacter),
  results: new Array(MAX_SLOTS).fill(null),
};

function activeSlotCount() {
  return state.characters.filter((c) => c.name).length;
}

function isSlotEmpty(index) {
  return !state.characters[index].name;
}

function currentRoleTemplate() {
  const count = Math.max(activeSlotCount(), 1);
  const base = state.roleMode === "recommended" ? recommendedTemplate(count) : freeTemplate(count);
  return Array.from({ length: MAX_SLOTS }, (_, i) => state.roleOverrides[i] ?? base[i] ?? SLOT_REQ.FREE);
}

function invalidateResults() {
  state.results = new Array(MAX_SLOTS).fill(null);
}

function assignCharacterToSlot(index, detail) {
  const lodestoneId = detail.lodestoneId ?? detail.id;
  const alreadyUsed = state.characters.some(
    (c, i) => i !== index && c.lodestoneId === lodestoneId
  );
  if (alreadyUsed) {
    return { success: false, error: "同じキャラクターは複数選択できません" };
  }

  state.characters[index] = {
    lodestoneId,
    name: detail.name,
    world: detail.world,
    dataCenter: detail.dataCenter,
    avatarUrl: detail.avatarUrl,
    jobLevels: detail.jobLevels,
    excludedJobIds: new Set(),
  };
  invalidateResults();
  return { success: true };
}

function clearSlot(index) {
  state.characters[index] = createEmptyCharacter();
  delete state.roleOverrides[index];
  invalidateResults();
  renderApp();
}

function resetAllCharacters() {
  state.characters = Array.from({ length: MAX_SLOTS }, createEmptyCharacter);
  state.roleOverrides = {};
  invalidateResults();
  renderApp();
}

function applyRosterHistoryEntry(entry) {
  state.characters = Array.from({ length: MAX_SLOTS }, (_, i) => {
    const stored = entry.characters[i];
    return stored ? fromStorableCharacter(stored) : createEmptyCharacter();
  });
  state.roleOverrides = {};
  invalidateResults();
}

function applyOptimalLevel() {
  const active = state.characters.filter((c) => c.name);
  if (active.length === 0) return;

  const maxLevels = active.map((c) => {
    const levels = Object.values(c.jobLevels || {});
    return levels.length > 0 ? Math.max(...levels) : 0;
  });
  const optimal = Math.max(1, Math.min(...maxLevels));

  state.levelThreshold = optimal;
  document.getElementById("level-threshold").value = optimal;
  invalidateResults();
  renderApp();
}

function toggleRoleMode() {
  state.roleMode = state.roleMode === "recommended" ? "free" : "recommended";
  state.roleOverrides = {};
  invalidateResults();
  renderApp();
}

function cycleRoleSlot(index) {
  if (isSlotEmpty(index)) return;
  const current = currentRoleTemplate()[index];
  state.roleOverrides[index] = nextSlotRequirement(current);
  invalidateResults();
  renderApp();
}

function toggleJobExclusion(slotIndex, jobId) {
  const set = state.characters[slotIndex].excludedJobIds;
  if (set.has(jobId)) {
    set.delete(jobId);
  } else {
    set.add(jobId);
  }
  invalidateResults();
}

function runDraw() {
  const activeIndexes = state.characters
    .map((c, i) => (c.name ? i : -1))
    .filter((i) => i !== -1);

  const errorEl = document.getElementById("draw-error");
  const shareBtn = document.getElementById("share-button");
  errorEl.hidden = true;
  shareBtn.hidden = true;
  document.getElementById("share-message").hidden = true;

  if (activeIndexes.length === 0) {
    errorEl.textContent = "キャラクターを1人以上選択してください";
    errorEl.hidden = false;
    return;
  }

  recordRosterHistory(activeIndexes.map((i) => state.characters[i]));

  const characters = activeIndexes.map((i) => state.characters[i]);
  const roleTemplate = activeIndexes.map((i) => currentRoleTemplate()[i]);
  const settings = {
    levelThreshold: state.levelThreshold,
    excludeUnreleased: state.excludeUnreleased,
    noDuplicateJobs: state.noDuplicateJobs,
  };

  const result = drawAssignment(characters, roleTemplate, settings);
  if (!result.success) {
    if (result.reason === "no-eligible-job") {
      const name = characters[result.slotIndex].name;
      errorEl.textContent = `${name} の条件(基準レベル・抽選対象設定)を満たすジョブがありません`;
    } else {
      errorEl.textContent = "条件を満たす組み合わせが見つかりませんでした";
    }
    errorEl.hidden = false;
    invalidateResults();
    renderApp();
    return;
  }

  state.results = new Array(MAX_SLOTS).fill(null);
  activeIndexes.forEach((slotIndex, pos) => {
    state.results[slotIndex] = result.assignment[pos];
  });
  shareBtn.hidden = false;
  renderApp();

  recordJobGachaDraw(
    settings,
    activeIndexes.map((slotIndex) => {
      const job = JOBS_BY_ID[state.results[slotIndex]];
      const c = state.characters[slotIndex];
      return { name: c.name, world: c.world, jobId: job.id, jobName: job.nameJa };
    })
  );
}

async function handleShareClick() {
  const messageEl = document.getElementById("share-message");
  messageEl.hidden = true;

  const entries = state.characters
    .map((character, i) => ({ character, jobId: state.results[i] }))
    .filter((e) => e.jobId)
    .map((e) => ({ character: e.character, job: JOBS_BY_ID[e.jobId] }));

  if (entries.length === 0) return;

  try {
    const outcome = await shareDrawResult(entries);
    if (outcome.downloaded) {
      messageEl.textContent = "画像を保存しました。SNS等に添付してシェアしてください";
      messageEl.hidden = false;
    }
  } catch (err) {
    messageEl.textContent = "画像の生成に失敗しました";
    messageEl.hidden = false;
  }
}

function setLevelThreshold(value) {
  state.levelThreshold = Number.isFinite(value) ? Math.min(Math.max(value, 1), 100) : 1;
  document.getElementById("level-threshold").value = state.levelThreshold;
  invalidateResults();
  renderApp();
}

function init() {
  document.getElementById("level-threshold").addEventListener("change", (e) => {
    setLevelThreshold(Number.parseInt(e.target.value, 10));
  });

  document.querySelectorAll(".level-quick-row [data-level]").forEach((btn) => {
    btn.addEventListener("click", () => setLevelThreshold(Number.parseInt(btn.dataset.level, 10)));
  });

  document.getElementById("no-duplicate").addEventListener("change", (e) => {
    state.noDuplicateJobs = e.target.checked;
    invalidateResults();
  });

  document.getElementById("exclude-unreleased").addEventListener("change", (e) => {
    state.excludeUnreleased = e.target.checked;
    invalidateResults();
  });

  document.getElementById("role-mode-toggle").addEventListener("click", toggleRoleMode);
  document.getElementById("draw-button").addEventListener("click", runDraw);
  document.getElementById("optimal-level-btn").addEventListener("click", applyOptimalLevel);
  document.getElementById("roster-history-btn").addEventListener("click", openRosterHistoryModal);
  document.getElementById("reset-characters-btn").addEventListener("click", resetAllCharacters);
  document.getElementById("share-button").addEventListener("click", handleShareClick);

  renderApp();
}

document.addEventListener("DOMContentLoaded", init);
