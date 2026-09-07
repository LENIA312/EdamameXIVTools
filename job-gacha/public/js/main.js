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

function assignCharacterToSlot(index, detail, region) {
  const alreadyUsed = state.characters.some(
    (c, i) => i !== index && c.lodestoneId === detail.id
  );
  if (alreadyUsed) {
    return { success: false, error: "同じキャラクターは複数選択できません" };
  }

  state.characters[index] = {
    lodestoneId: detail.id,
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
  errorEl.hidden = true;

  if (activeIndexes.length === 0) {
    errorEl.textContent = "キャラクターを1人以上選択してください";
    errorEl.hidden = false;
    return;
  }

  const characters = activeIndexes.map((i) => state.characters[i]);
  const roleTemplate = activeIndexes.map((i) => currentRoleTemplate()[i]);
  const settings = {
    levelThreshold: state.levelThreshold,
    excludeUnreleased: state.excludeUnreleased,
    noDuplicateJobs: state.noDuplicateJobs,
  };

  const result = drawAssignment(characters, roleTemplate, settings);
  if (!result.success) {
    errorEl.textContent = result.error;
    errorEl.hidden = false;
    return;
  }

  state.results = new Array(MAX_SLOTS).fill(null);
  activeIndexes.forEach((slotIndex, pos) => {
    state.results[slotIndex] = result.assignment[pos];
  });
  renderApp();
}

function init() {
  document.getElementById("level-threshold").addEventListener("change", (e) => {
    const value = Number.parseInt(e.target.value, 10);
    state.levelThreshold = Number.isFinite(value) ? Math.min(Math.max(value, 1), 100) : 1;
    e.target.value = state.levelThreshold;
    invalidateResults();
    renderApp();
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

  renderApp();
}

document.addEventListener("DOMContentLoaded", init);
