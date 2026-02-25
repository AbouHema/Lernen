const LEVEL_OPTIONS = ["Alle", ...LEVELS];

const STORAGE_KEYS = {
  selectedLevel: "lernen_selectedLevel",
  favorites: "lernen_favorites_by_level",
  learned: "lernen_learned_by_level",
  known: "lernen_known_by_level",
  quizHistory: "lernen_quiz_history",
  darkMode: "lernen_dark_mode",
  rtl: "lernen_rtl_mode"
};

const createLevelState = () => Object.fromEntries(LEVELS.map((level) => [level, []]));

const state = {
  selectedLevel: localStorage.getItem(STORAGE_KEYS.selectedLevel) || "Alle",
  favoritesByLevel: { ...createLevelState(), ...JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || "{}") },
  learnedByLevel: { ...createLevelState(), ...JSON.parse(localStorage.getItem(STORAGE_KEYS.learned) || "{}") },
  knownByLevel: { ...createLevelState(), ...JSON.parse(localStorage.getItem(STORAGE_KEYS.known) || "{}") },
  quizHistory: JSON.parse(localStorage.getItem(STORAGE_KEYS.quizHistory) || "[]"),
  exerciseType: "flashcards",
  flashcardIndex: 0,
  darkMode: localStorage.getItem(STORAGE_KEYS.darkMode) === "1",
  rtl: localStorage.getItem(STORAGE_KEYS.rtl) === "1"
};

const els = {
  menuToggle: document.getElementById("menuToggle"),
  navMenu: document.getElementById("navMenu"),
  vocabGrid: document.getElementById("vocabGrid"),
  sentenceGrid: document.getElementById("sentenceGrid"),
  vocabSearch: document.getElementById("vocabSearch"),
  sentenceSearch: document.getElementById("sentenceSearch"),
  dailyWord: document.getElementById("dailyWord"),
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
  exercisePanel: document.getElementById("exercisePanel"),
  exerciseTabs: document.getElementById("exerciseTabs"),
  themeToggle: document.getElementById("themeToggle"),
  rtlToggle: document.getElementById("rtlToggle")
};

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
  localStorage.setItem(STORAGE_KEYS.selectedLevel, state.selectedLevel);
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(state.favoritesByLevel));
  localStorage.setItem(STORAGE_KEYS.learned, JSON.stringify(state.learnedByLevel));
  localStorage.setItem(STORAGE_KEYS.known, JSON.stringify(state.knownByLevel));
  localStorage.setItem(STORAGE_KEYS.quizHistory, JSON.stringify(state.quizHistory));
};

const getLevelFiltered = (items) => (state.selectedLevel === "Alle" ? items : items.filter((item) => item.level === state.selectedLevel));
const byId = (items, id) => items.find((item) => item.id === id);

const getSearchFiltered = (items, query, mapper) => {
  const normalized = normalizeText(query);
  if (!normalized) return items;
  return items.filter((item) => normalizeText(mapper(item)).includes(normalized));
};

const getFilteredVocabulary = () =>
  getSearchFiltered(getLevelFiltered(vocabulary), els.vocabSearch.value, (item) => [item.arabic, item.german, item.example_de, item.example_ar, item.tags.join(" ")].join(" "));

const getFilteredSentences = () => getSearchFiltered(getLevelFiltered(sentences), els.sentenceSearch.value, (item) => [item.arabic, item.german, item.tag].join(" "));

const getIdsForSelectedLevel = (store) =>
  state.selectedLevel === "Alle" ? LEVELS.flatMap((level) => store[level] || []) : store[state.selectedLevel] || [];

const toggleInLevelStore = (storeKey, id, level) => {
  const list = state[storeKey][level] || [];
  state[storeKey][level] = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
  saveState();
  renderAll();
};

