/* =========================
   UI Persist (Tab + Lesson)
========================= */
function saveUI() {
  const ui = {
    view: state.view,
    activeLesson: state.activeLesson
      ? {
          lessonId: state.activeLesson.lesson.id,
          levelId: state.activeLesson.levelId,
          unitId: state.activeLesson.unitId
        }
      : null
  };
  localStorage.setItem("lernen_ui", JSON.stringify(ui));
}

function loadUI() {
  try {
    return JSON.parse(localStorage.getItem("lernen_ui") || "null");
  } catch {
    return null;
  }
}

function clearUI() {
  localStorage.removeItem("lernen_ui");
}

const APP_LEVELS = ["A1", "A2", "B1", "B2", "C1"];
const LEVEL_ALL = "all";
const QUIZ_LEVELS = APP_LEVELS;
const QUIZ_LEVEL_ALL = LEVEL_ALL;
const QUIZ_LEVEL_STORAGE_KEY = "lernen_quiz_level";
const CONTENT_LEVEL_STORAGE_KEYS = {
  learn: "learnLevel",
  vocab: "vocabLevel",
  sentences: "sentenceLevel"
};

/* =========================
   State
========================= */
const state = {
  curriculum: null,
  vocab: null,
  sentences: null,
  quizzes: null,
  activeLesson: null,
  view: "learn",
  learnLevel: loadContentLevel("learn"),
  vocabLevel: loadContentLevel("vocab"),
  sentenceLevel: loadContentLevel("sentences"),
  quizLevel: loadQuizLevel(),
  progress: loadProgress()
};

init();

/* =========================
   Init
========================= */
async function init() {
  const [curriculum, vocab, sentences, quizzes] = await Promise.all([
    fetchJson("data/curriculum.json"),
    fetchJson("data/vocab.json"),
    fetchJson("data/sentences.json"),
    fetchJson("data/quizzes.json")
  ]);

  state.curriculum = curriculum;
  state.vocab = vocab;
  state.sentences = sentences;
  state.quizzes = quizzes;

  // Restore UI (stay where you were after reload)
  const ui = loadUI();
  if (ui?.view) state.view = ui.view;

  if (ui?.activeLesson) {
    const { lessonId, levelId, unitId } = ui.activeLesson;
    const level = state.curriculum.levels.find(l => l.id === levelId);
    const unit = level?.units?.find(u => u.id === unitId);
    const lesson = unit?.lessons?.find(le => le.id === lessonId);
    if (lesson) state.activeLesson = { lesson, levelId, unitId };
    else if (isSyntheticQuizLessonId(lessonId)) {
      const quizLevel = normalizeQuizLevel(state.quizLevel);
      state.activeLesson = {
        lesson: createQuizLesson(quizLevel),
        levelId: getQuizDisplayLevel(quizLevel),
        unitId: `${quizLevel}-quiz`
      };
    }
  }

  wireNav();
  rerender();
}

/* =========================
   Nav + Search
========================= */
function wireNav() {
  document.querySelectorAll(".navBtn").forEach(btn => {
    btn.addEventListener("click", event => {
      event.preventDefault();
      state.view = btn.dataset.view;

      // Only when user clicks "Lernen" -> go back to start page
      if (state.view === "learn") {
        state.activeLesson = null;
      }

      saveUI();
      rerender();
    });
  });

  const search = document.getElementById("search");
  if (search) {
    search.addEventListener("input", () => {
      if (state.activeLesson) renderTree(search.value.trim().toLowerCase());
      else rerender();
    });
  }
}

/* =========================
   Rerender (Tabs)
========================= */
function rerender() {
  const q = (document.getElementById("search")?.value || "").trim().toLowerCase();
  syncNav();
  renderTree(q);

  if (state.view === "progress") {
    renderProgress();
    return;
  }

  // No lesson selected yet -> show an overview for the tab
  if (!state.activeLesson) {
    if (state.view === "vocab") {
      renderLessonOverview("vocab", "Vokabeln");
      return;
    }

    if (state.view === "sentences") {
      renderLessonOverview("sentences", "Sätze");
      return;
    }

    renderLearnOverview();
    return;
  }

  // Lesson selected
  const lesson = state.activeLesson.lesson;

  // If user is on a specific tab but selected lesson type doesn't match, show hint.
  if (state.view === "vocab" && lesson.type !== "vocab") {
    renderLessonOverview("vocab", "Vokabeln");
    return;
  }
  if (state.view === "vocab" && !levelMatches(getActiveContentLevel("vocab"), state.activeLesson.levelId)) {
    state.activeLesson = null;
    renderLessonOverview("vocab", "Vokabeln");
    return;
  }
  if (state.view === "sentences" && lesson.type !== "sentences") {
    renderLessonOverview("sentences", "Sätze");
    return;
  }
  if (state.view === "sentences" && !levelMatches(getActiveContentLevel("sentences"), state.activeLesson.levelId)) {
    state.activeLesson = null;
    renderLessonOverview("sentences", "Sätze");
    return;
  }
  if (state.view === "learn" && lesson.type !== "quiz" && !levelMatches(getActiveContentLevel("learn"), state.activeLesson.levelId)) {
    state.activeLesson = null;
    renderLearnOverview();
    return;
  }

  openLesson(lesson, state.activeLesson.levelId, state.activeLesson.unitId);
}

