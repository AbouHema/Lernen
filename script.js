const STORAGE_KEYS = {
  favorites: "lernen_favorites_by_level",
  learned: "lernen_learned_by_level",
  quizHistory: "lernen_quiz_history",
  darkMode: "lernen_dark_mode",
  rtl: "lernen_rtl_mode",
  vocabLimit: "lernen_vocab_limit",
  sentenceLimit: "lernen_sentence_limit"
};

const createLevelState = (initialValue = []) =>
  Object.fromEntries(LEVELS.map((level) => [level, Array.isArray(initialValue) ? [...initialValue] : initialValue]));

const state = {
  favoritesByLevel: { ...createLevelState(), ...JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || "{}") },
  learnedByLevel: { ...createLevelState(), ...JSON.parse(localStorage.getItem(STORAGE_KEYS.learned) || "{}") },
  quizHistory: JSON.parse(localStorage.getItem(STORAGE_KEYS.quizHistory) || "[]"),
  vocabLimitByLevel: { ...createLevelState(12), ...JSON.parse(localStorage.getItem(STORAGE_KEYS.vocabLimit) || "{}") },
  sentenceLimitByLevel: { ...createLevelState(8), ...JSON.parse(localStorage.getItem(STORAGE_KEYS.sentenceLimit) || "{}") },
  searchQuery: "",
  exerciseType: "flashcards",
  exerciseLevel: "B1",
  flashIndex: 0,
  darkMode: localStorage.getItem(STORAGE_KEYS.darkMode) === "1",
  rtl: localStorage.getItem(STORAGE_KEYS.rtl) === "1"
};

const els = {
  menuToggle: document.getElementById("menuToggle"),
  navMenu: document.getElementById("navMenu"),
  dailyWord: document.getElementById("dailyWord"),
  globalSearch: document.getElementById("globalSearch"),
  allLevelsContainer: document.getElementById("allLevelsContainer"),
  levelJumpChips: document.getElementById("levelJumpChips"),
  year: document.getElementById("year"),
  kpiWords: document.getElementById("kpiWords"),
  kpiSentences: document.getElementById("kpiSentences"),
  kpiExercises: document.getElementById("kpiExercises"),
  favoriteCount: document.getElementById("favoriteCount"),
  learnedCount: document.getElementById("learnedCount"),
  quizCount: document.getElementById("quizCount"),
  weekProgressBar: document.getElementById("weekProgressBar"),
  weekProgressLabel: document.getElementById("weekProgressLabel"),
  levelSummary: document.getElementById("levelSummary"),
  exerciseTabs: document.getElementById("exerciseTabs"),
  exercisePanel: document.getElementById("exercisePanel"),
  themeToggle: document.getElementById("themeToggle"),
  rtlToggle: document.getElementById("rtlToggle")
};

function ensureLevel(item) {
  return { ...item, level: item.level || "B1" };
}

const vocabSafe = vocabulary.map(ensureLevel);
const sentenceSafe = sentences.map(ensureLevel);
const exerciseSafe = exercises.map(ensureLevel);

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const normalizeArabic = (value) =>
  value
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ًٌٍَُِّْـ]/g, "");

const normalizeText = (value = "") =>
  normalizeArabic(
    value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
  );

const saveState = () => {
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(state.favoritesByLevel));
  localStorage.setItem(STORAGE_KEYS.learned, JSON.stringify(state.learnedByLevel));
  localStorage.setItem(STORAGE_KEYS.quizHistory, JSON.stringify(state.quizHistory));
  localStorage.setItem(STORAGE_KEYS.vocabLimit, JSON.stringify(state.vocabLimitByLevel));
  localStorage.setItem(STORAGE_KEYS.sentenceLimit, JSON.stringify(state.sentenceLimitByLevel));
};

const findById = (list, id) => list.find((item) => item.id === id);

function highlightText(rawText, query) {
  const safe = escapeHtml(rawText);
  if (!query) return safe;

  const lowerSafe = safe.toLowerCase();
  const lowerQuery = escapeHtml(query).toLowerCase();
  if (!lowerQuery || !lowerSafe.includes(lowerQuery)) return safe;

  let output = "";
  let index = 0;
  while (true) {
    const found = lowerSafe.indexOf(lowerQuery, index);
    if (found === -1) {
      output += safe.slice(index);
      break;
    }
    output += `${safe.slice(index, found)}<mark>${safe.slice(found, found + lowerQuery.length)}</mark>`;
    index = found + lowerQuery.length;
  }
  return output;
}

