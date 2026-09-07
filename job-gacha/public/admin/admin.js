const ADMIN_KEY_STORAGE_KEY = "mametools:adminKey";

function getSavedAdminKey() {
  try {
    return localStorage.getItem(ADMIN_KEY_STORAGE_KEY);
  } catch (err) {
    return null;
  }
}

function saveAdminKey(key) {
  try {
    localStorage.setItem(ADMIN_KEY_STORAGE_KEY, key);
  } catch (err) {
    // localStorageが使えなくても続行(次回ログインが必要になるだけ)
  }
}

function clearAdminKey() {
  try {
    localStorage.removeItem(ADMIN_KEY_STORAGE_KEY);
  } catch (err) {
    // noop
  }
}

async function adminFetch(path, key, options = {}) {
  const res = await fetch(`${MAME_TOOLS_API}${path}`, {
    ...options,
    headers: { "X-Admin-Key": key, ...(options.headers || {}) },
  });
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error("request failed");
  return res.json();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDateTime(unixSeconds) {
  return new Date(unixSeconds * 1000).toLocaleString("ja-JP");
}

// ツールごとの詳細管理UI。対応するslugがあればここに登録する。
const TOOL_ADMIN_MODULES = {
  "job-gacha": renderJobGachaAdminSection,
};

function renderToolsList(tools, key) {
  const listEl = document.getElementById("tools-list");
  listEl.innerHTML = tools
    .map(
      (tool) => `
        <div class="admin-tool-row">
          <span class="admin-tool-icon">${tool.icon || "🔧"}</span>
          <span class="admin-tool-info">
            <span class="admin-tool-name">${escapeHtml(tool.name)}</span>
            <span class="admin-tool-slug">${escapeHtml(tool.slug)}</span>
          </span>
          <label class="checkbox admin-tool-publish">
            <input type="checkbox" data-slug="${escapeHtml(tool.slug)}" ${tool.published ? "checked" : ""}>
            公開
          </label>
        </div>
      `
    )
    .join("");

  listEl.querySelectorAll("input[data-slug]").forEach((input) => {
    input.addEventListener("change", async (e) => {
      const slug = e.target.dataset.slug;
      try {
        await adminFetch(`/admin/tools/${slug}`, key, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ published: e.target.checked }),
        });
      } catch (err) {
        e.target.checked = !e.target.checked;
        alert("更新に失敗しました");
      }
    });
  });

  const detailsEl = document.getElementById("tool-details");
  detailsEl.innerHTML = "";
  for (const tool of tools) {
    const render = TOOL_ADMIN_MODULES[tool.slug];
    if (!render) continue;
    const section = document.createElement("div");
    section.className = "panel admin-panel";
    detailsEl.appendChild(section);
    render(section, key, tool);
  }
}

async function renderJobGachaAdminSection(container, key) {
  container.innerHTML = `
    <h2 class="admin-section-title">🎲 ジョブガチャ</h2>
    <p id="jg-draw-count" class="admin-stat">総抽選回数: -</p>
    <button id="jg-reload-draws-btn" type="button" class="btn-mini">再読み込み</button>
    <div id="jg-draws-list" class="admin-draws-list"></div>
  `;

  const loadDraws = async () => {
    const listEl = container.querySelector("#jg-draws-list");
    listEl.innerHTML = `<p class="loading">読み込み中...</p>`;
    try {
      const data = await adminFetch("/admin/job-gacha/draws?limit=100", key);
      container.querySelector("#jg-draw-count").textContent = `総抽選回数: ${data.count}回`;

      if (data.draws.length === 0) {
        listEl.innerHTML = `<p class="loading">まだ抽選履歴がありません</p>`;
        return;
      }

      listEl.innerHTML = data.draws
        .map((draw) => {
          const entries = draw.entries
            .map(
              (e) =>
                `<span class="admin-draw-entry">${escapeHtml(e.name)} <span class="admin-draw-arrow">→</span> ${escapeHtml(e.jobName)}(${escapeHtml(e.jobId)})</span>`
            )
            .join("");
          const flags = [
            `基準Lv${draw.levelThreshold ?? "-"}`,
            draw.noDuplicate ? "重複なし" : null,
            draw.excludeUnreleased ? "未開放除外" : null,
          ]
            .filter(Boolean)
            .join(" / ");
          return `
            <div class="admin-draw-row">
              <div class="admin-draw-meta">
                <span class="admin-draw-date">${formatDateTime(draw.createdAt)}</span>
                <span class="admin-draw-flags">${escapeHtml(flags)}</span>
              </div>
              <div class="admin-draw-entries">${entries}</div>
            </div>
          `;
        })
        .join("");
    } catch (err) {
      listEl.innerHTML = `<p class="loading">読み込みに失敗しました</p>`;
    }
  };

  container.querySelector("#jg-reload-draws-btn").addEventListener("click", loadDraws);
  await loadDraws();
}

async function showAdminContent(key) {
  const errorEl = document.getElementById("admin-login-error");
  errorEl.hidden = true;
  try {
    const data = await adminFetch("/admin/tools", key);
    renderToolsList(data.tools, key);
    document.getElementById("login-panel").hidden = true;
    document.getElementById("admin-content").hidden = false;
    saveAdminKey(key);
  } catch (err) {
    clearAdminKey();
    errorEl.textContent = "Admin Keyが正しくありません";
    errorEl.hidden = false;
  }
}

function init() {
  const savedKey = getSavedAdminKey();
  if (savedKey) showAdminContent(savedKey);

  document.getElementById("admin-login-btn").addEventListener("click", () => {
    const key = document.getElementById("admin-key-input").value.trim();
    if (key) showAdminContent(key);
  });
  document.getElementById("admin-key-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("admin-login-btn").click();
  });

  document.getElementById("admin-logout-btn").addEventListener("click", () => {
    clearAdminKey();
    document.getElementById("admin-content").hidden = true;
    document.getElementById("login-panel").hidden = false;
    document.getElementById("admin-key-input").value = "";
  });
}

document.addEventListener("DOMContentLoaded", init);