/* =========================
   Sidebar Tree
========================= */
function renderTree(filter = "") {
  const root = document.getElementById("tree");
  if (!root) return;

  root.innerHTML = "";
  const levelFilter = getTreeLevelFilter();

  state.curriculum.levels.forEach(level => {
    if (!levelMatches(levelFilter, level.id)) return;

    const levelEl = document.createElement("div");
    levelEl.className = "treeLevel";

    const levelBtn = document.createElement("button");
    levelBtn.className = "treeLevelBtn";
    levelBtn.textContent = level.title;
    levelEl.appendChild(levelBtn);

    const unitsEl = document.createElement("div");
    unitsEl.className = "treeUnits";
    unitsEl.style.display = "block";

    // Level collapse/expand
    levelBtn.addEventListener("click", () => {
      unitsEl.style.display = unitsEl.style.display === "none" ? "block" : "none";
    });

    (level.units || []).forEach(unit => {
      const unitWrap = document.createElement("div");
      unitWrap.className = "treeUnit";

      const unitTitle = document.createElement("div");
      unitTitle.className = "treeUnitTitle";
      unitTitle.textContent = unit.title;
      unitWrap.appendChild(unitTitle);

      const lessonsEl = document.createElement("div");
      lessonsEl.className = "treeLessons";

      (unit.lessons || []).forEach(lesson => {
        const searchable = getLessonSearchText(lesson).toLowerCase();
        if (!lessonMatchesCurrentView(lesson)) return;
        if (filter && !searchable.includes(filter)) return;

        const btn = document.createElement("button");
        btn.className = "treeLessonBtn";

        const done = !!state.progress.done[lesson.id];
        btn.textContent = `${done ? "✅ " : ""}${lesson.title}`;

        // Mark active
        if (state.activeLesson?.lesson?.id === lesson.id) btn.classList.add("active");

        btn.addEventListener("click", () => openLesson(lesson, level.id, unit.id));
        lessonsEl.appendChild(btn);
      });

      if (lessonsEl.children.length) {
        unitWrap.appendChild(lessonsEl);
        unitsEl.appendChild(unitWrap);
      }
    });

    const levelQuizQuestions = getLevelQuizQuestions(level.id);
    const quizSearchText = `${level.id} ${level.title} quiz level-quiz`.toLowerCase();
    if (shouldShowLevelQuizInTree() && levelQuizQuestions.length && (!filter || quizSearchText.includes(filter))) {
      const quizLesson = createLevelQuizLesson(level.id);
      const quizWrap = document.createElement("div");
      quizWrap.className = "treeUnit";

      const quizTitle = document.createElement("div");
      quizTitle.className = "treeUnitTitle";
      quizTitle.textContent = "Quiz";
      quizWrap.appendChild(quizTitle);

      const quizLessons = document.createElement("div");
      quizLessons.className = "treeLessons";

      const quizBtn = document.createElement("button");
      quizBtn.className = "treeLessonBtn";
      quizBtn.textContent = `Level-Quiz (${levelQuizQuestions.length})`;
      if (state.activeLesson?.lesson?.id === quizLesson.id) quizBtn.classList.add("active");
      quizBtn.addEventListener("click", () => openLevelQuiz(level.id));

      quizLessons.appendChild(quizBtn);
      quizWrap.appendChild(quizLessons);
      unitsEl.appendChild(quizWrap);
    }

    if (!unitsEl.children.length) return;

    levelEl.appendChild(unitsEl);
    root.appendChild(levelEl);
  });
}

function getLessonSearchText(lesson) {
  let text = lesson.title;

  if (lesson.type === "vocab") {
    const arr = state.vocab?.[lesson.ref] || [];
    text += " " + arr.map(x => `${x.de} ${x.ar}`).join(" ");
  }

  if (lesson.type === "sentences") {
    const arr = state.sentences?.[lesson.ref] || [];
    text += " " + arr.map(x => `${x.de} ${x.ar}`).join(" ");
  }

  return text;
}

/* =========================
   Open Lesson
========================= */
function openLesson(lesson, levelId, unitId) {
  state.activeLesson = { lesson, levelId, unitId };
  if (state.view === "vocab" && lesson.type === "vocab") setContentLevel("vocab", levelId);
  if (state.view === "sentences" && lesson.type === "sentences") setContentLevel("sentences", levelId);
  if (state.view === "learn" && lesson.type !== "quiz") setContentLevel("learn", levelId);
  if (lesson.type === "quiz") {
    state.quizLevel = normalizeQuizLevel(QUIZ_LEVELS.includes(levelId) ? levelId : lesson.ref);
    saveQuizLevel();
  }
  saveUI();

  const title = document.getElementById("contentTitle");
  const meta = document.getElementById("contentMeta");

  if (title) title.textContent = `${levelId} · ${lesson.title}`;
  if (meta) meta.textContent = `Typ: ${lesson.type.toUpperCase()} · ID: ${lesson.id}`;

  if (lesson.type === "vocab") renderVocabLesson(lesson);
  else if (lesson.type === "sentences") renderSentenceLesson(lesson);
  else if (lesson.type === "quiz") renderQuizLesson(lesson);
  else setContent("Unbekannter Lesson-Type", "Bitte prüfe curriculum.json");
}

