// まめツール共通APIのベースURL
const MAME_TOOLS_API = "https://mame-tools-api.pisorium.workers.dev";
const ADMIN_COOKIE_NAME = "mametools_admin";

// 管理者自身のアクセスをページビュー集計から除外するための目印Cookie。
// path=/ を指定し、他ツールのページ(同一オリジンの別パス)からも見えるようにする。
function setAdminCookie() {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${ADMIN_COOKIE_NAME}=1; path=/; max-age=${oneYear}; SameSite=Lax; Secure`;
}
