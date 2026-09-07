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
  { id: "PLD", nameJa: "ナイト", role: ROLE.TANK, subtype: null },
  { id: "WAR", nameJa: "戦士", role: ROLE.TANK, subtype: null },
  { id: "DRK", nameJa: "暗黒騎士", role: ROLE.TANK, subtype: null },
  { id: "GNB", nameJa: "ガンブレイカー", role: ROLE.TANK, subtype: null },

  { id: "WHM", nameJa: "白魔道士", role: ROLE.HEALER, subtype: SUBTYPE.PURE },
  { id: "AST", nameJa: "占星術師", role: ROLE.HEALER, subtype: SUBTYPE.PURE },
  { id: "SCH", nameJa: "学者", role: ROLE.HEALER, subtype: SUBTYPE.BARRIER },
  { id: "SGE", nameJa: "賢者", role: ROLE.HEALER, subtype: SUBTYPE.BARRIER },

  { id: "MNK", nameJa: "モンク", role: ROLE.DPS, subtype: SUBTYPE.MELEE },
  { id: "DRG", nameJa: "竜騎士", role: ROLE.DPS, subtype: SUBTYPE.MELEE },
  { id: "NIN", nameJa: "忍者", role: ROLE.DPS, subtype: SUBTYPE.MELEE },
  { id: "SAM", nameJa: "侍", role: ROLE.DPS, subtype: SUBTYPE.MELEE },
  { id: "RPR", nameJa: "リーパー", role: ROLE.DPS, subtype: SUBTYPE.MELEE },
  { id: "VPR", nameJa: "ヴァイパー", role: ROLE.DPS, subtype: SUBTYPE.MELEE },

  { id: "BRD", nameJa: "吟遊詩人", role: ROLE.DPS, subtype: SUBTYPE.RANGED },
  { id: "MCH", nameJa: "機工士", role: ROLE.DPS, subtype: SUBTYPE.RANGED },
  { id: "DNC", nameJa: "踊り子", role: ROLE.DPS, subtype: SUBTYPE.RANGED },

  { id: "BLM", nameJa: "黒魔道士", role: ROLE.DPS, subtype: SUBTYPE.CASTER },
  { id: "SMN", nameJa: "召喚士", role: ROLE.DPS, subtype: SUBTYPE.CASTER },
  { id: "RDM", nameJa: "赤魔道士", role: ROLE.DPS, subtype: SUBTYPE.CASTER },
  { id: "PCT", nameJa: "ピクトマンサー", role: ROLE.DPS, subtype: SUBTYPE.CASTER },
];

const JOBS_BY_ID = Object.fromEntries(JOBS.map((job) => [job.id, job]));

const JOB_GROUPS = [
  { label: "タンク", jobs: JOBS.filter((j) => j.role === ROLE.TANK) },
  { label: "純ヒーラー", jobs: JOBS.filter((j) => j.role === ROLE.HEALER && j.subtype === SUBTYPE.PURE) },
  { label: "バリアヒーラー", jobs: JOBS.filter((j) => j.role === ROLE.HEALER && j.subtype === SUBTYPE.BARRIER) },
  { label: "近接DPS", jobs: JOBS.filter((j) => j.role === ROLE.DPS && j.subtype === SUBTYPE.MELEE) },
  { label: "遠隔物理DPS", jobs: JOBS.filter((j) => j.role === ROLE.DPS && j.subtype === SUBTYPE.RANGED) },
  { label: "遠隔魔法DPS", jobs: JOBS.filter((j) => j.role === ROLE.DPS && j.subtype === SUBTYPE.CASTER) },
];

function jobIconUrl(jobId) {
  return `assets/icons/jobs/${jobId}.png`;
}
