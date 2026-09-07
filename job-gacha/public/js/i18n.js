// 言語切り替え(共有: ハブ / 各ツール共通。管理ページでは使用しない)
const LOCALES = ["ja", "en", "ko"];
const LOCALE_LABELS = { ja: "日本語", en: "English", ko: "한국어" };
const LOCALE_STORAGE_KEY = "mametools:locale";

function detectDefaultLocale() {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && LOCALES.includes(saved)) return saved;
  } catch (err) {
    // noop
  }
  const nav = (navigator.language || "ja").toLowerCase();
  if (nav.startsWith("en")) return "en";
  if (nav.startsWith("ko")) return "ko";
  return "ja";
}

let currentLocale = detectDefaultLocale();

function getLocale() {
  return currentLocale;
}

function setLocale(locale) {
  if (!LOCALES.includes(locale) || locale === currentLocale) return;
  currentLocale = locale;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch (err) {
    // noop
  }
  document.documentElement.lang = locale;
  document.querySelectorAll(".locale-switcher [data-locale]").forEach((btn) => {
    btn.classList.toggle("locale-btn-active", btn.dataset.locale === locale);
  });
  applyStaticI18n();
  if (typeof onLocaleChange === "function") onLocaleChange();
}

function t(key, vars) {
  const dict = I18N[currentLocale] || I18N.ja;
  let str = dict[key] ?? I18N.ja[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replaceAll(`{${k}}`, v);
    }
  }
  return str;
}

// <html lang> と data-i18n / data-i18n-placeholder 属性を持つ静的要素をまとめて更新
function applyStaticI18n() {
  document.documentElement.lang = currentLocale;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.setAttribute("title", t(el.dataset.i18nTitle));
  });
}

function localeSwitcherMarkup() {
  return LOCALES.map(
    (loc) =>
      `<button type="button" class="locale-btn${loc === currentLocale ? " locale-btn-active" : ""}" data-locale="${loc}">${loc.toUpperCase()}</button>`
  ).join("");
}

function initLocaleSwitchers() {
  document.querySelectorAll(".locale-switcher").forEach((el) => {
    el.innerHTML = localeSwitcherMarkup();
  });
  document.querySelectorAll(".locale-switcher [data-locale]").forEach((btn) => {
    btn.addEventListener("click", () => setLocale(btn.dataset.locale));
  });
}