function getLevelItems(level) {
  return {
    words: vocabSafe.filter((item) => item.level === level),
    sentences: sentenceSafe.filter((item) => item.level === level),
    exercises: exerciseSafe.filter((item) => item.level === level)
  };
}

function matchesQuery(item, query) {
  if (!query) return true;
  const haystack = normalizeText([item.arabic, item.german, item.example_de, item.example_ar, item.tag, ...(item.tags || [])].join(" "));
  return haystack.includes(query);
}

function toggleStoreItem(storeName, level, id) {
  const list = state[storeName][level] || [];
  state[storeName][level] = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
  saveState();
  renderAllLevels();
  updateProgress();
}

function renderDailyWord() {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const word = vocabSafe[dayIndex % vocabSafe.length];
  els.dailyWord.innerHTML = `
    <span class="tag">Daily Word · ${escapeHtml(word.level)}</span>
    <h3>${escapeHtml(word.arabic)}</h3>
    <p><strong>${escapeHtml(word.article ? `${word.article} ` : "")}${escapeHtml(word.german)}</strong></p>
    <p class="muted">${escapeHtml(word.example_de)}</p>
  `;
}

function renderAllLevels() {
  const query = normalizeText(state.searchQuery);

  const levelBlocks = LEVELS.map((level) => {
    const levelId = `level-${level}`;
    const items = getLevelItems(level);

    const wordsFound = items.words.filter((item) => matchesQuery(item, query));
    const sentencesFound = items.sentences.filter((item) => matchesQuery(item, query));
    const exercisesFound = items.exercises;

    const hasAny = wordsFound.length || sentencesFound.length || (!query && exercisesFound.length);
    if (!hasAny) return "";

    const vocabLimit = state.vocabLimitByLevel[level] || 12;
    const sentenceLimit = state.sentenceLimitByLevel[level] || 8;

    const favoriteCount = (state.favoritesByLevel[level] || []).length;
    const learnedCount = (state.learnedByLevel[level] || []).length;

    const vocabCards = wordsFound.slice(0, vocabLimit).map((item) => {
      const isFavorite = (state.favoritesByLevel[level] || []).includes(item.id);
      const isLearned = (state.learnedByLevel[level] || []).includes(item.id);
      return `
        <article class="surface-card">
          <div class="word-card-head"><strong>${highlightText(item.arabic, state.searchQuery)}</strong><span class="tag">${escapeHtml(level)}</span></div>
          <p><strong>${highlightText(`${item.article ? `${item.article} ` : ""}${item.german}`, state.searchQuery)}</strong></p>
          <p class="muted">${highlightText(item.example_de, state.searchQuery)}</p>
          <div class="card-actions">
            <button data-action="favorite" data-level="${level}" data-id="${item.id}" class="${isFavorite ? "active" : ""}">${isFavorite ? "Favorit ✓" : "Favorit"}</button>
            <button data-action="learned" data-level="${level}" data-id="${item.id}" class="${isLearned ? "active" : ""}">${isLearned ? "Gelernt ✓" : "Gelernt"}</button>
          </div>
        </article>
      `;
    });

    const sentenceCards = sentencesFound.slice(0, sentenceLimit).map(
      (item) => `
        <article class="surface-card">
          <div class="word-card-head"><span class="tag">${escapeHtml(item.tag || "Satz")}</span><span class="tag">${escapeHtml(level)}</span></div>
          <h3>${highlightText(item.german, state.searchQuery)}</h3>
          <p class="muted">${highlightText(item.arabic, state.searchQuery)}</p>
        </article>
      `
    );

    const exerciseRows = ["flashcards", "multiple", "gap", "quiz"].map((type) => {
      const count = exercisesFound.filter((entry) => entry.type === type).length;
      return `<div class="exercise-row"><span>${type}</span><button data-action="run-exercise" data-level="${level}" data-type="${type}" class="chip-button">Start</button><span class="muted">${count}</span></div>`;
    });

    return `
      <details id="${levelId}" class="level-block" ${level === "A1" ? "open" : ""}>
        <summary>Level ${level} · ${favoriteCount} Favoriten · ${learnedCount} gelernt</summary>
        <details open>
          <summary>Vokabeln (${wordsFound.length})</summary>
          <div class="cards-grid">${vocabCards.join("") || '<p class="muted">Keine Treffer.</p>'}</div>
          ${wordsFound.length > vocabLimit ? `<button data-action="more-vocab" data-level="${level}" class="chip-button">Mehr anzeigen</button>` : ""}
        </details>
        <details>
          <summary>Sätze (${sentencesFound.length})</summary>
          <div class="cards-grid">${sentenceCards.join("") || '<p class="muted">Keine Treffer.</p>'}</div>
          ${sentencesFound.length > sentenceLimit ? `<button data-action="more-sentences" data-level="${level}" class="chip-button">Mehr anzeigen</button>` : ""}
        </details>
        <details>
          <summary>Übungen (${exercisesFound.length})</summary>
          <div class="exercise-list">${exerciseRows.join("")}</div>
        </details>
      </details>
    `;
  }).join("");

  els.allLevelsContainer.innerHTML = levelBlocks || '<article class="surface-card"><p>Keine Treffer für die aktuelle Suche.</p></article>';

  els.allLevelsContainer.querySelectorAll("button[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const { action, level, id, type } = button.dataset;
      if (action === "favorite") return toggleStoreItem("favoritesByLevel", level, id);
      if (action === "learned") return toggleStoreItem("learnedByLevel", level, id);
      if (action === "more-vocab") {
        state.vocabLimitByLevel[level] = (state.vocabLimitByLevel[level] || 12) + 12;
        saveState();
        return renderAllLevels();
      }
      if (action === "more-sentences") {
        state.sentenceLimitByLevel[level] = (state.sentenceLimitByLevel[level] || 8) + 8;
        saveState();
        return renderAllLevels();
      }
      if (action === "run-exercise") {
        state.exerciseLevel = level;
        state.exerciseType = type;
        state.flashIndex = 0;
        els.exerciseTabs.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === type));
        renderExerciseRunner();
        document.getElementById("exerciseRunner")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

const pickRandom = (items, count) => {
  const copy = [...items];
  const out = [];
  while (copy.length && out.length < count) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  return out;
};

function renderExerciseRunner() {
  const words = vocabSafe.filter((item) => item.level === state.exerciseLevel);
  const levelSentences = sentenceSafe.filter((item) => item.level === state.exerciseLevel);

  if (state.exerciseType === "flashcards") {
    if (!words.length) return (els.exercisePanel.innerHTML = "<p>Keine Flashcards verfügbar.</p>");
    state.flashIndex %= words.length;
    const word = words[state.flashIndex];
    els.exercisePanel.innerHTML = `<h3>${state.exerciseLevel} · Flashcard ${state.flashIndex + 1}/${words.length}</h3><p class="big">${escapeHtml(word.arabic)}</p><p><strong>${escapeHtml(word.german)}</strong></p><button id="nextFlash" class="chip-button">Nächste Karte</button>`;
    document.getElementById("nextFlash")?.addEventListener("click", () => {
      state.flashIndex += 1;
      renderExerciseRunner();
    });
    return;
  }

  if (state.exerciseType === "multiple") {
    if (words.length < 4) return (els.exercisePanel.innerHTML = "<p>Nicht genug Wörter für Multiple Choice.</p>");
    const [correct, ...wrong] = pickRandom(words, 4);
    const options = pickRandom([correct, ...wrong], 4);
    els.exercisePanel.innerHTML = `<h3>${state.exerciseLevel} · Multiple Choice</h3><p>${escapeHtml(correct.arabic)}</p><div class="options">${options.map((item) => `<button data-answer="${item.id}">${escapeHtml(item.german)}</button>`).join("")}</div><p id="multiResult" class="muted"></p>`;
    els.exercisePanel.querySelectorAll("[data-answer]").forEach((button) =>
      button.addEventListener("click", () => {
        document.getElementById("multiResult").textContent = button.dataset.answer === correct.id ? "Richtig ✅" : `Falsch. ${correct.german}`;
      })
    );
    return;
  }

  if (state.exerciseType === "gap") {
    if (!levelSentences.length) return (els.exercisePanel.innerHTML = "<p>Keine Gap-Sätze verfügbar.</p>");
    const item = levelSentences[Math.floor(Math.random() * levelSentences.length)];
    const wordsInSentence = item.german.split(" ");
    const missing = wordsInSentence.find((word) => word.length > 3) || wordsInSentence[0];
    const masked = item.german.replace(missing, "____");
    els.exercisePanel.innerHTML = `<h3>${state.exerciseLevel} · Gap Text</h3><p>${escapeHtml(masked)}</p><input id="gapInput" /><button id="gapCheck" class="chip-button">Prüfen</button><p id="gapResult" class="muted"></p>`;
    document.getElementById("gapCheck")?.addEventListener("click", () => {
      const answer = normalizeText(document.getElementById("gapInput").value);
      document.getElementById("gapResult").textContent = answer === normalizeText(missing) ? "Richtig ✅" : `Lösung: ${missing}`;
    });
    return;
  }

  if (words.length < 5) return (els.exercisePanel.innerHTML = "<p>Mindestens 5 Wörter für Quiz nötig.</p>");
  const selected = pickRandom(words, 5);
  let score = 0;
  let index = 0;

  const ask = () => {
    const current = selected[index];
    const options = pickRandom([current, ...pickRandom(words.filter((entry) => entry.id !== current.id), 3)], 4);
    els.exercisePanel.innerHTML = `<h3>${state.exerciseLevel} · Quiz ${index + 1}/5</h3><p>${escapeHtml(current.arabic)}</p><div class="options">${options.map((item) => `<button data-q="${item.id}">${escapeHtml(item.german)}</button>`).join("")}</div>`;
    els.exercisePanel.querySelectorAll("[data-q]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.q === current.id) score += 1;
        index += 1;
        if (index < selected.length) return ask();
        state.quizHistory.push({ level: state.exerciseLevel, score, total: selected.length, timestamp: new Date().toISOString() });
        saveState();
        els.exercisePanel.innerHTML = `<h3>Quiz beendet</h3><p>${score}/${selected.length}</p>`;
        updateProgress();
      });
    });
  };

  ask();
}