/* ----------------------------
   Lesson Overviews (Tabs)
----------------------------- */
function getAllLessonsByType(type) {
  const result = [];
  state.curriculum.levels.forEach(level => {
    (level.units || []).forEach(unit => {
      (unit.lessons || []).forEach(lesson => {
        if (lesson.type === type) {
          result.push({
            levelId: level.id,
            unitId: unit.id,
            unitTitle: unit.title,
            lesson
          });
        }
      });
    });
  });
  return result;
}

function getAllLessons() {
  const result = [];
  state.curriculum.levels.forEach(level => {
    (level.units || []).forEach(unit => {
      (unit.lessons || []).forEach(lesson => {
        result.push({
          levelId: level.id,
          unitId: unit.id,
          unitTitle: unit.title,
          lesson
        });
      });
    });
  });
  return result;
}

function getFilteredLessons(type, level, filter = getSearchFilter()) {
  const items = type === "learn" ? getAllLessons() : getAllLessonsByType(type);
  const normalizedFilter = filter.trim().toLowerCase();

  return items.filter(item => {
    if (!levelMatches(level, item.levelId)) return false;
    if (!normalizedFilter) return true;
    return getLessonSearchText(item.lesson).toLowerCase().includes(normalizedFilter);
  });
}

function levelMatches(selectedLevel, itemLevel) {
  return isAllLevel(selectedLevel) || selectedLevel === itemLevel;
}

function normalizeContentLevel(level) {
  return APP_LEVELS.includes(level) ? level : LEVEL_ALL;
}

function isAllLevel(level) {
  return level === LEVEL_ALL;
}

function getActiveContentLevel(kind) {
  if (kind === "vocab") return normalizeContentLevel(state.vocabLevel);
  if (kind === "sentences") return normalizeContentLevel(state.sentenceLevel);
  return normalizeContentLevel(state.learnLevel);
}

function setContentLevel(kind, level) {
  const normalized = normalizeContentLevel(level);
  if (kind === "vocab") state.vocabLevel = normalized;
  else if (kind === "sentences") state.sentenceLevel = normalized;
  else state.learnLevel = normalized;
  saveContentLevel(kind);
}

function getTreeLevelFilter() {
  if (state.view === "vocab") return getActiveContentLevel("vocab");
  if (state.view === "sentences") return getActiveContentLevel("sentences");
  if (state.view === "learn") return getActiveContentLevel("learn");
  return LEVEL_ALL;
}

function lessonMatchesCurrentView(lesson) {
  if (state.view === "vocab") return lesson.type === "vocab";
  if (state.view === "sentences") return lesson.type === "sentences";
  return true;
}

function shouldShowLevelQuizInTree() {
  return state.view === "learn";
}

function getSearchFilter() {
  return (document.getElementById("search")?.value || "").trim().toLowerCase();
}

function getContentLevelCount(kind, level) {
  return getFilteredLessons(kind, level, "").length;
}

function renderLevelTabs(kind, activeLevel) {
  const labels = {
    learn: "Lern-Level auswählen",
    vocab: "Vokabel-Level auswählen",
    sentences: "Sätze-Level auswählen"
  };
  const options = [
    { value: LEVEL_ALL, label: "Alle" },
    ...APP_LEVELS.map(level => ({ value: level, label: level }))
  ];

  return `
    <div class="levelFilterBar" role="tablist" aria-label="${escapeHtml(labels[kind] || "Level auswählen")}">
      ${options
        .map(option => {
          const active = option.value === activeLevel;
          const count = getContentLevelCount(kind, option.value);
          return `
        <button
          type="button"
          class="levelFilterBtn${active ? " active" : ""}"
          data-level-kind="${escapeHtml(kind)}"
          data-level-value="${escapeHtml(option.value)}"
          aria-pressed="${active ? "true" : "false"}"
        >
          <span>${escapeHtml(option.label)}</span>
          <small>${count}</small>
        </button>
      `;
        })
        .join("")}
    </div>
  `;
}

function wireLevelTabs() {
  document.querySelectorAll("[data-level-kind][data-level-value]").forEach(btn => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.levelKind;
      setContentLevel(kind, btn.dataset.levelValue);
      state.activeLesson = null;
      saveUI();
      rerender();
    });
  });
}

function renderEmptyState(title, text) {
  return `
    <div class="emptyState">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(text)}</p>
    </div>
  `;
}

function getFirstLesson(match) {
  for (const level of state.curriculum.levels || []) {
    for (const unit of level.units || []) {
      for (const lesson of unit.lessons || []) {
        if (!match || match(lesson, level.id, unit.id)) {
          return {
            levelId: level.id,
            unitId: unit.id,
            unitTitle: unit.title,
            lesson
          };
        }
      }
    }
  }

  return null;
}

