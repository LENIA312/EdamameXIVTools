// 現行の戦闘ジョブ一覧(ギャザラー・クラフター・リミテッドジョブは対象外)
const ROLE = {
  TANK: "tank",
  HEALER: "healer",
  DPS: "dps",
};

const SUBTYPE = {
  PURE: "pure",
  BARRIER: "barrier",
  MELEE: "melee",
  RANGED: "ranged",
  CASTER: "caster",
};

const JOBS = [
  { id: "PLD", role: ROLE.TANK, subtype: null, name: { ja: "ナイト", en: "Paladin", ko: "나이트" } },
  { id: "WAR", role: ROLE.TANK, subtype: null, name: { ja: "戦士", en: "Warrior", ko: "전사" } },
  { id: "DRK", role: ROLE.TANK, subtype: null, name: { ja: "暗黒騎士", en: "Dark Knight", ko: "암흑기사" } },
  { id: "GNB", role: ROLE.TANK, subtype: null, name: { ja: "ガンブレイカー", en: "Gunbreaker", ko: "건브레이커" } },

  { id: "WHM", role: ROLE.HEALER, subtype: SUBTYPE.PURE, name: { ja: "白魔道士", en: "White Mage", ko: "백마도사" } },
  { id: "AST", role: ROLE.HEALER, subtype: SUBTYPE.PURE, name: { ja: "占星術師", en: "Astrologian", ko: "점성술사" } },
  { id: "SCH", role: ROLE.HEALER, subtype: SUBTYPE.BARRIER, name: { ja: "学者", en: "Scholar", ko: "학자" } },
  { id: "SGE", role: ROLE.HEALER, subtype: SUBTYPE.BARRIER, name: { ja: "賢者", en: "Sage", ko: "현자" } },

  { id: "MNK", role: ROLE.DPS, subtype: SUBTYPE.MELEE, name: { ja: "モンク", en: "Monk", ko: "몽크" } },
  { id: "DRG", role: ROLE.DPS, subtype: SUBTYPE.MELEE, name: { ja: "竜騎士", en: "Dragoon", ko: "용기사" } },
  { id: "NIN", role: ROLE.DPS, subtype: SUBTYPE.MELEE, name: { ja: "忍者", en: "Ninja", ko: "닌자" } },
  { id: "SAM", role: ROLE.DPS, subtype: SUBTYPE.MELEE, name: { ja: "侍", en: "Samurai", ko: "사무라이" } },
  { id: "RPR", role: ROLE.DPS, subtype: SUBTYPE.MELEE, name: { ja: "リーパー", en: "Reaper", ko: "리퍼" } },
  { id: "VPR", role: ROLE.DPS, subtype: SUBTYPE.MELEE, name: { ja: "ヴァイパー", en: "Viper", ko: "바이퍼" } },

  { id: "BRD", role: ROLE.DPS, subtype: SUBTYPE.RANGED, name: { ja: "吟遊詩人", en: "Bard", ko: "음유시인" } },
  { id: "MCH", role: ROLE.DPS, subtype: SUBTYPE.RANGED, name: { ja: "機工士", en: "Machinist", ko: "기공사" } },
  { id: "DNC", role: ROLE.DPS, subtype: SUBTYPE.RANGED, name: { ja: "踊り子", en: "Dancer", ko: "무도가" } },

  { id: "BLM", role: ROLE.DPS, subtype: SUBTYPE.CASTER, name: { ja: "黒魔道士", en: "Black Mage", ko: "흑마도사" } },
  { id: "SMN", role: ROLE.DPS, subtype: SUBTYPE.CASTER, name: { ja: "召喚士", en: "Summoner", ko: "소환사" } },
  { id: "RDM", role: ROLE.DPS, subtype: SUBTYPE.CASTER, name: { ja: "赤魔道士", en: "Red Mage", ko: "적마도사" } },
  { id: "PCT", role: ROLE.DPS, subtype: SUBTYPE.CASTER, name: { ja: "ピクトマンサー", en: "Pictomancer", ko: "픽토맨서" } },
];

const JOBS_BY_ID = Object.fromEntries(JOBS.map((job) => [job.id, job]));

function jobIconUrl(jobId) {
  return `assets/icons/jobs/${jobId}.png`;
}

function jobName(job) {
  return job.name[getLocale()] || job.name.ja;
}

const JOB_GROUPS = [
  { labelKey: "jobGroup.tank", jobs: JOBS.filter((j) => j.role === ROLE.TANK) },
  { labelKey: "jobGroup.healerPure", jobs: JOBS.filter((j) => j.role === ROLE.HEALER && j.subtype === SUBTYPE.PURE) },
  { labelKey: "jobGroup.healerBarrier", jobs: JOBS.filter((j) => j.role === ROLE.HEALER && j.subtype === SUBTYPE.BARRIER) },
  { labelKey: "jobGroup.dpsMelee", jobs: JOBS.filter((j) => j.role === ROLE.DPS && j.subtype === SUBTYPE.MELEE) },
  { labelKey: "jobGroup.dpsRanged", jobs: JOBS.filter((j) => j.role === ROLE.DPS && j.subtype === SUBTYPE.RANGED) },
  { labelKey: "jobGroup.dpsCaster", jobs: JOBS.filter((j) => j.role === ROLE.DPS && j.subtype === SUBTYPE.CASTER) },
];
