const ADMIN_KEY_STORAGE_KEY = "jobgacha:adminKey";

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

async function loadPublishState(key) {
  const data = await adminFetch("/admin/tools", key);
  const tool = data.tools.find((t) => t.slug === "job-gacha");
  document.getElementById("published-toggle").checked = !!tool?.published;
}

async function loadDraws(key) {
  const listEl = document.getElementById("draws-list");
  listEl.innerHTML = `<p class="loading">読み込み中...</p>`;

  const data = await adminFetch("/admin/job-gacha/draws?limit=100", key);
  document.getElementById("draw-count").textContent = `総抽選回数: ${data.count}回`;

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
}

async function showAdminContent(key) {
  const errorEl = document.getElementById("admin-login-error");
  errorEl.hidden = true;
  try {
    await Promise.all([loadPublishState(key), loadDraws(key)]);
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

  document.getElementById("reload-draws-btn").addEventListener("click", () => {
    const key = getSavedAdminKey();
    if (key) loadDraws(key);
  });

  document.getElementById("published-toggle").addEventListener("change", async (e) => {
    const key = getSavedAdminKey();
    const messageEl = document.getElementById("publish-message");
    try {
      await adminFetch("/admin/tools/job-gacha", key, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: e.target.checked }),
      });
      messageEl.textContent = e.target.checked ? "公開しました" : "非公開にしました";
      messageEl.hidden = false;
      setTimeout(() => { messageEl.hidden = true; }, 3000);
    } catch (err) {
      e.target.checked = !e.target.checked;
      messageEl.textContent = "更新に失敗しました";
      messageEl.hidden = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", init);