function createLevelQuizLesson(levelId) {
  return createQuizLesson(levelId);
}

function createQuizLesson(level) {
  const quizLevel = normalizeQuizLevel(level);
  return {
    id: isAllQuizLevel(quizLevel) ? "ALL_LEVEL_QUIZ" : `${quizLevel}_LEVEL_QUIZ`,
    title: "Level-Quiz",
    type: "quiz",
    ref: quizLevel
  };
}

function isSyntheticQuizLessonId(id) {
  return id === "ALL_LEVEL_QUIZ" || QUIZ_LEVELS.some(level => id === `${level}_LEVEL_QUIZ`);
}

function openLevelQuiz(levelId) {
  openQuizView(levelId);
}

function openQuizView(level = state.quizLevel) {
  const quizLevel = normalizeQuizLevel(level);
  state.quizLevel = quizLevel;
  saveQuizLevel();
  state.view = "learn";
  syncNav();
  openLesson(createQuizLesson(quizLevel), getQuizDisplayLevel(quizLevel), `${quizLevel}-quiz`);
}

function getLessonLevel(lesson) {
  const match = String(lesson.level || lesson.ref || lesson.id || "").match(/^(A1|A2|B1|B2|C1)/);
  return match?.[1] || state.activeLesson?.levelId || "";
}

function getLevelQuizQuestions(levelId) {
  return normalizeQuizQuestions(state.quizzes?.[levelId] || []);
}

function getQuizQuestions(lesson) {
  const selectedLevel = normalizeQuizLevel(state.quizLevel);
  if (isAllQuizLevel(selectedLevel)) return getAllQuizQuestions();

  const direct = normalizeQuizQuestions(state.quizzes?.[selectedLevel] || []);
  if (direct.length) return direct;

  const lessonDirect = normalizeQuizQuestions(state.quizzes?.[lesson.ref] || []);
  if (lessonDirect.length) return lessonDirect;

  return getLevelQuizQuestions(getLessonLevel(lesson));
}

function getAllQuizQuestions() {
  return normalizeQuizQuestions(Object.values(state.quizzes || {}).flat());
}

function getQuizLevelCount(level) {
  if (isAllQuizLevel(level)) return getAllQuizQuestions().length;
  return getLevelQuizQuestions(level).length;
}

function normalizeQuizLevel(level) {
  return QUIZ_LEVELS.includes(level) ? level : QUIZ_LEVEL_ALL;
}

function isAllQuizLevel(level) {
  return level === QUIZ_LEVEL_ALL;
}

function getQuizDisplayLevel(level) {
  return isAllQuizLevel(level) ? "Alle" : level;
}

function normalizeQuizQuestions(rawQuestions) {
  const seen = new Set();
  const normalized = [];

  rawQuestions.forEach((q, index) => {
    const frage = q.frage || q.q;
    const antworten = q.antworten || q.choices;
    const richtigeAntwort = q.richtigeAntwort ?? (Array.isArray(q.choices) ? q.choices[q.answerIndex] : undefined);
    const id = q.id || `${q.level || "legacy"}-quiz-${index + 1}`;

    if (!frage || !Array.isArray(antworten) || !richtigeAntwort || seen.has(id)) return;
    if (!antworten.includes(richtigeAntwort)) return;

    seen.add(id);
    normalized.push({
      id,
      level: q.level || "",
      type: q.type || "legacy",
      frage,
      antworten: [...antworten],
      richtigeAntwort
    });
  });

  return normalized;
}

function prepareQuizRound(questions) {
  return shuffleArray(questions).map(q => ({
    ...q,
    antworten: shuffleArray(q.antworten)
  }));
}

function shuffleArray(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function syncNav() {
  document.querySelectorAll(".navBtn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === state.view);
  });
}

function wireWelcomeCards() {
  document.querySelectorAll("[data-welcome-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.welcomeAction;
      console.log("Welcome card click:", action);

      if (action === "learn") openFirstLesson();
      if (action === "quiz") openFirstQuiz();
      if (action === "progress") openProgressView();
    });
  });
}

window.openFirstLesson = function () {
  const selectedLevel = getActiveContentLevel("learn");
  const found = getFirstLesson((lesson, levelId) => levelMatches(selectedLevel, levelId));
  if (!found) return;

  state.view = "learn";
  syncNav();
  openLesson(found.lesson, found.levelId, found.unitId);
};

window.openFirstQuiz = function () {
  openLevelQuiz(getActiveContentLevel("learn"));
};

window.openProgressView = function () {
  state.view = "progress";
  state.activeLesson = null;
  saveUI();
  syncNav();
  renderProgress();
};

