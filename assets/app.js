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
  }

  wireNav();
  rerender();
}

/* =========================
   Nav + Search
========================= */
function wireNav() {
  document.querySelectorAll(".navBtn").forEach(btn => {
    btn.addEventListener("click", () => {
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
      renderTree(search.value.trim().toLowerCase());
    });
  }
}

/* =========================
   Rerender (Tabs)
========================= */
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

    setContent(
      "Wähle eine Lektion",
      `
<div id="welcome">
  <h2 class="welcomeTitle">Willkommen 👋</h2>
  <p class="welcomeText">
    Wähle links eine Lektion (A1–C1) oder nutze oben die Navigation.
  </p>

  <div class="welcomeGrid">
    <div class="welcomeTile">
      <h3>📚 Lernen</h3>
      <p>Starte mit einer Lektion und arbeite dich Schritt für Schritt hoch.</p>
    </div>

    <div class="welcomeTile">
      <h3>🧠 Quiz</h3>
      <p>Teste dein Wissen mit Mini-Quiz in jeder Lektion.</p>
    </div>

    <div class="welcomeTile">
      <h3>⭐ Fortschritt</h3>
      <p>Sieh deinen Lernfortschritt und markiere erledigte Lektionen.</p>
    </div>
  </div>
</div>
      `
    );
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

/* =========================
   Sidebar Tree
========================= */
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

        // Mark active
        if (state.activeLesson?.lesson?.id === lesson.id) btn.classList.add("active");

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

/* =========================
   Open Lesson
========================= */
function openLesson(lesson, levelId, unitId) {
  state.activeLesson = { lesson, levelId, unitId };
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

  const questions = state.quizzes?.[lesson.ref] || [];
  if (!questions.length) {
    body.innerHTML = `<p>Keine Quizfragen vorhanden für <b>${escapeHtml(lesson.ref)}</b>.</p>`;
    return;
  }

  // shuffle questions (copy)
  const shuffled = [...questions].sort(() => Math.random() - 0.5);

  let current = 0;
  let score = 0;
  let answered = false;
  let streak = 0;

  body.innerHTML = `
    <div class="quizBox">
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

  function renderStep() {
    const q = shuffled[current];
    
    answered = false;
    btnNext.disabled = true;
    btnFinish.disabled = true;

    elProgress.textContent = `Frage ${current + 1} / ${shuffled.length}`;

    elScore.textContent = `Punkte: ${score} · Streak: ${streak}`;
    elQ.textContent = q.q;

    elFeedback.textContent = "";
    elFeedback.className = "quizFeedback";

    elChoices.innerHTML = "";
    q.choices.forEach((choice, idx) => {
      const btn = document.createElement("button");
      btn.className = "quizChoice";
      btn.textContent = choice;

      btn.addEventListener("click", () => {
        // disable all choices after pick
        [...elChoices.querySelectorAll("button")].forEach(b => (b.disabled = true));

        const correct = idx === q.answerIndex;
        if (correct) {
          score += 1;
          streak += 1;
          btn.classList.add("correct");
          elFeedback.textContent = "✅ Richtig!";
          elFeedback.classList.add("ok");
        } else {
          streak = 0;
          btn.classList.add("wrong");
          const correctBtn = elChoices.querySelectorAll("button")[q.answerIndex];
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
