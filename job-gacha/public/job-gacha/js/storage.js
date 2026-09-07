// localStorage履歴(キャラクター検索履歴・編成履歴)

const CHARACTER_HISTORY_KEY = "jobgacha:characterHistory";
const ROSTER_HISTORY_KEY = "jobgacha:rosterHistory";
const MAX_CHARACTER_HISTORY = 20;
const MAX_ROSTER_HISTORY = 10;

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // 保存領域がない/使用不可でもアプリの動作は継続する
  }
}

function toStorableCharacter(character) {
  return {
    lodestoneId: character.lodestoneId ?? character.id,
    name: character.name,
    world: character.world,
    dataCenter: character.dataCenter,
    avatarUrl: character.avatarUrl,
    jobLevels: character.jobLevels,
  };
}

function fromStorableCharacter(stored) {
  return {
    lodestoneId: stored.lodestoneId,
    name: stored.name,
    world: stored.world,
    dataCenter: stored.dataCenter,
    avatarUrl: stored.avatarUrl,
    jobLevels: stored.jobLevels || {},
    excludedJobIds: new Set(),
  };
}

// ---- キャラクター検索履歴(最近使用した個々のキャラクター、最大20件) ----

function loadCharacterHistory() {
  return readJson(CHARACTER_HISTORY_KEY, []);
}

function recordCharacterHistory(character) {
  const history = loadCharacterHistory().filter((c) => c.lodestoneId !== character.lodestoneId);
  history.unshift(toStorableCharacter(character));
  writeJson(CHARACTER_HISTORY_KEY, history.slice(0, MAX_CHARACTER_HISTORY));
}

// ---- 編成履歴(抽選に使ったキャラクター一式、最大10件) ----

function loadRosterHistory() {
  return readJson(ROSTER_HISTORY_KEY, []);
}

function rosterSignature(characters) {
  return characters.map((c) => c.lodestoneId).join(",");
}

function recordRosterHistory(characters) {
  if (characters.length === 0) return;
  const signature = rosterSignature(characters);
  const history = loadRosterHistory().filter((entry) => rosterSignature(entry.characters.map(fromStorableCharacter)) !== signature);
  history.unshift({
    savedAt: Date.now(),
    characters: characters.map(toStorableCharacter),
  });
  writeJson(ROSTER_HISTORY_KEY, history.slice(0, MAX_ROSTER_HISTORY));
}
