// まめツール共通API(公開設定・抽選ログ)クライアント
const MAME_TOOLS_API = "https://mame-tools-api.pisorium.workers.dev";

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
