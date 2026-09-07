function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderApp() {
  renderRoleIcons();
  renderCharacterList();
  updateDrawButtonState();
}

function updateDrawButtonState() {
  document.getElementById("draw-button").disabled = activeSlotCount() === 0;
}

function renderRoleIcons() {
  const container = document.getElementById("role-icons");
  const template = currentRoleTemplate();
  const count = activeSlotCount();

  container.innerHTML = "";
  for (let i = 0; i < MAX_SLOTS; i++) {
    const req = template[i];
    const enabled = i < count;
    const icon = document.createElement("button");
    icon.type = "button";
    icon.className = `role-icon ${SLOT_REQ_COLOR_CLASS[req]}${enabled ? "" : " role-icon-disabled"}`;
    icon.innerHTML = roleIconMarkup(req);
    icon.title = SLOT_REQ_LABEL[req];
    icon.disabled = !enabled;
    icon.addEventListener("click", () => cycleRoleSlot(i));
    container.appendChild(icon);
  }
}

function roleIconMarkup(req) {
  const entry = SLOT_REQ_ICON[req];
  if (!entry) return `<span class="role-icon-free">・</span>`;
  const corner = entry.corner ? `<span class="role-icon-corner">${entry.corner}</span>` : "";
  return `<img src="${entry.icon}" alt="${SLOT_REQ_LABEL[req]}" class="role-icon-img">${corner}`;
}

function renderCharacterList() {
  const container = document.getElementById("character-list");
  container.innerHTML = "";

  for (let i = 0; i < MAX_SLOTS; i++) {
    container.appendChild(renderCharacterRow(i));
  }
}

function renderCharacterRow(index) {
  const character = state.characters[index];
  const empty = !character.name;
  const row = document.createElement("div");
  row.className = `char-row${empty ? " char-row-empty" : ""}`;

  const avatar = document.createElement("button");
  avatar.type = "button";
  avatar.className = "avatar";
  avatar.title = "キャラクター検索";
  if (character.avatarUrl) {
    avatar.style.backgroundImage = `url("${character.avatarUrl}")`;
  }
  avatar.addEventListener("click", () => openSearchModal(index));
  row.appendChild(avatar);

  const nameField = document.createElement("button");
  nameField.type = "button";
  nameField.className = "name-field";
  if (empty) {
    nameField.innerHTML = `<span class="placeholder">＋ キャラクターを検索</span>`;
  } else {
    nameField.innerHTML = `<span class="char-name">${escapeHtml(character.name)}</span><span class="char-world">${escapeHtml(character.world)} [${escapeHtml(character.dataCenter)}]</span>`;
  }
  nameField.addEventListener("click", () => openSearchModal(index));
  row.appendChild(nameField);

  const resultBadge = document.createElement("div");
  resultBadge.className = "result-badge";
  const resultJobId = state.results[index];
  if (resultJobId) {
    const job = JOBS_BY_ID[resultJobId];
    resultBadge.innerHTML = `<img src="${jobIconUrl(job.id)}" alt="${job.id}" class="job-icon-img"><span class="job-name">${job.nameJa}</span>`;
  }
  row.appendChild(resultBadge);

  const settingsBtn = document.createElement("button");
  settingsBtn.type = "button";
  settingsBtn.className = "icon-btn";
  settingsBtn.title = "抽選ジョブ設定";
  settingsBtn.textContent = "⚙";
  settingsBtn.disabled = empty;
  settingsBtn.addEventListener("click", () => openJobsModal(index));
  row.appendChild(settingsBtn);

  if (!empty) {
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "icon-btn";
    clearBtn.title = "クリア";
    clearBtn.textContent = "×";
    clearBtn.addEventListener("click", () => clearSlot(index));
    row.appendChild(clearBtn);
  }

  return row;
}

function roleColorClassForJob(job) {
  if (job.role === ROLE.TANK) return "role-tank";
  if (job.role === ROLE.HEALER) return "role-healer";
  return "role-dps";
}

// ---- モーダル ----

function closeModal() {
  document.getElementById("modal-backdrop").hidden = true;
  document.getElementById("modal").innerHTML = "";
}

function openModal(contentEl) {
  const modal = document.getElementById("modal");
  modal.innerHTML = "";
  modal.appendChild(contentEl);
  document.getElementById("modal-backdrop").hidden = false;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("modal-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "modal-backdrop") closeModal();
  });
});