function renderLevelToolbars() {
  document.querySelectorAll(".level-toolbar").forEach((toolbar) => {
    toolbar.innerHTML = LEVEL_OPTIONS.map(
      (level) => `<button class="level-chip ${state.selectedLevel === level ? "active" : ""}" data-level="${level}">${level}</button>`
    ).join("");
  });

  document.querySelectorAll(".level-chip").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedLevel = button.dataset.level;
      state.flashcardIndex = 0;
      saveState();
      renderAll();
    });
  });
}

function renderDailyWord() {
  const filtered = getLevelFiltered(vocabulary);
  if (!filtered.length) {
    els.dailyWord.innerHTML = '<p class="muted">Für dieses Level sind aktuell keine Wörter verfügbar.</p>';
    return;
  }

  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const word = filtered[dayIndex % filtered.length];
  els.dailyWord.innerHTML = `
    <span class="tag">Daily Word · ${word.level}</span>
    <h3>${word.arabic}</h3>
    <p><strong>${word.article ? `${word.article} ` : ""}${word.german}</strong></p>
    <p class="muted">${word.example_de}</p>
  `;
}

function renderVocabulary() {
  const subset = getFilteredVocabulary();
  if (!subset.length) {
    els.vocabGrid.innerHTML = '<article class="surface-card"><p>Keine Vokabeln für diesen Filter gefunden.</p></article>';
    return;
  }

  els.vocabGrid.innerHTML = subset
    .map((item) => {
      const isFav = (state.favoritesByLevel[item.level] || []).includes(item.id);
      const isLearned = (state.learnedByLevel[item.level] || []).includes(item.id);
      const isKnown = (state.knownByLevel[item.level] || []).includes(item.id);
      return `
        <article class="surface-card hover-lift reveal">
          <div class="word-card-head"><strong>${item.arabic}</strong><span class="tag">${item.level}</span></div>
          <p><strong>${item.article ? `${item.article} ` : ""}${item.german}</strong></p>
          <p class="muted">${item.example_de}</p>
          <p class="muted">${item.tags.join(" · ")}</p>
          <div class="card-actions">
            <button data-favorite="${item.id}" data-level="${item.level}" class="${isFav ? "active" : ""}">${isFav ? "Favorit ✓" : "Favorit"}</button>
            <button data-learned="${item.id}" data-level="${item.level}" class="${isLearned ? "active" : ""}">${isLearned ? "Gelernt ✓" : "Gelernt"}</button>
            <button data-known="${item.id}" data-level="${item.level}" class="${isKnown ? "active" : ""}">${isKnown ? "Bekannt" : "Unbekannt"}</button>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-favorite]").forEach((button) =>
    button.addEventListener("click", () => toggleInLevelStore("favoritesByLevel", button.dataset.favorite, button.dataset.level))
  );
  document.querySelectorAll("[data-learned]").forEach((button) =>
    button.addEventListener("click", () => toggleInLevelStore("learnedByLevel", button.dataset.learned, button.dataset.level))
  );
  document.querySelectorAll("[data-known]").forEach((button) =>
    button.addEventListener("click", () => toggleInLevelStore("knownByLevel", button.dataset.known, button.dataset.level))
  );
}

function renderSentences() {
  const subset = getFilteredSentences();
  if (!subset.length) {
    els.sentenceGrid.innerHTML = '<article class="surface-card"><p>Keine Sätze für diesen Filter gefunden.</p></article>';
    return;
  }

  els.sentenceGrid.innerHTML = subset
    .map(
      (item) => `
        <article class="surface-card hover-lift reveal">
          <div class="word-card-head"><span class="tag">${item.tag}</span><span class="tag">${item.level}</span></div>
          <h3>${item.german}</h3>
          <p class="muted">${item.arabic}</p>
        </article>
      `
    )
    .join("");
}

const pickRandom = (items, count) => {
  const copy = [...items];
  const out = [];
  while (copy.length && out.length < count) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
};

function renderFlashcards(levelWords) {
  if (!levelWords.length) {
    els.exercisePanel.innerHTML = '<p>Keine Flashcards verfügbar.</p>';
    return;
  }
  state.flashcardIndex %= levelWords.length;
  const word = levelWords[state.flashcardIndex];
  els.exercisePanel.innerHTML = `
    <h3>Flashcard ${state.flashcardIndex + 1}/${levelWords.length}</h3>
    <p class="big">${word.arabic}</p>
    <p><strong>${word.article ? `${word.article} ` : ""}${word.german}</strong></p>
    <p class="muted">${word.example_de}</p>
    <button class="chip-button" id="nextFlashcard">Nächste Karte</button>
  `;
  document.getElementById("nextFlashcard")?.addEventListener("click", () => {
    state.flashcardIndex += 1;
    renderExercises();
  });
}

function renderMultiple(levelWords) {
  if (levelWords.length < 4) {
    els.exercisePanel.innerHTML = "<p>Nicht genug Wörter für Multiple Choice.</p>";
    return;
  }

  const [correct, ...wrong] = pickRandom(levelWords, 4);
  const options = pickRandom([correct, ...wrong], 4);
  els.exercisePanel.innerHTML = `
    <h3>Multiple Choice</h3>
    <p>Was bedeutet: <strong>${correct.arabic}</strong> ?</p>
    <div class="options">${options.map((item) => `<button data-answer="${item.id}">${item.german}</button>`).join("")}</div>
    <p id="multipleResult" class="muted"></p>
  `;

  els.exercisePanel.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const ok = button.dataset.answer === correct.id;
      document.getElementById("multipleResult").textContent = ok ? "Richtig ✅" : `Falsch. Richtig ist: ${correct.german}`;
    });
  });
}

function renderGap(levelSentences) {
  if (!levelSentences.length) {
    els.exercisePanel.innerHTML = "<p>Keine Gap-Übungen verfügbar.</p>";
    return;
  }

  const selected = levelSentences[Math.floor(Math.random() * levelSentences.length)];
  const words = selected.german.split(" ");
  const removable = words.filter((word) => word.length > 3);
  const removed = removable[Math.floor(Math.random() * removable.length)] || words[0];
  const masked = selected.german.replace(removed, "____");

  els.exercisePanel.innerHTML = `
    <h3>Lückentext</h3>
    <p>${masked}</p>
    <input id="gapInput" placeholder="Fehlendes Wort" />
    <button id="checkGap" class="chip-button">Prüfen</button>
    <p id="gapResult" class="muted"></p>
  `;

  document.getElementById("checkGap")?.addEventListener("click", () => {
    const answer = normalizeText(document.getElementById("gapInput").value);
    const result = document.getElementById("gapResult");
    result.textContent = answer === normalizeText(removed) ? "Richtig ✅" : `Nicht ganz. Lösung: ${removed}`;
  });
}

function renderQuiz(levelWords) {
  if (levelWords.length < 5) {
    els.exercisePanel.innerHTML = "<p>Mindestens 5 Wörter für Quiz benötigt.</p>";
    return;
  }

  const questions = pickRandom(levelWords, 5);
  let score = 0;
  let current = 0;

  const ask = () => {
    const item = questions[current];
    const wrong = pickRandom(levelWords.filter((word) => word.id !== item.id), 3);
    const options = pickRandom([item, ...wrong], 4);

    els.exercisePanel.innerHTML = `
      <h3>Mini-Quiz (${current + 1}/5)</h3>
      <p>Wähle die deutsche Bedeutung für <strong>${item.arabic}</strong>.</p>
      <div class="options">${options.map((option) => `<button data-id="${option.id}">${option.german}</button>`).join("")}</div>
      <p class="muted">Punkte: ${score}</p>
    `;

    els.exercisePanel.querySelectorAll("[data-id]").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.dataset.id === item.id) score += 1;
        current += 1;
        if (current < questions.length) {
          ask();
          return;
        }

        const historyLevel = state.selectedLevel === "Alle" ? "Alle" : state.selectedLevel;
        state.quizHistory.push({ timestamp: new Date().toISOString(), level: historyLevel, score, total: questions.length });
        saveState();
        els.exercisePanel.innerHTML = `<h3>Quiz beendet</h3><p>Ergebnis: ${score}/${questions.length}</p><p class="muted">Gespeichert mit Timestamp und Level.</p>`;
        updateProgress();
      });
    });
  };

  ask();
}

function renderExercises() {
  const levelWords = getLevelFiltered(vocabulary);
  const levelSentences = getLevelFiltered(sentences);

  if (state.exerciseType === "flashcards") return renderFlashcards(pickRandom(levelWords, Math.min(8, levelWords.length)));
  if (state.exerciseType === "multiple") return renderMultiple(levelWords);
  if (state.exerciseType === "gap") return renderGap(levelSentences);
  return renderQuiz(levelWords);
}

function updateProgress() {
  const favoritesCurrent = getIdsForSelectedLevel(state.favoritesByLevel).length;
  const learnedCurrent = getIdsForSelectedLevel(state.learnedByLevel).length;
  const knownCurrent = getIdsForSelectedLevel(state.knownByLevel).length;
  const wordsCurrent = getLevelFiltered(vocabulary).length || vocabulary.length;
  const progress = Math.round((knownCurrent / wordsCurrent) * 100) || 0;

  const quizCurrent = state.quizHistory.filter((entry) => state.selectedLevel === "Alle" || entry.level === state.selectedLevel).length;

  els.favoriteCount.textContent = String(favoritesCurrent);
  els.learnedCount.textContent = String(learnedCurrent);
  els.quizCount.textContent = String(quizCurrent);
  els.weekProgressLabel.textContent = `${progress}%`;
  els.weekProgressBar.style.width = `${progress}%`;

  const rows = LEVELS.map((level) => {
    const learned = new Set([...(state.learnedByLevel[level] || []), ...(state.knownByLevel[level] || [])]);
    return `<p><strong>${level}</strong>: ${learned.size} gelernt</p>`;
  }).join("");

  els.levelSummary.innerHTML = `<h3>Übersicht pro Level</h3>${rows}`;
}

function initNavigation() {
  els.menuToggle.addEventListener("click", () => {
    const isOpen = els.navMenu.classList.toggle("open");
    els.menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", () => {
      els.navMenu.classList.remove("open");
      els.menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

function initSearch() {
  els.vocabSearch.addEventListener("input", renderVocabulary);
  els.sentenceSearch.addEventListener("input", renderSentences);
}

function initExerciseTabs() {
  els.exerciseTabs.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.exerciseType = button.dataset.tab;
      els.exerciseTabs.querySelectorAll(".tab").forEach((tab) => tab.classList.toggle("active", tab === button));
      renderExercises();
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
  if (window.location.hash && window.location.hash !== "#home") {
    history.replaceState(null, "", `${location.pathname}${location.search}#home`);
  }
  window.history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  window.addEventListener("load", () => window.scrollTo(0, 0));
  window.addEventListener("pageshow", () => window.scrollTo(0, 0));
}

function initStaticMetrics() {
  els.year.textContent = new Date().getFullYear();
  els.kpiWords.textContent = `${vocabulary.length}+`;
  els.kpiSentences.textContent = `${sentences.length}+`;
  els.kpiExercises.textContent = `${exercises.length}+`;
}

function renderAll() {
  renderLevelToolbars();
  renderDailyWord();
  renderVocabulary();
  renderSentences();
  renderExercises();
  updateProgress();
}

function init() {
  initTopStart();
  initNavigation();
  initSearch();
  initExerciseTabs();
  initThemeAndDirection();
  initStaticMetrics();
  renderAll();
}

init();
