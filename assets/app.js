const state = {
  curriculum: null,
  vocab: null,
  sentences: null,
  activeLesson: null,
  view: "learn",
  progress: loadProgress()
};

init();

async function init() {
  const [curriculum, vocab, sentences] = await Promise.all([
    fetchJson("data/curriculum.json"),
    fetchJson("data/vocab.json"),
    fetchJson("data/sentences.json")
  ]);

  state.curriculum = curriculum;
  state.vocab = vocab;
  state.sentences = sentences;

  wireNav();
  renderTree();
  renderProgress();
}

function wireNav() {
  document.querySelectorAll(".navBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.view = btn.dataset.view;
      rerender();
    });
  });

  const search = document.getElementById("search");
  if (search) {
    search.addEventListener("input", () => {
      renderTree(search.value.trim().toLowerCase());
    });
  }
}

/**
 * Renders UI depending on current selected tab (state.view)
 * and the currently selected lesson (state.activeLesson).
 */
function rerender() {
  const q = (document.getElementById("search")?.value || "").trim().toLowerCase();
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

    setContent("Wähle eine Lektion", "<p>Wähle links A1 oder A2.</p>");
    return;
  }

  // Lesson selected
  const lesson = state.activeLesson.lesson;

  // If user is on a specific tab but selected lesson type doesn't match, show hint.
  if (state.view === "vocab" && lesson.type !== "vocab") {
    renderLessonOverview("vocab", "Vokabeln");
    return;
  }
  if (state.view === "sentences" && lesson.type !== "sentences") {
    renderLessonOverview("sentences", "Sätze");
    return;
  }

  openLesson(lesson, state.activeLesson.levelId, state.activeLesson.unitId);
}

function renderTree(filter = "") {
  const root = document.getElementById("tree");
  if (!root) return;

  root.innerHTML = "";

  state.curriculum.levels.forEach(level => {
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
        if (filter && !searchable.includes(filter)) return;

        const btn = document.createElement("button");
        btn.className = "treeLessonBtn";

        const done = !!state.progress.done[lesson.id];
        btn.textContent = `${done ? "✅ " : ""}${lesson.title}`;

        btn.addEventListener("click", () => openLesson(lesson, level.id, unit.id));
        lessonsEl.appendChild(btn);
      });

      unitWrap.appendChild(lessonsEl);
      unitsEl.appendChild(unitWrap);
    });

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

function openLesson(lesson, levelId, unitId) {
  state.activeLesson = { lesson, levelId, unitId };

  // If progress tab is open, keep progress view
  if (state.view === "progress") {
    renderProgress();
    return;
  }

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
-----------------------------*/

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

function renderLessonOverview(type, titleText) {
  const items = getAllLessonsByType(type);

  if (!items.length) {
    setContent(titleText, `<p>Keine Lektionen vom Typ <b>${escapeHtml(type)}</b> gefunden.</p>`);
    return;
  }

  const html = `
    <p>Klicke eine Lektion an:</p>
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

  setContent(titleText, html);

  document.querySelectorAll(".overviewItem").forEach(btn => {
    btn.addEventListener("click", () => {
      const lessonId = btn.dataset.lesson;
      const found = items.find(x => x.lesson.id === lessonId);
      if (!found) return;

      state.activeLesson = { lesson: found.lesson, levelId: found.levelId, unitId: found.unitId };
      openLesson(found.lesson, found.levelId, found.unitId);
    });
  });
}

/* ----------------------------
   Lesson Renderers
-----------------------------*/

function renderVocabLesson(lesson) {
  const items = state.vocab?.[lesson.ref] || [];
  const body = document.getElementById("contentBody");
  if (!body) return;

  body.innerHTML = "";

  if (!items.length) {
    body.innerHTML = `<p>Keine Vokabeln vorhanden für <b>${escapeHtml(lesson.ref)}</b>.</p>`;
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
        <button class="iconBtn" data-fav="${favKey}">${isFav ? "★" : "☆"}</button>
      </div>
      <div class="ar">${escapeHtml(it.ar || "")}</div>
      <div class="ex">${escapeHtml(it.example || "")}</div>
      <div class="tags">${(it.tags || [])
        .map(t => `<span class="tag">${escapeHtml(t)}</span>`)
        .join("")}</div>
      <button class="doneBtn">Als gelernt markieren</button>
    `;

    card.querySelector(".iconBtn").addEventListener("click", e => {
      const key = e.currentTarget.dataset.fav;
      state.progress.favs[key] = !state.progress.favs[key];
      saveProgress();
      renderVocabLesson(lesson);
    });

    card.querySelector(".doneBtn").addEventListener("click", () => {
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

  body.innerHTML = "";

  if (!items.length) {
    body.innerHTML = `<p>Keine Sätze vorhanden für <b>${escapeHtml(lesson.ref)}</b>.</p>`;
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

function renderQuizLesson(lesson) {
  const body = document.getElementById("contentBody");
  if (!body) return;

  body.innerHTML = `
    <p>Quiz kommt später. (Skeleton)</p>
    <button class="primary" id="quizDone">Quiz als erledigt markieren</button>
  `;

  document.getElementById("quizDone")?.addEventListener("click", () => {
    state.progress.done[lesson.id] = true;
    saveProgress();
    rerender();
  });
}

/* ----------------------------
   Progress
-----------------------------*/

function renderProgress() {
  const total = countLessons();
  const done = Object.keys(state.progress.done).length;

  setContent(
    "Fortschritt",
    `
      <div class="progressBox">
        <div><b>${done}</b> / <b>${total}</b> Lektionen erledigt</div>
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
  state.curriculum.levels.forEach(l =>
    (l.units || []).forEach(u => (n += (u.lessons || []).length))
  );
  return n;
}

/* ----------------------------
   Utils
-----------------------------*/

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

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