function updateProgress() {
  const favoriteCount = LEVELS.reduce((sum, level) => sum + (state.favoritesByLevel[level] || []).length, 0);
  const learnedCount = LEVELS.reduce((sum, level) => sum + (state.learnedByLevel[level] || []).length, 0);
  const quizCount = state.quizHistory.length;
  const progress = Math.round((learnedCount / vocabSafe.length) * 100) || 0;

  els.favoriteCount.textContent = String(favoriteCount);
  els.learnedCount.textContent = String(learnedCount);
  els.quizCount.textContent = String(quizCount);
  els.weekProgressLabel.textContent = `${progress}%`;
  els.weekProgressBar.style.width = `${progress}%`;

  els.levelSummary.innerHTML = `<h3>Level-Übersicht</h3>${LEVELS.map((level) => `<p><strong>${level}</strong>: ${(state.learnedByLevel[level] || []).length} gelernt · ${(state.favoritesByLevel[level] || []).length} Favoriten</p>`).join("")}`;
}

function initNavigation() {
  els.menuToggle?.addEventListener("click", () => {
    const open = els.navMenu.classList.toggle("open");
    els.menuToggle.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", () => {
      const id = anchor.getAttribute("href").slice(1);
      const level = id.replace("level-", "");
      if (LEVELS.includes(level)) {
        const details = document.getElementById(id);
        if (details) details.open = true;
      }
      els.navMenu.classList.remove("open");
      els.menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initSearch() {
  els.globalSearch?.addEventListener("input", () => {
    state.searchQuery = els.globalSearch.value;
    renderAllLevels();
  });
}

function initExerciseTabs() {
  els.exerciseTabs.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.exerciseType = button.dataset.tab;
      els.exerciseTabs.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab === button));
      renderExerciseRunner();
    });
  });
}