function openSearchModal(slotIndex) {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <h2>キャラクター検索</h2>
    <div class="search-form">
      <input id="search-name" type="text" placeholder="キャラクター名">
      <select id="search-region"></select>
      <input id="search-world" type="text" placeholder="ワールド名(任意)">
      <button id="search-submit" class="btn btn-primary">検索</button>
    </div>
    <p id="search-message" class="error" hidden></p>
    <div id="search-results" class="search-results"></div>
  `;

  const regionSelect = wrap.querySelector("#search-region");
  for (const region of LODESTONE_REGIONS) {
    const opt = document.createElement("option");
    opt.value = region.id;
    opt.textContent = region.label;
    regionSelect.appendChild(opt);
  }

  const submit = async () => {
    const name = wrap.querySelector("#search-name").value.trim();
    const region = regionSelect.value;
    const world = wrap.querySelector("#search-world").value.trim();
    const message = wrap.querySelector("#search-message");
    const resultsEl = wrap.querySelector("#search-results");
    message.hidden = true;
    resultsEl.innerHTML = "";

    if (!name) {
      message.textContent = "キャラクター名を入力してください";
      message.hidden = false;
      return;
    }

    resultsEl.innerHTML = `<p class="loading">検索中...</p>`;
    try {
      const results = await searchLodestoneCharacters(name, region, world);
      renderSearchResults(resultsEl, results, slotIndex, message);
    } catch (err) {
      resultsEl.innerHTML = "";
      message.textContent = "検索に失敗しました。時間をおいて再度お試しください";
      message.hidden = false;
    }
  };

  wrap.querySelector("#search-submit").addEventListener("click", submit);
  wrap.querySelector("#search-name").addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });

  openModal(wrap);
  wrap.querySelector("#search-name").focus();
}

function renderSearchResults(container, results, slotIndex, message) {
  if (results.length === 0) {
    container.innerHTML = `<p class="loading">該当するキャラクターが見つかりませんでした</p>`;
    return;
  }

  container.innerHTML = "";
  for (const result of results) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "search-result-item";
    item.innerHTML = `
      <span class="avatar avatar-small" style="background-image:url('${result.avatarUrl}')"></span>
      <span class="result-info">
        <span class="char-name">${escapeHtml(result.name)}</span>
        <span class="char-world">${escapeHtml(result.world)} [${escapeHtml(result.dataCenter)}]</span>
      </span>
    `;
    item.addEventListener("click", () => selectSearchResult(result, slotIndex, message));
    container.appendChild(item);
  }
}

async function selectSearchResult(result, slotIndex, message) {
  message.hidden = true;
  try {
    const detail = await fetchLodestoneCharacter(result.id);
    const outcome = assignCharacterToSlot(slotIndex, detail);
    if (!outcome.success) {
      message.textContent = outcome.error;
      message.hidden = false;
      return;
    }
    closeModal();
    renderApp();
  } catch (err) {
    message.textContent = "キャラクター情報の取得に失敗しました";
    message.hidden = false;
  }
}

function openJobsModal(slotIndex) {
  const character = state.characters[slotIndex];
  const wrap = document.createElement("div");
  wrap.innerHTML = `<h2>${escapeHtml(character.name)} の抽選対象ジョブ</h2>`;

  const grid = document.createElement("div");
  grid.className = "job-grid";

  for (const job of JOBS) {
    const level = character.jobLevels[job.id] ?? 0;
    const label = document.createElement("label");
    label.className = `job-check ${roleColorClassForJob(job)}`;
    const checked = !character.excludedJobIds.has(job.id);
    label.innerHTML = `
      <input type="checkbox" ${checked ? "checked" : ""}>
      <img src="${jobIconUrl(job.id)}" alt="${job.id}" class="job-icon-img job-icon-img-small">
      <span>${escapeHtml(job.nameJa)}</span>
      <span class="job-level">Lv.${level}</span>
    `;
    label.querySelector("input").addEventListener("change", () => {
      toggleJobExclusion(slotIndex, job.id);
    });
    grid.appendChild(label);
  }
  wrap.appendChild(grid);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "btn btn-primary";
  closeBtn.textContent = "閉じる";
  closeBtn.addEventListener("click", () => {
    closeModal();
    renderApp();
  });
  wrap.appendChild(closeBtn);

  openModal(wrap);
}