const I18N = {
  ja: {
    "hub.title": "まめツール",
    "hub.subtitle": "まめなツールをまとめたツール置き場",
    "hub.loading": "読み込み中...",
    "hub.noTools": "まだツールがありません",
    "hub.loadError": "ツール一覧の読み込みに失敗しました",

    "app.title": "ジョブルーレット",
    "app.hubLink": "← まめツール",
    "level.label": "基準レベル",
    "level.optimalBtn": "全員の最適レベル適用",
    "role.changeBtn": "構成変更",
    "toolbar.resetAll": "キャラクターを全リセット",
    "toolbar.rosterHistory": "編成履歴から選ぶ",
    "options.noDuplicate": "ジョブ重複なし",
    "options.excludeUnreleased": "未開放ジョブを除外",
    "draw.button": "抽選開始",
    "draw.shareButton": "結果をシェア",
    "draw.errorNoCharacters": "キャラクターを1人以上選択してください",
    "draw.errorDuplicateCharacter": "同じキャラクターは複数選択できません",
    "draw.errorInsufficientLevel": "{name} の条件(基準レベル・抽選対象設定)を満たすジョブがありません",
    "draw.errorNoCombination": "条件を満たす組み合わせが見つかりませんでした",
    "share.saved": "画像を保存しました。SNS等に添付してシェアしてください",
    "share.failed": "画像の生成に失敗しました",

    "char.searchTitle": "キャラクター検索",
    "char.placeholder": "＋ キャラクターを検索",
    "char.namePlaceholder": "キャラクター名",
    "char.worldAll": "すべてのワールドから検索(任意)",
    "char.searchBtn": "検索",
    "char.nameRequired": "キャラクター名を入力してください",
    "char.searching": "検索中...",
    "char.noResults": "該当するキャラクターが見つかりませんでした",
    "char.searchFailed": "検索に失敗しました。時間をおいて再度お試しください",
    "char.recentlyUsed": "最近使用したキャラクター",
    "char.fetchFailed": "キャラクター情報の取得に失敗しました",
    "char.settingsTooltip": "抽選対象ジョブ設定",
    "char.clearTooltip": "クリア",

    "roster.title": "編成履歴",
    "roster.empty": "まだ履歴がありません",
    "common.close": "閉じる",

    "jobs.modalTitle": "{name} の抽選対象ジョブ",
    "jobs.selectAll": "全選択",
    "jobs.deselectAll": "全解除",
    "jobs.groupSelect": "選択",
    "jobs.groupDeselect": "解除",

    "jobGroup.tank": "タンク",
    "jobGroup.healerPure": "純ヒーラー",
    "jobGroup.healerBarrier": "バリアヒーラー",
    "jobGroup.dpsMelee": "近接DPS",
    "jobGroup.dpsRanged": "遠隔物理DPS",
    "jobGroup.dpsCaster": "遠隔魔法DPS",

    "role.free": "自由",
    "role.tank": "タンク",
    "role.healer": "ヒーラー",
    "role.healerPure": "純ヒーラー",
    "role.healerBarrier": "バリアヒーラー",
    "role.dps": "DPS",
    "role.dpsMelee": "近接DPS",
    "role.dpsRanged": "遠隔物理DPS",
    "role.dpsCaster": "遠隔魔法DPS",

    "share.headerTitle": "ジョブルーレット 抽選結果",
    "share.footerBrand": "まめツール",

    "region.jp": "日本",
    "region.na": "北米",
    "region.eu": "欧州",
    "region.oce": "オセアニア",
  },
  en: {
    "hub.title": "Mame Tools",
    "hub.subtitle": "A little collection of handy tools",
    "hub.loading": "Loading...",
    "hub.noTools": "No tools yet",
    "hub.loadError": "Failed to load the tool list",

    "app.title": "Job Roulette",
    "app.hubLink": "← Mame Tools",
    "level.label": "Level Threshold",
    "level.optimalBtn": "Apply Best Level for All",
    "role.changeBtn": "Change Layout",
    "toolbar.resetAll": "Reset All Characters",
    "toolbar.rosterHistory": "Load Past Roster",
    "options.noDuplicate": "No Duplicate Jobs",
    "options.excludeUnreleased": "Exclude Unlearned Jobs",
    "draw.button": "Draw",
    "draw.shareButton": "Share Result",
    "draw.errorNoCharacters": "Select at least one character",
    "draw.errorDuplicateCharacter": "The same character can't be selected twice",
    "draw.errorInsufficientLevel": "{name} has no job meeting the current conditions (level threshold / job pool)",
    "draw.errorNoCombination": "No combination satisfies the current conditions",
    "share.saved": "Image saved. Attach it to your post to share!",
    "share.failed": "Failed to generate the image",

    "char.searchTitle": "Character Search",
    "char.placeholder": "＋ Search for a character",
    "char.namePlaceholder": "Character name",
    "char.worldAll": "Search all worlds (optional)",
    "char.searchBtn": "Search",
    "char.nameRequired": "Please enter a character name",
    "char.searching": "Searching...",
    "char.noResults": "No matching characters found",
    "char.searchFailed": "Search failed. Please try again later",
    "char.recentlyUsed": "Recently used characters",
    "char.fetchFailed": "Failed to fetch character data",
    "char.settingsTooltip": "Job pool settings",
    "char.clearTooltip": "Clear",

    "roster.title": "Roster History",
    "roster.empty": "No history yet",
    "common.close": "Close",

    "jobs.modalTitle": "{name}'s job pool",
    "jobs.selectAll": "Select all",
    "jobs.deselectAll": "Deselect all",
    "jobs.groupSelect": "Select",
    "jobs.groupDeselect": "Deselect",

    "jobGroup.tank": "Tank",
    "jobGroup.healerPure": "Pure Healer",
    "jobGroup.healerBarrier": "Barrier Healer",
    "jobGroup.dpsMelee": "Melee DPS",
    "jobGroup.dpsRanged": "Physical Ranged DPS",
    "jobGroup.dpsCaster": "Magical Ranged DPS",

    "role.free": "Free",
    "role.tank": "Tank",
    "role.healer": "Healer",
    "role.healerPure": "Pure Healer",
    "role.healerBarrier": "Barrier Healer",
    "role.dps": "DPS",
    "role.dpsMelee": "Melee DPS",
    "role.dpsRanged": "Physical Ranged DPS",
    "role.dpsCaster": "Magical Ranged DPS",

    "share.headerTitle": "Job Roulette Result",
    "share.footerBrand": "Mame Tools",

    "region.jp": "Japan",
    "region.na": "North America",
    "region.eu": "Europe",
    "region.oce": "Oceania",
  },
  ko: {
    "hub.title": "마메 툴즈",
    "hub.subtitle": "소소한 도구들을 모아둔 곳",
    "hub.loading": "불러오는 중...",
    "hub.noTools": "아직 도구가 없습니다",
    "hub.loadError": "도구 목록을 불러오지 못했습니다",

    "app.title": "잡 룰렛",
    "app.hubLink": "← 마메 툴즈",
    "level.label": "기준 레벨",
    "level.optimalBtn": "전원 최적 레벨 적용",
    "role.changeBtn": "구성 변경",
    "toolbar.resetAll": "캐릭터 전체 초기화",
    "toolbar.rosterHistory": "편성 기록에서 불러오기",
    "options.noDuplicate": "직업 중복 없음",
    "options.excludeUnreleased": "미해금 직업 제외",
    "draw.button": "추첨 시작",
    "draw.shareButton": "결과 공유",
    "draw.errorNoCharacters": "캐릭터를 1명 이상 선택해주세요",
    "draw.errorDuplicateCharacter": "같은 캐릭터는 중복 선택할 수 없습니다",
    "draw.errorInsufficientLevel": "{name}의 조건(기준 레벨 / 추첨 대상 설정)을 만족하는 직업이 없습니다",
    "draw.errorNoCombination": "조건을 만족하는 조합을 찾을 수 없습니다",
    "share.saved": "이미지를 저장했습니다. SNS 등에 첨부해서 공유해보세요",
    "share.failed": "이미지 생성에 실패했습니다",

    "char.searchTitle": "캐릭터 검색",
    "char.placeholder": "＋ 캐릭터 검색",
    "char.namePlaceholder": "캐릭터 이름",
    "char.worldAll": "모든 월드에서 검색(선택 사항)",
    "char.searchBtn": "검색",
    "char.nameRequired": "캐릭터 이름을 입력해주세요",
    "char.searching": "검색 중...",
    "char.noResults": "일치하는 캐릭터를 찾을 수 없습니다",
    "char.searchFailed": "검색에 실패했습니다. 잠시 후 다시 시도해주세요",
    "char.recentlyUsed": "최근 사용한 캐릭터",
    "char.fetchFailed": "캐릭터 정보를 가져오지 못했습니다",
    "char.settingsTooltip": "추첨 대상 직업 설정",
    "char.clearTooltip": "삭제",

    "roster.title": "편성 기록",
    "roster.empty": "아직 기록이 없습니다",
    "common.close": "닫기",

    "jobs.modalTitle": "{name}의 추첨 대상 직업",
    "jobs.selectAll": "전체 선택",
    "jobs.deselectAll": "전체 해제",
    "jobs.groupSelect": "선택",
    "jobs.groupDeselect": "해제",

    "jobGroup.tank": "탱커",
    "jobGroup.healerPure": "순수 힐러",
    "jobGroup.healerBarrier": "배리어 힐러",
    "jobGroup.dpsMelee": "근접 DPS",
    "jobGroup.dpsRanged": "물리 원거리 DPS",
    "jobGroup.dpsCaster": "마법 원거리 DPS",

    "role.free": "자유",
    "role.tank": "탱커",
    "role.healer": "힐러",
    "role.healerPure": "순수 힐러",
    "role.healerBarrier": "배리어 힐러",
    "role.dps": "DPS",
    "role.dpsMelee": "근접 DPS",
    "role.dpsRanged": "물리 원거리 DPS",
    "role.dpsCaster": "마법 원거리 DPS",

    "share.headerTitle": "잡 룰렛 결과",
    "share.footerBrand": "마메 툴즈",

    "region.jp": "일본",
    "region.na": "북미",
    "region.eu": "유럽",
    "region.oce": "오세아니아",
  },
};