function initThemeAndDirection() {
  document.body.classList.toggle("light", !state.darkMode);
  document.documentElement.setAttribute("dir", state.rtl ? "rtl" : "ltr");

  els.themeToggle.addEventListener("click", () => {
    state.darkMode = !state.darkMode;
    localStorage.setItem(STORAGE_KEYS.darkMode, state.darkMode ? "1" : "0");
    document.body.classList.toggle("light", !state.darkMode);
  });

  els.rtlToggle.addEventListener("click", () => {
    state.rtl = !state.rtl;
    localStorage.setItem(STORAGE_KEYS.rtl, state.rtl ? "1" : "0");
    document.documentElement.setAttribute("dir", state.rtl ? "rtl" : "ltr");
  });
}

function initTopStart() {
  window.history.scrollRestoration = "manual";
  if (!window.location.hash) {
    window.scrollTo(0, 0);
    window.addEventListener("load", () => window.scrollTo(0, 0));
    window.addEventListener("pageshow", () => window.scrollTo(0, 0));
  }
}

function initStaticMetrics() {
  els.year.textContent = new Date().getFullYear();
  els.kpiWords.textContent = `${vocabSafe.length}+`;
  els.kpiSentences.textContent = `${sentenceSafe.length}+`;
  els.kpiExercises.textContent = `${exerciseSafe.length}+`;
}

function init() {
  initTopStart();
  initNavigation();
  initSearch();
  initExerciseTabs();
  initThemeAndDirection();
  initStaticMetrics();
  renderDailyWord();
  renderAllLevels();
  renderExerciseRunner();
  updateProgress();
}

init();