function renderLearnOverview() {
  const level = getActiveContentLevel("learn");
  const items = getFilteredLessons("learn", level);
  const label = isAllLevel(level) ? "alle Level" : level;

  setContent(
    "Wähle eine Lektion",
    `
<div id="welcome">
  ${renderLevelTabs("learn", level)}
  <h2 class="welcomeTitle">Willkommen 👋</h2>
  <p class="welcomeText">
    Wähle links eine Lektion (A1–C1) oder nutze oben die Navigation.
  </p>

  <div class="welcomeGrid">
    <button type="button" class="welcomeTile welcome-card-btn" data-welcome-action="learn">
      <h3>📚 Lernen</h3>
      <p>Starte mit einer Lektion und arbeite dich Schritt für Schritt hoch.</p>
    </button>

    <button type="button" class="welcomeTile welcome-card-btn" data-welcome-action="quiz">
      <h3>🧠 Quiz</h3>
      <p>Teste dein Wissen mit Mini-Quiz in jeder Lektion.</p>
    </button>

    <button type="button" class="welcomeTile welcome-card-btn" data-welcome-action="progress">
      <h3>⭐ Fortschritt</h3>
      <p>Sieh deinen Lernfortschritt und markiere erledigte Lektionen.</p>
    </button>
  </div>

  ${renderLessonCards(
    items,
    "Keine Lektionen gefunden",
    `Für ${label} gibt es mit der aktuellen Suche keine passenden Inhalte.`
  )}
</div>
    `
  );

  wireLevelTabs();
  wireWelcomeCards();
  wireLessonCards(items);
}

function renderLessonOverview(type, titleText) {
  const kind = type === "sentences" ? "sentences" : "vocab";
  const level = getActiveContentLevel(kind);
  const items = getFilteredLessons(type, level);
  const label = isAllLevel(level) ? "alle Level" : level;

  if (!items.length) {
    setContent(
      titleText,
      `
        ${renderLevelTabs(kind, level)}
        ${renderEmptyState(
          "Keine Inhalte gefunden",
          `Für ${label} gibt es mit der aktuellen Suche keine passenden ${type === "vocab" ? "Vokabeln" : "Sätze"}.`
        )}
      `
    );
    wireLevelTabs();
    return;
  }

  const html = `
    ${renderLevelTabs(kind, level)}
    <p>Klicke eine Lektion an:</p>
    ${renderLessonCards(items)}
  `;

  setContent(titleText, html);
  wireLevelTabs();
  wireLessonCards(items);
}

function renderLessonCards(items, emptyTitle = "Keine Inhalte gefunden", emptyText = "Mit der aktuellen Auswahl gibt es keine passenden Inhalte.") {
  if (!items.length) return renderEmptyState(emptyTitle, emptyText);
  return `
    <div class="overviewList">
      ${items
        .map(
          x => `
        <button class="overviewItem" data-lesson="${escapeHtml(x.lesson.id)}">
          <div class="overviewTitle">${escapeHtml(x.lesson.title)}</div>
          <div class="overviewMeta">${escapeHtml(x.levelId)} · ${escapeHtml(x.unitTitle)}</div>
        </button>
      `
        )
        .join("")}
    </div>
  `;
}

function wireLessonCards(items) {
  document.querySelectorAll(".overviewItem").forEach(btn => {
    btn.addEventListener("click", () => {
      const lessonId = btn.dataset.lesson;
      const found = items.find(x => x.lesson.id === lessonId);
      if (!found) return;

      openLesson(found.lesson, found.levelId, found.unitId);
    });
  });
}

/* ----------------------------
   Lesson Renderers
----------------------------- */
function renderVocabLesson(lesson) {
  const items = state.vocab?.[lesson.ref] || [];
  const body = document.getElementById("contentBody");
  if (!body) return;

  const tabKind = state.view === "learn" ? "learn" : "vocab";
  body.innerHTML = renderLevelTabs(tabKind, getActiveContentLevel(tabKind));
  wireLevelTabs();

  if (!items.length) {
    body.insertAdjacentHTML(
      "beforeend",
      renderEmptyState("Keine Vokabeln gefunden", `Für ${lesson.ref} sind momentan keine Vokabeln vorhanden.`)
    );
    return;
  }

  const grid = document.createElement("div");
  grid.className = "cardGrid";

  items.forEach((it, idx) => {
    const card = document.createElement("div");
    card.className = "card";

    const favKey = `${lesson.id}#${idx}`;
    const isFav = !!state.progress.favs[favKey];

card.innerHTML = `
  <div class="cardTop">
    <div class="word">${escapeHtml(it.de)}</div>

    <div class="cardActions">
      <button class="iconBtn" type="button" data-speak="${escapeHtml(it.de)}">🔊</button>
      <button class="iconBtn" type="button" data-fav="${favKey}">${isFav ? "★" : "☆"}</button>
    </div>
  </div>

  <div class="ar">${escapeHtml(it.ar || "")}</div>
  <div class="ex">${escapeHtml(it.example || "")}</div>
  <div class="sayRow">
  <button class="secondary sayBtn" type="button" data-say="${escapeHtml(it.de)}">🎤 Sprechen</button>
  <div class="sayStatus" aria-live="polite"></div>
</div>
  <div class="tags">${(it.tags || [])
    .map(t => `<span class="tag">${escapeHtml(t)}</span>`)
    .join("")}</div>

  <button class="doneBtn" type="button">Als gelernt markieren</button>
`;

card.querySelector('[data-fav]')?.addEventListener("click", e => {
  const key = e.currentTarget.dataset.fav;
  state.progress.favs[key] = !state.progress.favs[key];
  saveProgress();
  renderVocabLesson(lesson);
});

card.querySelector('[data-speak]')?.addEventListener("click", e => {
  console.log("[TTS] Button geklickt");
  const text = e.currentTarget.dataset.speak || "";
  speakDe(text);
});
// 🎤 Pronunciation check (auto-stop)
const sayBtn = card.querySelector(".sayBtn");
const sayStatus = card.querySelector(".sayStatus");

sayBtn?.addEventListener("click", async (e) => {
  const target = e.currentTarget.dataset.say || "";
  if (!target) return;

  sayBtn.disabled = true;
  if (sayStatus) sayStatus.textContent = "🎧 Ich höre zu… Sprich jetzt.";

  try {
    const result = await pronounceCheckDe(target);
    // result: { ok, heard, score }

    if (result.ok) {
      if (sayStatus) sayStatus.textContent = `✅ Richtig! (${result.heard || "verstanden"})`;
    } else {
      if (sayStatus) sayStatus.textContent = `❌ Nicht ganz. Bitte wiederholen. (${result.heard || "nichts verstanden"})`;
    }
  } catch (err) {
    if (sayStatus) sayStatus.textContent = "⚠️ Spracherkennung nicht verfügbar / blockiert.";
  } finally {
    sayBtn.disabled = false;
  }
});

card.querySelector(".doneBtn")?.addEventListener("click", () => {
  state.progress.done[lesson.id] = true;
  saveProgress();
  rerender();
});
    grid.appendChild(card);
  });

  body.appendChild(grid);
}

