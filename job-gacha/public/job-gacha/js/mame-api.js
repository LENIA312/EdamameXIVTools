// まめツール共通API(公開設定・抽選ログ・アクセス数)クライアント
const MAME_TOOLS_API = "https://mame-tools-api.pisorium.workers.dev";
const ADMIN_COOKIE_NAME = "mametools_admin";

function hasAdminCookie() {
  return document.cookie.split("; ").some((c) => c.startsWith(`${ADMIN_COOKIE_NAME}=`));
}

function recordPageview(slug) {
  if (hasAdminCookie()) return;
  fetch(`${MAME_TOOLS_API}/pageview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  }).catch(() => {});
}

function recordJobGachaDraw(settings, entries) {
  // 記録に失敗してもガチャ自体の体験は妨げない(fire-and-forget)
  fetch(`${MAME_TOOLS_API}/job-gacha/draws`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      levelThreshold: settings.levelThreshold,
      noDuplicate: settings.noDuplicateJobs,
      excludeUnreleased: settings.excludeUnreleased,
      entries,
    }),
  }).catch(() => {});
}
