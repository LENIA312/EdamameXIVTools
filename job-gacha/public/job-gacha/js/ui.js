function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function onLocaleChange() {
  renderApp();
}

function renderApp() {
  renderRoleIcons();
  renderCharacterList();
  updateDrawButtonState();
}

function updateDrawButtonState() {
  document.getElementById("draw-button").disabled = activeSlotCount() === 0;
  const hasResults = state.results.some((jobId) => jobId);
  document.getElementById("share-button").hidden = !hasResults;
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
    icon.title = slotReqLabel(req);
    icon.disabled = !enabled;
    icon.addEventListener("click", () => cycleRoleSlot(i));
    container.appendChild(icon);
  }
}

function roleIconMarkup(req) {
  const entry = SLOT_REQ_ICON[req];
  if (!entry) return `<span class="role-icon-free">${t("role.free")}</span>`;
  const cornerText = HEALER_CORNER_LABEL[req]?.[getLocale()];
  const corner = cornerText ? `<span class="role-icon-corner">${cornerText}</span>` : "";
  return `<img src="${entry.icon}" alt="${slotReqLabel(req)}" class="role-icon-img">${corner}`;
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
  avatar.title = t("char.searchTitle");
  if (character.avatarUrl) {
    avatar.style.backgroundImage = `url("${character.avatarUrl}")`;
  }
  avatar.addEventListener("click", () => openSearchModal(index));
  row.appendChild(avatar);

  const nameField = document.createElement("button");
  nameField.type = "button";
  nameField.className = "name-field";
  if (empty) {
    nameField.innerHTML = `<span class="placeholder">${t("char.placeholder")}</span>`;
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
    resultBadge.innerHTML = `<span class="job-name">${escapeHtml(jobName(job))}</span><img src="${jobIconUrl(job.id)}" alt="${job.id}" class="job-icon-img">`;
  }
  row.appendChild(resultBadge);

  const settingsBtn = document.createElement("button");
  settingsBtn.type = "button";
  settingsBtn.className = "icon-btn";
  settingsBtn.title = t("char.settingsTooltip");
  settingsBtn.textContent = "⚙";
  settingsBtn.disabled = empty;
  settingsBtn.addEventListener("click", () => openJobsModal(index));
  row.appendChild(settingsBtn);

  if (!empty) {
    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "icon-btn";
    clearBtn.title = t("char.clearTooltip");
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

function worldSelectOptionsMarkup() {
  return WORLD_GROUPS.map((group) => {
    const dcOptions = group.dataCenters
      .map(
        (dc) =>
          `<optgroup label="${escapeHtml(t(group.regionKey))} / ${escapeHtml(dc.dc)}">` +
          dc.worlds.map((w) => `<option value="${escapeHtml(w)}">${escapeHtml(w)}</option>`).join("") +
          `</optgroup>`
      )
      .join("");
    return dcOptions;
  }).join("");
}

function openSearchModal(slotIndex) {
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <h2>${t("char.searchTitle")}</h2>
    <div class="search-form">
      <input id="search-name" type="text" placeholder="${t("char.namePlaceholder")}">
      <div class="search-form-row">
        <select id="search-world">
          <option value="">${t("char.worldAll")}</option>
          ${worldSelectOptionsMarkup()}
        </select>
        <button id="search-submit" class="btn btn-primary">${t("char.searchBtn")}</button>
      </div>
    </div>
    <p id="search-message" class="error" hidden></p>
    <div id="character-history" class="character-history"></div>
    <div id="search-results" class="search-results"></div>
  `;

  const message = wrap.querySelector("#search-message");
  const historyEl = wrap.querySelector("#character-history");
  renderCharacterHistoryList(historyEl, slotIndex, message);

  const submit = async () => {
    const name = wrap.querySelector("#search-name").value.trim();
    const world = wrap.querySelector("#search-world").value;
    const resultsEl = wrap.querySelector("#search-results");
    message.hidden = true;
    resultsEl.innerHTML = "";

    if (!name) {
      message.textContent = t("char.nameRequired");
      message.hidden = false;
      return;
    }

    historyEl.hidden = true;
    resultsEl.innerHTML = `<p class="loading">${t("char.searching")}</p>`;
    try {
      const results = await searchLodestoneCharacters(name, world);
      renderSearchResults(resultsEl, results, slotIndex, message);
    } catch (err) {
      resultsEl.innerHTML = "";
      message.textContent = t("char.searchFailed");
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

function renderCharacterHistoryList(container, slotIndex, message) {
  const history = loadCharacterHistory();
  if (history.length === 0) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = `<p class="history-label">${t("char.recentlyUsed")}</p>`;
  const list = document.createElement("div");
  list.className = "search-results";
  for (const stored of history) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "search-result-item";
    item.innerHTML = `
      <span class="avatar avatar-small" style="background-image:url('${stored.avatarUrl}')"></span>
      <span class="result-info">
        <span class="char-name">${escapeHtml(stored.name)}</span>
        <span class="char-world">${escapeHtml(stored.world)} [${escapeHtml(stored.dataCenter)}]</span>
      </span>
    `;
    item.addEventListener("click", () => {
      const outcome = assignCharacterToSlot(slotIndex, stored);
      if (!outcome.success) {
        message.textContent = outcome.error;
        message.hidden = false;
        return;
      }
      recordCharacterHistory(stored);
      closeModal();
      renderApp();
    });
    list.appendChild(item);
  }
  container.appendChild(list);
}

function renderSearchResults(container, results, slotIndex, message) {
  if (results.length === 0) {
    container.innerHTML = `<p class="loading">${t("char.noResults")}</p>`;
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
    recordCharacterHistory(detail);
    closeModal();
    renderApp();
  } catch (err) {
    message.textContent = t("char.fetchFailed");
    message.hidden = false;
  }
}

function openRosterHistoryModal() {
  const wrap = document.createElement("div");
  wrap.innerHTML = `<h2>${t("roster.title")}</h2>`;

  const history = loadRosterHistory();
  if (history.length === 0) {
    const empty = document.createElement("p");
    empty.className = "loading";
    empty.textContent = t("roster.empty");
    wrap.appendChild(empty);
  } else {
    const list = document.createElement("div");
    list.className = "roster-history-list";
    history.forEach((entry) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "roster-history-item";
      const names = entry.characters.map((c) => escapeHtml(c.name)).join(" / ");
      const date = new Date(entry.savedAt);
      item.innerHTML = `
        <span class="roster-history-names">${names}</span>
        <span class="roster-history-date">${date.toLocaleString()}</span>
      `;
      item.addEventListener("click", () => {
        applyRosterHistoryEntry(entry);
        closeModal();
        renderApp();
      });
      list.appendChild(item);
    });
    wrap.appendChild(list);
  }

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "btn btn-primary";
  closeBtn.textContent = t("common.close");
  closeBtn.addEventListener("click", () => closeModal());
  wrap.appendChild(closeBtn);

  openModal(wrap);
}

function openJobsModal(slotIndex) {
  const character = state.characters[slotIndex];
  const wrap = document.createElement("div");
  wrap.innerHTML = `<h2>${t("jobs.modalTitle", { name: escapeHtml(character.name) })}</h2>`;

  const refreshChecks = () => {
    wrap.querySelectorAll(".job-check input").forEach((input) => {
      input.checked = !character.excludedJobIds.has(input.dataset.jobId);
    });
  };

  const bulkRow = document.createElement("div");
  bulkRow.className = "job-bulk-row";
  bulkRow.innerHTML = `
    <button type="button" class="link-btn" data-action="select-all">${t("jobs.selectAll")}</button>
    <button type="button" class="link-btn" data-action="deselect-all">${t("jobs.deselectAll")}</button>
  `;
  bulkRow.querySelector('[data-action="select-all"]').addEventListener("click", () => {
    character.excludedJobIds.clear();
    invalidateResults();
    refreshChecks();
  });
  bulkRow.querySelector('[data-action="deselect-all"]').addEventListener("click", () => {
    JOBS.forEach((job) => character.excludedJobIds.add(job.id));
    invalidateResults();
    refreshChecks();
  });
  wrap.appendChild(bulkRow);

  for (const group of JOB_GROUPS) {
    const section = document.createElement("div");
    section.className = "job-group";

    const header = document.createElement("div");
    header.className = "job-group-header";
    header.innerHTML = `
      <span class="job-group-title">${t(group.labelKey)}</span>
      <span class="job-group-actions">
        <button type="button" class="link-btn" data-action="select">${t("jobs.groupSelect")}</button>
        <button type="button" class="link-btn" data-action="deselect">${t("jobs.groupDeselect")}</button>
      </span>
    `;
    header.querySelector('[data-action="select"]').addEventListener("click", () => {
      group.jobs.forEach((job) => character.excludedJobIds.delete(job.id));
      invalidateResults();
      refreshChecks();
    });
    header.querySelector('[data-action="deselect"]').addEventListener("click", () => {
      group.jobs.forEach((job) => character.excludedJobIds.add(job.id));
      invalidateResults();
      refreshChecks();
    });
    section.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "job-grid";
    for (const job of group.jobs) {
      const level = character.jobLevels[job.id] ?? 0;
      const label = document.createElement("label");
      label.className = `job-check ${roleColorClassForJob(job)}`;
      const checked = !character.excludedJobIds.has(job.id);
      label.innerHTML = `
        <input type="checkbox" data-job-id="${job.id}" ${checked ? "checked" : ""}>
        <img src="${jobIconUrl(job.id)}" alt="${job.id}" class="job-icon-img job-icon-img-small">
        <span>${escapeHtml(jobName(job))}</span>
        <span class="job-level">Lv.${level}</span>
      `;
      label.querySelector("input").addEventListener("change", () => {
        toggleJobExclusion(slotIndex, job.id);
      });
      grid.appendChild(label);
    }
    section.appendChild(grid);

    wrap.appendChild(section);
  }

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "btn btn-primary";
  closeBtn.textContent = t("common.close");
  closeBtn.addEventListener("click", () => {
    closeModal();
    renderApp();
  });
  wrap.appendChild(closeBtn);

  openModal(wrap);
}