function renderSentenceLesson(lesson) {
  const items = state.sentences?.[lesson.ref] || [];
  const body = document.getElementById("contentBody");
  if (!body) return;

  const tabKind = state.view === "learn" ? "learn" : "sentences";
  body.innerHTML = renderLevelTabs(tabKind, getActiveContentLevel(tabKind));
  wireLevelTabs();

  if (!items.length) {
    body.insertAdjacentHTML(
      "beforeend",
      renderEmptyState("Keine Sätze gefunden", `Für ${lesson.ref} sind momentan keine Sätze vorhanden.`)
    );
    return;
  }

  const list = document.createElement("div");
  list.className = "sentenceList";

  items.forEach(s => {
    const row = document.createElement("div");
    row.className = "sentenceRow";
    row.innerHTML = `
      <div class="de">${escapeHtml(s.de)}</div>
      <div class="ar">${escapeHtml(s.ar || "")}</div>
      <div class="note">${escapeHtml(s.note || "")}</div>
    `;
    list.appendChild(row);
  });

  const doneBtn = document.createElement("button");
  doneBtn.className = "primary";
  doneBtn.textContent = "Lektion als erledigt markieren";
  doneBtn.addEventListener("click", () => {
    state.progress.done[lesson.id] = true;
    saveProgress();
    rerender();
  });

  body.appendChild(list);
  body.appendChild(doneBtn);
}

function renderQuizLevelTabs(activeLevel) {
  const options = [
    { value: QUIZ_LEVEL_ALL, label: "Alle" },
    ...QUIZ_LEVELS.map(level => ({ value: level, label: level }))
  ];

  return `
    <div class="quizLevelBar" role="tablist" aria-label="Quiz-Level auswählen">
      ${options
        .map(option => {
          const active = option.value === activeLevel;
          const count = getQuizLevelCount(option.value);
          return `
        <button
          type="button"
          class="quizLevelBtn${active ? " active" : ""}"
          data-quiz-level="${escapeHtml(option.value)}"
          aria-pressed="${active ? "true" : "false"}"
        >
          <span>${escapeHtml(option.label)}</span>
          <small>${count}</small>
        </button>
      `;
        })
        .join("")}
    </div>
  `;
}

function wireQuizLevelTabs() {
  document.querySelectorAll("[data-quiz-level]").forEach(btn => {
    btn.addEventListener("click", () => {
      openQuizView(btn.dataset.quizLevel);
    });
  });
}

