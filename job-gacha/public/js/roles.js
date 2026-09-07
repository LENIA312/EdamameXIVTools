// ロール構成(スロットごとの役割要求)の定義

const SLOT_REQ = {
  FREE: "free",
  TANK: "tank",
  HEALER: "healer",
  HEALER_PURE: "healer-pure",
  HEALER_BARRIER: "healer-barrier",
  DPS: "dps",
  DPS_MELEE: "dps-melee",
  DPS_RANGED: "dps-ranged",
  DPS_CASTER: "dps-caster",
};

// 構成アイコンをクリックしたときに切り替わる順序
const SLOT_REQ_CYCLE = [
  SLOT_REQ.FREE,
  SLOT_REQ.TANK,
  SLOT_REQ.HEALER,
  SLOT_REQ.HEALER_PURE,
  SLOT_REQ.HEALER_BARRIER,
  SLOT_REQ.DPS,
  SLOT_REQ.DPS_MELEE,
  SLOT_REQ.DPS_RANGED,
  SLOT_REQ.DPS_CASTER,
];

const SLOT_REQ_LABEL = {
  [SLOT_REQ.FREE]: "自由",
  [SLOT_REQ.TANK]: "タンク",
  [SLOT_REQ.HEALER]: "ヒーラー",
  [SLOT_REQ.HEALER_PURE]: "純ヒーラー",
  [SLOT_REQ.HEALER_BARRIER]: "バリアヒーラー",
  [SLOT_REQ.DPS]: "DPS",
  [SLOT_REQ.DPS_MELEE]: "近接DPS",
  [SLOT_REQ.DPS_RANGED]: "遠隔物理DPS",
  [SLOT_REQ.DPS_CASTER]: "遠隔魔法DPS",
};

const SLOT_REQ_COLOR_CLASS = {
  [SLOT_REQ.FREE]: "role-free",
  [SLOT_REQ.TANK]: "role-tank",
  [SLOT_REQ.HEALER]: "role-healer",
  [SLOT_REQ.HEALER_PURE]: "role-healer",
  [SLOT_REQ.HEALER_BARRIER]: "role-healer",
  [SLOT_REQ.DPS]: "role-dps",
  [SLOT_REQ.DPS_MELEE]: "role-dps",
  [SLOT_REQ.DPS_RANGED]: "role-dps",
  [SLOT_REQ.DPS_CASTER]: "role-dps",
};

function nextSlotRequirement(current) {
  const index = SLOT_REQ_CYCLE.indexOf(current);
  return SLOT_REQ_CYCLE[(index + 1) % SLOT_REQ_CYCLE.length];
}

function jobMatchesRequirement(job, requirement) {
  switch (requirement) {
    case SLOT_REQ.FREE:
      return true;
    case SLOT_REQ.TANK:
      return job.role === ROLE.TANK;
    case SLOT_REQ.HEALER:
      return job.role === ROLE.HEALER;
    case SLOT_REQ.HEALER_PURE:
      return job.role === ROLE.HEALER && job.subtype === SUBTYPE.PURE;
    case SLOT_REQ.HEALER_BARRIER:
      return job.role === ROLE.HEALER && job.subtype === SUBTYPE.BARRIER;
    case SLOT_REQ.DPS:
      return job.role === ROLE.DPS;
    case SLOT_REQ.DPS_MELEE:
      return job.role === ROLE.DPS && job.subtype === SUBTYPE.MELEE;
    case SLOT_REQ.DPS_RANGED:
      return job.role === ROLE.DPS && job.subtype === SUBTYPE.RANGED;
    case SLOT_REQ.DPS_CASTER:
      return job.role === ROLE.DPS && job.subtype === SUBTYPE.CASTER;
    default:
      return false;
  }
}

function freeTemplate(size) {
  return Array.from({ length: size }, () => SLOT_REQ.FREE);
}

// 推奨編成プリセット(4人=THDD、8人=TTHH(純/バリア)DDDD(近接近接遠隔魔法))
function recommendedTemplate(size) {
  if (size === 4) {
    return [SLOT_REQ.TANK, SLOT_REQ.HEALER, SLOT_REQ.DPS, SLOT_REQ.DPS];
  }
  if (size === 8) {
    return [
      SLOT_REQ.TANK,
      SLOT_REQ.TANK,
      SLOT_REQ.HEALER_PURE,
      SLOT_REQ.HEALER_BARRIER,
      SLOT_REQ.DPS_MELEE,
      SLOT_REQ.DPS_MELEE,
      SLOT_REQ.DPS_RANGED,
      SLOT_REQ.DPS_CASTER,
    ];
  }
  return freeTemplate(size);
}

function hasRecommendedTemplate(size) {
  return size === 4 || size === 8;
}
