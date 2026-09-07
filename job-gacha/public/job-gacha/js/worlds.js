// FFXIV ワールド一覧(データセンターごとにグループ化)
// 出典: Lodestone ワールドステータスページ(物理データセンター全地域)
const WORLD_GROUPS = [
  {
    region: "日本",
    dataCenters: [
      { dc: "Elemental", worlds: ["Aegis", "Atomos", "Carbuncle", "Garuda", "Gungnir", "Kujata", "Tonberry", "Typhon"] },
      { dc: "Gaia", worlds: ["Alexander", "Bahamut", "Durandal", "Fenrir", "Ifrit", "Ridill", "Tiamat", "Ultima"] },
      { dc: "Mana", worlds: ["Anima", "Asura", "Chocobo", "Hades", "Ixion", "Masamune", "Pandaemonium", "Titan"] },
      { dc: "Meteor", worlds: ["Belias", "Mandragora", "Ramuh", "Shinryu", "Unicorn", "Valefor", "Yojimbo", "Zeromus"] },
    ],
  },
  {
    region: "北米",
    dataCenters: [
      { dc: "Aether", worlds: ["Adamantoise", "Cactuar", "Faerie", "Gilgamesh", "Jenova", "Midgardsormr", "Sargatanas", "Siren"] },
      { dc: "Crystal", worlds: ["Balmung", "Brynhildr", "Coeurl", "Diabolos", "Goblin", "Malboro", "Mateus", "Zalera"] },
      { dc: "Dynamis", worlds: ["Cuchulainn", "Golem", "Halicarnassus", "Kraken", "Maduin", "Marilith", "Rafflesia", "Seraph"] },
      { dc: "Primal", worlds: ["Behemoth", "Excalibur", "Exodus", "Famfrit", "Hyperion", "Lamia", "Leviathan", "Ultros"] },
    ],
  },
  {
    region: "欧州",
    dataCenters: [
      { dc: "Chaos", worlds: ["Cerberus", "Louisoix", "Moogle", "Omega", "Phantom", "Ragnarok", "Sagittarius", "Spriggan"] },
      { dc: "Light", worlds: ["Alpha", "Lich", "Odin", "Phoenix", "Raiden", "Shiva", "Twintania", "Zodiark"] },
    ],
  },
  {
    region: "オセアニア",
    dataCenters: [{ dc: "Materia", worlds: ["Bismarck", "Ravana", "Sephirot", "Sophia", "Zurvan"] }],
  },
];