function renderQuizLesson(lesson) {
  const body = document.getElementById("contentBody");
  if (!body) return;

  const selectedLevel = normalizeQuizLevel(state.quizLevel);
  const questions = getQuizQuestions(lesson);
  if (!questions.length) {
    const label = isAllQuizLevel(selectedLevel) ? "alle Level" : selectedLevel;
    body.innerHTML = `
      <div class="quizBox">
        ${renderQuizLevelTabs(selectedLevel)}
        <div class="quizEmpty">
          <h3>Keine Quizfragen gefunden</h3>
          <p>Für ${escapeHtml(label)} sind momentan keine Fragen verfügbar.</p>
        </div>
      </div>
    `;
    wireQuizLevelTabs();
    return;
  }

  const shuffled = prepareQuizRound(questions);

  let current = 0;
  let score = 0;
  let answered = false;
  let streak = 0;

  body.innerHTML = `
    <div class="quizBox">
      ${renderQuizLevelTabs(selectedLevel)}
      <div class="quizTop">
        <div id="quizProgress"></div>
        <div id="quizScore"></div>
      </div>

      <div id="quizQuestion" class="quizQuestion"></div>
      <div id="quizChoices" class="quizChoices"></div>

      <div id="quizFeedback" class="quizFeedback"></div>

      <div class="quizBottom">
        <button class="primary" id="quizNext">Weiter</button>
        <button class="doneBtn" id="quizFinish" style="display:none;">Quiz beenden</button>
      </div>
    </div>
  `;

  const elProgress = document.getElementById("quizProgress");
  const elScore = document.getElementById("quizScore");
  const elQ = document.getElementById("quizQuestion");
  const elChoices = document.getElementById("quizChoices");
  const elFeedback = document.getElementById("quizFeedback");
  const btnNext = document.getElementById("quizNext");
  const btnFinish = document.getElementById("quizFinish");
  wireQuizLevelTabs();

  function renderStep() {
    const q = shuffled[current];
    
    answered = false;
    btnNext.disabled = true;
    btnFinish.disabled = true;

    elProgress.textContent = `Frage ${current + 1} / ${shuffled.length}`;

    elScore.textContent = `Punkte: ${score} · Streak: ${streak}`;
    elQ.textContent = q.frage;

    elFeedback.textContent = "";
    elFeedback.className = "quizFeedback";

    elChoices.innerHTML = "";
    q.antworten.forEach(choice => {
      const btn = document.createElement("button");
      btn.className = "quizChoice";
      btn.textContent = choice;

      btn.addEventListener("click", () => {
        // disable all choices after pick
        [...elChoices.querySelectorAll("button")].forEach(b => (b.disabled = true));

        const correct = choice === q.richtigeAntwort;
        if (correct) {
          score += 1;
          streak += 1;
          btn.classList.add("correct");
          elFeedback.textContent = "✅ Richtig!";
          elFeedback.classList.add("ok");
        } else {
          streak = 0;
          btn.classList.add("wrong");
          const correctBtn = [...elChoices.querySelectorAll("button")].find(b => b.textContent === q.richtigeAntwort);
          if (correctBtn) correctBtn.classList.add("correct");
          elFeedback.textContent = "❌ Falsch.";
          elFeedback.classList.add("bad");
        }
         elScore.textContent = `Punkte: ${score} · Streak: ${streak}`;
         
         answered = true;
         btnNext.disabled = false;
         btnFinish.disabled = false;
      });

      elChoices.appendChild(btn);
    });

    // last step UI
    if (current === shuffled.length - 1) {
      btnNext.style.display = "none";
      btnFinish.style.display = "inline-block";
    } else {
      btnNext.style.display = "inline-block";
      btnFinish.style.display = "none";
    }
  }

  btnNext.addEventListener("click", () => {
    current = Math.min(current + 1, shuffled.length - 1);
    renderStep();
  });

  btnFinish.addEventListener("click", () => {
    state.progress.done[lesson.id] = true;
    saveProgress();

    setContent(
      "Quiz beendet",
      `
      <div class="quizBox">
        <div class="quizQuestion">
          Ergebnis: <b>${score}</b> / <b>${shuffled.length}</b>
        </div>

        <div class="quizBottom" style="margin-top:12px;">
          <button class="primary" id="retryQuiz">Wiederholen</button>
          <button class="doneBtn" id="backToLearn">Zurück</button>
        </div>
      </div>
      `
    );

    document.getElementById("retryQuiz")?.addEventListener("click", () => {
      openLesson(lesson, state.activeLesson.levelId, state.activeLesson.unitId);
    });

    document.getElementById("backToLearn")?.addEventListener("click", () => {
      rerender();
    });
  });

  renderStep();
}

/* ----------------------------
   Progress
----------------------------- */
function renderProgress() {
  const stats = getProgressStats();

  setContent(
    "Fortschritt",
    `
      ${renderProgressBars(stats)}
      <div class="progressBox" style="margin-top:14px;">
        <div>Favoriten: <b>${Object.values(state.progress.favs).filter(Boolean).length}</b></div>
        <button class="danger" id="reset">Progress zurücksetzen</button>
      </div>
    `
  );

  document.getElementById("reset")?.addEventListener("click", () => {
    state.progress = { done: {}, favs: {} };
    saveProgress();
    rerender();
  });
}

function countLessons() {
  let n = 0;
  state.curriculum.levels.forEach(l => (l.units || []).forEach(u => (n += (u.lessons || []).length)));
  return n;
}

function getProgressStats() {
  const levels = state.curriculum.levels || [];
  const doneSet = state.progress.done || {};

  const byLevel = levels.map(level => {
    let total = 0;
    let done = 0;

    (level.units || []).forEach(unit => {
      (unit.lessons || []).forEach(lesson => {
        total += 1;
        if (doneSet[lesson.id]) done += 1;
      });
    });

    return { levelId: level.id, title: level.title, done, total };
  });

  const total = byLevel.reduce((a, x) => a + x.total, 0);
  const done = byLevel.reduce((a, x) => a + x.done, 0);

  return { total, done, byLevel };
}

