function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function onLocaleChange() {
  loadTools();
}

async function loadTools() {
  const container = document.getElementById("hub-tools");
  container.innerHTML = `<p class="loading">${t("hub.loading")}</p>`;
  try {
    const url = new URL(`${MAME_TOOLS_API}/tools`);
    if (getLocale() !== "ja") url.searchParams.set("locale", getLocale());
    const res = await fetch(url);
    if (!res.ok) throw new Error("failed");
    const data = await res.json();

    if (!data.tools || data.tools.length === 0) {
      container.innerHTML = `<p class="loading">${t("hub.noTools")}</p>`;
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
    container.innerHTML = `<p class="loading">${t("hub.loadError")}</p>`;
  }
}

function init() {
  applyStaticI18n();
  initLocaleSwitchers();
  loadTools();
}

document.addEventListener("DOMContentLoaded", init);
