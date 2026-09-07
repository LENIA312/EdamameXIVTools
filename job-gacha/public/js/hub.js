const MAME_TOOLS_API = "https://mame-tools-api.pisorium.workers.dev";

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function loadTools() {
  const container = document.getElementById("hub-tools");
  try {
    const res = await fetch(`${MAME_TOOLS_API}/tools`);
    if (!res.ok) throw new Error("failed");
    const data = await res.json();

    if (!data.tools || data.tools.length === 0) {
      container.innerHTML = `<p class="loading">まだツールがありません</p>`;
      return;
    }

    container.innerHTML = data.tools
      .map(
        (tool) => `
          <a class="tool-card" href="${escapeHtml(tool.url)}">
            <span class="tool-card-icon">${tool.icon || "🔧"}</span>
            <span class="tool-card-body">
              <span class="tool-card-title">${escapeHtml(tool.name)}</span>
              <span class="tool-card-desc">${escapeHtml(tool.description)}</span>
            </span>
          </a>
        `
      )
      .join("");
  } catch (err) {
    container.innerHTML = `<p class="loading">ツール一覧の読み込みに失敗しました</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadTools);