function renderProgressBars(stats) {
  const percent = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  const levelBars = stats.byLevel
    .map(l => {
      const p = l.total ? Math.round((l.done / l.total) * 100) : 0;
      return `
        <div class="pRow">
          <div class="pLabel">${escapeHtml(l.title)}</div>
          <div class="pBar"><div class="pFill" style="width:${p}%"></div></div>
          <div class="pNum">${l.done}/${l.total}</div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="pCard">
      <div class="pHeader">
        <div><b>Gesamt</b> · ${stats.done}/${stats.total}</div>
        <div>${percent}%</div>
      </div>
      <div class="pBar big"><div class="pFill" style="width:${percent}%"></div></div>
    </div>

    <div class="pCard">
      <div class="pHeader"><b>A1–C1</b></div>
      ${levelBars}
    </div>
  `;
}
/* ----------------------------
   Utils
----------------------------- */
function setContent(title, html) {
  const t = document.getElementById("contentTitle");
  const m = document.getElementById("contentMeta");
  const b = document.getElementById("contentBody");

  if (t) t.textContent = title;
  if (m) m.textContent = "";
  if (b) b.innerHTML = html;
}

async function fetchJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Kann ${path} nicht laden (${res.status})`);
  return res.json();
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem("lernen_progress")) || { done: {}, favs: {} };
  } catch {
    return { done: {}, favs: {} };
  }
}

function saveProgress() {
  localStorage.setItem("lernen_progress", JSON.stringify(state.progress));
}

function loadQuizLevel() {
  try {
    return normalizeQuizLevel(localStorage.getItem(QUIZ_LEVEL_STORAGE_KEY));
  } catch {
    return QUIZ_LEVEL_ALL;
  }
}

function saveQuizLevel() {
  localStorage.setItem(QUIZ_LEVEL_STORAGE_KEY, state.quizLevel);
}

function loadContentLevel(kind) {
  try {
    return normalizeContentLevel(localStorage.getItem(CONTENT_LEVEL_STORAGE_KEYS[kind]));
  } catch {
    return LEVEL_ALL;
  }
}

function saveContentLevel(kind) {
  const key = CONTENT_LEVEL_STORAGE_KEYS[kind];
  if (!key) return;
  localStorage.setItem(key, getActiveContentLevel(kind));
}

/* =========================
   Speech Recording + Check
========================= */

async function recordAndCheck(targetWord, statusEl) {

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const mediaRecorder = new MediaRecorder(stream);
  const chunks = [];

  mediaRecorder.ondataavailable = e => chunks.push(e.data);

  mediaRecorder.onstop = async () => {

    try {

      const blob = new Blob(chunks, { type: "audio/webm" });

      // Aufnahme beendet
statusEl.textContent = "✅ Aufnahme abgeschlossen. Sprich erneut wenn nötig.";

      if (spoken.includes(target)) {
        statusEl.textContent = `✅ Richtig: ${data.text}`;
      } else {
        statusEl.textContent = `❌ Bitte wiederholen`;
      }

    } catch (err) {

      statusEl.textContent = "⚠️ Fehler bei der Spracherkennung.";
      console.error(err);

    } finally {

      stream.getTracks().forEach(t => t.stop());

    }

  };

  mediaRecorder.start();

  // nimmt automatisch 3 Sekunden auf
  setTimeout(() => mediaRecorder.stop(), 3000);

}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function speakDe(text) {
  if (!("speechSynthesis" in window)) return;

  const u = new SpeechSynthesisUtterance(text || "Hallo");
  u.lang = "de-DE";

  window.speechSynthesis.speak(u);
}

function normalizeDe(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, "")   // punctuation raus
    .replace(/\s+/g, " ")
    .trim();
}

// einfache Ähnlichkeit (0..1)
function similarity(a, b) {
  a = normalizeDe(a);
  b = normalizeDe(b);
  if (!a && !b) return 1;
  if (!a || !b) return 0;

  // Levenshtein
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  const dist = dp[a.length][b.length];
  const maxLen = Math.max(a.length, b.length);
  return maxLen ? 1 - dist / maxLen : 1;
}

// 🔥 Hauptfunktion: hört zu und stoppt automatisch
function pronounceCheckDe(targetText) {
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return reject(new Error("SpeechRecognition not supported"));

    const rec = new SR();
    rec.lang = "de-DE";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    let heard = "";
    rec.onresult = (e) => {
      heard = e.results?.[0]?.[0]?.transcript || "";
    };

    rec.onerror = () => reject(new Error("speech error"));

    rec.onend = () => {
      const score = similarity(heard, targetText);

      // Schwelle: 0.78 ist “fair” (du kannst höher machen)
      const ok = score >= 0.78;

      resolve({ ok, heard, score });
    };

    // Start → Browser stoppt automatisch bei Pause
    try { rec.start(); } catch { /* ignore */ }
  });
}

let mediaRecorder = null;
let recordedChunks = [];

async function startRecording(onReady) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    onReady(url);
    stream.getTracks().forEach(t => t.stop());
  };

  mediaRecorder.start();
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
}
