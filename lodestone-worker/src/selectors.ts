// CSS selectors sourced from https://github.com/xivapi/lodestone-css-selectors
// (profile/classjob.json and search/character.json), the community-maintained
// reference for Lodestone's HTML structure.

export const JOB_LEVEL_SELECTORS: Record<string, string> = {
  // Tank
  PLD: ".character__content > div:nth-child(2) > div:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > div:nth-child(2)",
  WAR: ".character__content > div:nth-child(2) > div:nth-child(1) > ul:nth-child(2) > li:nth-child(2) > div:nth-child(2)",
  DRK: ".character__content > div:nth-child(2) > div:nth-child(1) > ul:nth-child(2) > li:nth-child(3) > div:nth-child(2)",
  GNB: ".character__content > div:nth-child(2) > div:nth-child(1) > ul:nth-child(2) > li:nth-child(4) > div:nth-child(2)",
  // Healer
  WHM: ".character__content > div:nth-child(2) > div:nth-child(2) > ul:nth-child(2) > li:nth-child(1) > div:nth-child(2)",
  SCH: ".character__content > div:nth-child(2) > div:nth-child(2) > ul:nth-child(2) > li:nth-child(2) > div:nth-child(2)",
  AST: ".character__content > div:nth-child(2) > div:nth-child(2) > ul:nth-child(2) > li:nth-child(3) > div:nth-child(2)",
  SGE: ".character__content > div:nth-child(2) > div:nth-child(2) > ul:nth-child(2) > li:nth-child(4) > div:nth-child(2)",
  // Melee DPS
  MNK: "div.clearfix:nth-child(3) > div:nth-child(1) > ul:nth-child(2) > li:nth-child(1) > div:nth-child(2)",
  DRG: "div.clearfix:nth-child(3) > div:nth-child(1) > ul:nth-child(2) > li:nth-child(2) > div:nth-child(2)",
  NIN: "div.clearfix:nth-child(3) > div:nth-child(1) > ul:nth-child(2) > li:nth-child(3) > div:nth-child(2)",
  SAM: "div.clearfix:nth-child(3) > div:nth-child(1) > ul:nth-child(2) > li:nth-child(4) > div:nth-child(2)",
  RPR: "div.clearfix:nth-child(3) > div:nth-child(1) > ul:nth-child(2) > li:nth-child(5) > div:nth-child(2)",
  VPR: "div.clearfix:nth-child(3) > div:nth-child(1) > ul:nth-child(2) > li:nth-child(6) > div:nth-child(2)",
  // Physical ranged DPS
  BRD: "div.clearfix:nth-child(3) > div:nth-child(2) > ul:nth-child(2) > li:nth-child(1) > div:nth-child(2)",
  MCH: "div.clearfix:nth-child(3) > div:nth-child(2) > ul:nth-child(2) > li:nth-child(2) > div:nth-child(2)",
  DNC: "div.clearfix:nth-child(3) > div:nth-child(2) > ul:nth-child(2) > li:nth-child(3) > div:nth-child(2)",
  // Magical ranged DPS
  BLM: "ul.character__job:nth-child(4) > li:nth-child(1) > div:nth-child(2)",
  SMN: "ul.character__job:nth-child(4) > li:nth-child(2) > div:nth-child(2)",
  RDM: "ul.character__job:nth-child(4) > li:nth-child(3) > div:nth-child(2)",
  PCT: "ul.character__job:nth-child(4) > li:nth-child(4) > div:nth-child(2)",
};

export const PROFILE_SELECTORS = {
  name: "div.frame__chara__box:nth-child(2) > .frame__chara__name",
  avatar: ".frame__chara__face > img:nth-child(1)",
  server: "p.frame__chara__world",
};

export const SEARCH_SELECTORS = {
  entry: "div.entry",
  avatar: ".entry__chara__face > img",
  link: ".entry__link",
  name: ".entry__name",
  world: ".entry__world",
};
