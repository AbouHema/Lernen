const translations = {
  de: {
    heroTitle: "Deutsch lernen auf B1–C1-Niveau",
    heroSubtitle:
      "Trainiere Deutsch mit B1–C1-Inhalten, klarer Typografie und schneller Bedienung – optimiert für arabischsprachige Lernende.",
    cta: "Jetzt lernen",
    trust: "Über 12.000 Lernende nutzen Lernen täglich",
    featuresTitle: "Alles, was du brauchst",
    featuresSubtitle: "B1–C1 Vokabeln, Sätze und Übungen – jetzt mit 160+ Wörtern und 90+ Sätzen.",
    dashboardTitle: "Dein Lern-Dashboard",
    dailyWord: "Wort des Tages",
    searchPlaceholder: "Suche nach Arabisch oder Deutsch",
    favorites: "Favoriten",
    learned: "Gelernt",
    markLearned: "Als gelernt markieren",
    addFavorite: "Zu Favoriten",
    removeFavorite: "Aus Favoriten",
    correct: "Richtig",
    incorrect: "Nicht ganz",
    submit: "Antwort prüfen",
    next: "Weiter",
    back: "Zurück",
    reset: "Neu starten",
    darkMode: "Dark Mode",
    language: "Sprache",
    levelLabel: "Level",
    categoryLabel: "Kategorie",
    exerciseLevelLabel: "Übungs-Level",
    allLevels: "Alle Level",
    allCategories: "Alle Kategorien",
    levelHint: "Starte mit B1 und arbeite dich bis C1 vor – du kannst jederzeit umschalten.",
    audioHint: "🔊 Tippe auf das Audio-Icon, um die deutsche Aussprache zu hören.",
    speak: "Aussprache anhören",
    audioUnavailable: "Audio ist in diesem Browser nicht verfügbar."
  },
  ar: {
    heroTitle: "تعلّم الألمانية بمستوى B1–C1",
    heroSubtitle:
      "تدرّب على محتوى مستويات B1–C1 بتصميم أنيق وسرعة في الاستخدام – مخصص للمتعلمين الناطقين بالعربية.",
    cta: "ابدأ التعلّم",
    trust: "أكثر من ١٢٬٠٠٠ متعلم يستخدمون Lernen يوميًا",
    featuresTitle: "كل ما تحتاجه",
    featuresSubtitle: "مفردات وجُمل وتمارين بمستويات B1–C1 مع أكثر من ١٦٠ كلمة و٩٠ جملة.",
    dashboardTitle: "لوحة التعلّم الخاصة بك",
    dailyWord: "كلمة اليوم",
    searchPlaceholder: "ابحث بالعربية أو الألمانية",
    favorites: "المفضلة",
    learned: "تم التعلم",
    markLearned: "علّم كمتعلم",
    addFavorite: "أضف للمفضلة",
    removeFavorite: "إزالة من المفضلة",
    correct: "إجابة صحيحة",
    incorrect: "إجابة غير صحيحة",
    submit: "تحقق من الإجابة",
    next: "التالي",
    back: "عودة",
    reset: "ابدأ من جديد",
    darkMode: "الوضع الداكن",
    language: "اللغة",
    levelLabel: "المستوى",
    categoryLabel: "الفئة",
    exerciseLevelLabel: "مستوى التمارين",
    allLevels: "كل المستويات",
    allCategories: "كل الفئات",
    levelHint: "ابدأ بـ B1 ثم انتقل إلى B2 و C1، ويمكنك التبديل في أي وقت.",
    audioHint: "🔊 اضغط على أيقونة الصوت لسماع النطق بالألمانية.",
    speak: "استمع للنطق",
    audioUnavailable: "الصوت غير متاح في هذا المتصفح."
  }
};

const LEVEL_ORDER = ["B1", "B2", "C1"];

const state = {
  locale: localStorage.getItem("lernen_locale") || "de",
  theme: localStorage.getItem("lernen_theme") || "light",
  favorites: JSON.parse(localStorage.getItem("lernen_favorites") || "[]"),
  learned: JSON.parse(localStorage.getItem("lernen_learned") || "[]"),
  quizHistory: JSON.parse(localStorage.getItem("lernen_quiz") || "[]")
};

const elements = {
  languageToggle: document.getElementById("languageToggle"),
  languageMenu: document.getElementById("languageMenu"),
  themeToggle: document.getElementById("themeToggle"),
  darkModeLabel: document.getElementById("darkModeLabel"),
  heroTitle: document.getElementById("heroTitle"),
  heroSubtitle: document.getElementById("heroSubtitle"),
  ctaButton: document.getElementById("ctaButton"),
  trustText: document.getElementById("trustText"),
  featuresTitle: document.getElementById("featuresTitle"),
  featuresSubtitle: document.getElementById("featuresSubtitle"),
  dashboardTitle: document.getElementById("dashboardTitle"),
  dailyWordLabel: document.getElementById("dailyWordLabel"),
  vocabSearch: document.getElementById("vocabSearch"),
  vocabGrid: document.getElementById("vocabGrid"),
  favoriteCount: document.getElementById("favoriteCount"),
  vocabLevel: document.getElementById("vocabLevel"),
  vocabCategory: document.getElementById("vocabCategory"),
  vocabLevelLabel: document.getElementById("vocabLevelLabel"),
  vocabCategoryLabel: document.getElementById("vocabCategoryLabel"),
  sentenceSearch: document.getElementById("sentenceSearch"),
  sentenceGrid: document.getElementById("sentenceGrid"),
  sentenceLevel: document.getElementById("sentenceLevel"),
  sentenceCategory: document.getElementById("sentenceCategory"),
  sentenceLevelLabel: document.getElementById("sentenceLevelLabel"),
  sentenceCategoryLabel: document.getElementById("sentenceCategoryLabel"),
  dailyWordCard: document.getElementById("dailyWordCard"),
  progressSummary: document.getElementById("progressSummary"),
  progressSummaryCard: document.getElementById("progressSummaryCard"),
  quizChart: document.getElementById("quizChart"),
  audioHint: document.getElementById("audioHint"),
  levelHint: document.getElementById("levelHint"),
  exerciseLevel: document.getElementById("exerciseLevel"),
  exerciseLevelLabel: document.getElementById("exerciseLevelLabel")
};

function applyLocale() {
  const t = translations[state.locale];
  document.documentElement.lang = state.locale === "ar" ? "ar" : "de";
  document.documentElement.dir = state.locale === "ar" ? "rtl" : "ltr";

  elements.heroTitle.textContent = t.heroTitle;
  elements.heroSubtitle.textContent = t.heroSubtitle;
  elements.ctaButton.textContent = t.cta;
  elements.trustText.textContent = t.trust;
  elements.featuresTitle.textContent = t.featuresTitle;
  elements.featuresSubtitle.textContent = t.featuresSubtitle;
  elements.dashboardTitle.textContent = t.dashboardTitle;
  elements.dailyWordLabel.textContent = t.dailyWord;
  elements.vocabSearch.placeholder = t.searchPlaceholder;
  elements.sentenceSearch.placeholder = t.searchPlaceholder;
  elements.darkModeLabel.textContent = t.darkMode;
  elements.languageToggle.textContent = t.language;
  elements.favoriteCount.textContent = `${state.favorites.length} ${t.favorites}`;
  elements.vocabLevelLabel.textContent = t.levelLabel;
  elements.vocabCategoryLabel.textContent = t.categoryLabel;
  elements.sentenceLevelLabel.textContent = t.levelLabel;
  elements.sentenceCategoryLabel.textContent = t.categoryLabel;
  elements.exerciseLevelLabel.textContent = t.exerciseLevelLabel;
  elements.audioHint.textContent = t.audioHint;
  elements.levelHint.textContent = t.levelHint;
  populateFilters();
}

function applyTheme() {
  document.body.classList.toggle("dark", state.theme === "dark");
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("lernen_theme", state.theme);
  applyTheme();
}

function toggleLocale(locale) {
  state.locale = locale;
  localStorage.setItem("lernen_locale", locale);
  applyLocale();
  renderVocabulary();
  renderSentences();
  renderExercises();
  renderProgress();
}

function populateFilters() {
  const t = translations[state.locale];
  const currentVocabLevel = elements.vocabLevel.value || "B1";
  const currentVocabCategory = elements.vocabCategory.value || "all";
  const currentSentenceLevel = elements.sentenceLevel.value || "B1";
  const currentSentenceCategory = elements.sentenceCategory.value || "all";
  const currentExerciseLevel = elements.exerciseLevel.value || "B1";

  const vocabLevels = getOrderedLevels(vocabulary);
  const vocabCategories = Array.from(new Set(vocabulary.map((item) => item.category)));
  const sentenceLevels = getOrderedLevels(sentences);
  const sentenceCategories = Array.from(new Set(sentences.map((item) => item.category)));

  elements.vocabLevel.innerHTML = [
    `<option value="all">${t.allLevels}</option>`,
    ...vocabLevels.map((level) => `<option value="${level}">${level}</option>`)
  ].join("");
  elements.vocabCategory.innerHTML = [
    `<option value="all">${t.allCategories}</option>`,
    ...vocabCategories.map((category) => `<option value="${category}">${category}</option>`)
  ].join("");
  elements.sentenceLevel.innerHTML = [
    `<option value="all">${t.allLevels}</option>`,
    ...sentenceLevels.map((level) => `<option value="${level}">${level}</option>`)
  ].join("");
  elements.sentenceCategory.innerHTML = [
    `<option value="all">${t.allCategories}</option>`,
    ...sentenceCategories.map((category) => `<option value="${category}">${category}</option>`)
  ].join("");
  elements.exerciseLevel.innerHTML = [
    `<option value="all">${t.allLevels}</option>`,
    ...vocabLevels.map((level) => `<option value="${level}">${level}</option>`)
  ].join("");

  elements.vocabLevel.value = setDefaultLevel(currentVocabLevel, vocabLevels);
  elements.vocabCategory.value = currentVocabCategory;
  elements.sentenceLevel.value = setDefaultLevel(currentSentenceLevel, sentenceLevels);
  elements.sentenceCategory.value = currentSentenceCategory;
  elements.exerciseLevel.value = setDefaultLevel(currentExerciseLevel, vocabLevels);
}

function dailyWord() {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const orderedVocabulary = getOrderedVocabulary();
  return orderedVocabulary[dayIndex % orderedVocabulary.length];
}

function renderDailyWord() {
  const word = dailyWord();
  const t = translations[state.locale];
  elements.dailyWordCard.innerHTML = `
    <div class="card-header">
      <div>
        <strong>${word.arabic}</strong>
        <p>${word.article} ${word.german} · ${word.category}</p>
      </div>
      <button class="icon-button" data-speak="${word.german}" aria-label="${t.speak}" title="${t.speak}">🔊</button>
    </div>
    <p class="muted">${word.example_de}</p>
  `;
  bindSpeakButtons(elements.dailyWordCard);
}

function saveProgress() {
  localStorage.setItem("lernen_favorites", JSON.stringify(state.favorites));
  localStorage.setItem("lernen_learned", JSON.stringify(state.learned));
  localStorage.setItem("lernen_quiz", JSON.stringify(state.quizHistory));
}

function toggleFavorite(id) {
  if (state.favorites.includes(id)) {
    state.favorites = state.favorites.filter((item) => item !== id);
  } else {
    state.favorites.push(id);
  }
  saveProgress();
  renderVocabulary();
}

function toggleLearned(id) {
  if (state.learned.includes(id)) {
    state.learned = state.learned.filter((item) => item !== id);
  } else {
    state.learned.push(id);
  }
  saveProgress();
  renderVocabulary();
  renderProgress();
}

function renderVocabulary() {
  const query = elements.vocabSearch.value.toLowerCase();
  const t = translations[state.locale];
  const level = elements.vocabLevel.value;
  const category = elements.vocabCategory.value;
  const filtered = getOrderedVocabulary().filter((item) => {
    const matchesQuery = [item.arabic, item.german, item.example_de, item.example_ar]
      .join(" ")
      .toLowerCase()
      .includes(query);
    const matchesLevel = level === "all" || item.level === level;
    const matchesCategory = category === "all" || item.category === category;
    return matchesQuery && matchesLevel && matchesCategory;
  });

  elements.vocabGrid.innerHTML = filtered
    .map((item) => {
      const isFavorite = state.favorites.includes(item.id);
      const isLearned = state.learned.includes(item.id);
      return `
      <article class="vocab-card">
        <div class="card-header">
          <div>
            <h3>${item.arabic}</h3>
            <p>${item.article} ${item.german}</p>
          </div>
          <div class="card-actions compact">
            <span class="tag">${item.level}</span>
            <button class="icon-button" data-speak="${item.german}" aria-label="${t.speak}" title="${t.speak}">🔊</button>
          </div>
        </div>
        <div class="card-content">
          <p>${item.example_de}</p>
          <p class="muted">${item.example_ar}</p>
        </div>
        <div class="card-actions">
          <button class="secondary-button" data-favorite="${item.id}">
            ${isFavorite ? t.removeFavorite : t.addFavorite}
          </button>
          <button class="ghost-button" data-learned="${item.id}">
            ${isLearned ? t.learned : t.markLearned}
          </button>
        </div>
      </article>
    `;
    })
    .join("");

  elements.favoriteCount.textContent = `${state.favorites.length} ${t.favorites}`;

  document.querySelectorAll("[data-favorite]").forEach((button) =>
    button.addEventListener("click", () => toggleFavorite(button.dataset.favorite))
  );
  document.querySelectorAll("[data-learned]").forEach((button) =>
    button.addEventListener("click", () => toggleLearned(button.dataset.learned))
  );
  bindSpeakButtons(elements.vocabGrid);
}

function renderSentences() {
  const query = elements.sentenceSearch.value.toLowerCase();
  const level = elements.sentenceLevel.value;
  const category = elements.sentenceCategory.value;
  const filtered = getOrderedSentences().filter((item) => {
    const matchesQuery = [item.arabic, item.german].join(" ").toLowerCase().includes(query);
    const matchesLevel = level === "all" || item.level === level;
    const matchesCategory = category === "all" || item.category === category;
    return matchesQuery && matchesLevel && matchesCategory;
  });

  elements.sentenceGrid.innerHTML = filtered
    .map(
      (item) => `
      <article class="sentence-card">
        <div class="card-header">
          <div class="sentence-meta">
            <span class="tag">${item.category}</span>
            <span class="badge">${item.level}</span>
          </div>
          <button class="icon-button" data-speak="${item.german}" aria-label="${translations[state.locale].speak}" title="${translations[state.locale].speak}">🔊</button>
        </div>
        <div class="card-content">
          <strong>${item.german}</strong>
          <p class="muted">${item.arabic}</p>
        </div>
      </article>
    `
    )
    .join("");
  bindSpeakButtons(elements.sentenceGrid);
}

function renderProgress() {
  const percentage = Math.min(100, Math.round((state.learned.length / vocabulary.length) * 100));
  const streak = state.quizHistory.length;

  const content = `
    <div class="progress-stats">
      <div>
        <p class="muted">Gelernte Wörter</p>
        <strong>${state.learned.length}</strong>
      </div>
      <div>
        <p class="muted">Streak</p>
        <strong>${streak}</strong>
      </div>
    </div>
    <div class="progress-bar">
      <span style="width: ${percentage}%"></span>
    </div>
    <p class="muted">${percentage}% der Vokabeln gelernt</p>
  `;

  elements.progressSummary.innerHTML = content;
  elements.progressSummaryCard.innerHTML = `<div class="card-content">${content}</div>`;

  renderQuizChart();
}

function renderQuizChart() {
  if (state.quizHistory.length === 0) {
    elements.quizChart.innerHTML = `<p class="muted">Noch keine Quiz-Daten vorhanden.</p>`;
    return;
  }

  const maxScore = 10;
  const width = 260;
  const height = 120;
  const points = state.quizHistory
    .map((entry, index) => {
      const x = (index / Math.max(state.quizHistory.length - 1, 1)) * width;
      const y = height - (entry.score / maxScore) * height;
      return `${x},${y}`;
    })
    .join(" ");

  elements.quizChart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" width="100%" height="120" aria-label="Quiz Verlauf">
      <polyline fill="none" stroke="#3b5bff" stroke-width="3" points="${points}" />
    </svg>
  `;
}

function renderExercises() {
  renderFlashcards();
  renderMultipleChoice();
  renderGap();
  renderMiniQuiz();
}

function renderFlashcards() {
  const container = document.getElementById("flashcards");
  const items = getExerciseVocabulary();
  if (items.length === 0) {
    container.innerHTML = `<div class="card"><div class="card-content"><p class="muted">Keine Vokabeln für dieses Level gefunden.</p></div></div>`;
    return;
  }
  let index = 0;
  let flipped = false;

  function update() {
    const item = items[index % items.length];
    container.innerHTML = `
      <div class="card">
        <div class="card-content">
          <div class="flashcard">
            <strong>${flipped ? `${item.article} ${item.german}` : item.arabic}</strong>
            <p class="muted">${flipped ? item.example_de : item.example_ar}</p>
          </div>
          <div class="card-actions">
            <button class="primary-button" id="nextCard">${translations[state.locale].next}</button>
            <button class="icon-button" data-speak="${item.german}" aria-label="${translations[state.locale].speak}" title="${translations[state.locale].speak}">🔊</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector("#nextCard").addEventListener("click", () => {
      if (!flipped) {
        flipped = true;
      } else {
        index += 1;
        flipped = false;
      }
      update();
    });
    bindSpeakButtons(container);
  }

  update();
}

function renderMultipleChoice() {
  const container = document.getElementById("multiple");
  const items = getExerciseVocabulary();
  if (items.length === 0) {
    container.innerHTML = `<div class="card"><div class="card-content"><p class="muted">Keine Vokabeln für dieses Level gefunden.</p></div></div>`;
    return;
  }
  let index = 0;

  function update() {
    const item = items[index % items.length];
    const options = shuffle([
      `${item.article} ${item.german}`,
      ...shuffle(items.map((entry) => `${entry.article} ${entry.german}`)).slice(0, 3)
    ]);

    container.innerHTML = `
      <div class="card">
        <div class="card-content">
          <h3>${item.arabic}</h3>
          <p class="muted">${item.example_ar}</p>
          <div class="option-grid">
            ${options
              .map(
                (option) => `<button class="secondary-button option" data-option="${option}">${option}</button>`
              )
              .join("")}
          </div>
          <p class="muted" id="mcResult"></p>
          <button class="primary-button" id="mcNext">${translations[state.locale].next}</button>
        </div>
      </div>
    `;

    const result = container.querySelector("#mcResult");
    container.querySelectorAll(".option").forEach((button) => {
      button.addEventListener("click", () => {
        result.textContent =
          button.dataset.option === `${item.article} ${item.german}`
            ? translations[state.locale].correct
            : translations[state.locale].incorrect;
      });
    });

    container.querySelector("#mcNext").addEventListener("click", () => {
      index += 1;
      update();
    });
  }

  update();
}

function renderGap() {
  const container = document.getElementById("gap");
  const items = getExerciseSentences();
  if (items.length === 0) {
    container.innerHTML = `<div class="card"><div class="card-content"><p class="muted">Keine Sätze für dieses Level gefunden.</p></div></div>`;
    return;
  }
  let index = 0;

  function update() {
    const sentence = items[index % items.length];
    const words = sentence.german.split(" ");
    const gapWord = words[words.length - 1];
    const masked = sentence.german.replace(gapWord, "_____");

    container.innerHTML = `
      <div class="card">
        <div class="card-content">
          <h3>${masked}</h3>
          <p class="muted">${sentence.arabic}</p>
          <div class="card-actions">
            <input type="text" id="gapInput" placeholder="${translations[state.locale].submit}" />
            <button class="primary-button" id="gapCheck">${translations[state.locale].submit}</button>
          </div>
          <p class="muted" id="gapResult"></p>
          <button class="secondary-button" id="gapNext">${translations[state.locale].next}</button>
        </div>
      </div>
    `;

    container.querySelector("#gapCheck").addEventListener("click", () => {
      const value = container.querySelector("#gapInput").value.trim().toLowerCase();
      container.querySelector("#gapResult").textContent =
        value === gapWord.toLowerCase() ? translations[state.locale].correct : `${translations[state.locale].incorrect} – ${gapWord}`;
    });

    container.querySelector("#gapNext").addEventListener("click", () => {
      index += 1;
      update();
    });
  }

  update();
}

function renderMiniQuiz() {
  const container = document.getElementById("quiz");
  const quizItems = getExerciseVocabulary().slice(0, 10);
  if (quizItems.length === 0) {
    container.innerHTML = `<div class="card"><div class="card-content"><p class="muted">Keine Vokabeln für dieses Level gefunden.</p></div></div>`;
    return;
  }
  let step = 0;
  let answers = [];

  function finishQuiz() {
    const score = answers.reduce((acc, item, idx) => acc + (item === `${quizItems[idx].article} ${quizItems[idx].german}` ? 1 : 0), 0);
    state.quizHistory.push({ date: new Date().toISOString().slice(0, 10), score });
    saveProgress();
    renderProgress();
  }

  function update() {
    if (step >= quizItems.length) {
      container.innerHTML = `
        <div class="card">
          <div class="card-content">
            <h3>Review</h3>
            ${quizItems
              .map(
                (item, idx) => `
                <div class="mini-card">
                  <strong>${item.arabic}</strong>
                  <p>${item.article} ${item.german}</p>
                  <p class="muted">Antwort: ${answers[idx] || "-"}</p>
                </div>
              `
              )
              .join("")}
            <button class="secondary-button" id="quizReset">${translations[state.locale].reset}</button>
          </div>
        </div>
      `;
      container.querySelector("#quizReset").addEventListener("click", () => {
        step = 0;
        answers = [];
        update();
      });
      return;
    }

    const item = quizItems[step];
    const options = shuffle([
      `${item.article} ${item.german}`,
      ...shuffle(quizItems.map((entry) => `${entry.article} ${entry.german}`)).slice(0, 3)
    ]);

    container.innerHTML = `
      <div class="card">
        <div class="card-content">
          <span class="tag">Frage ${step + 1}/10</span>
          <h3>${item.arabic}</h3>
          <div class="option-grid">
            ${options
              .map(
                (option) => `<button class="secondary-button option" data-option="${option}">${option}</button>`
              )
              .join("")}
          </div>
          <button class="primary-button" id="quizNext">${step + 1 === quizItems.length ? "Review" : translations[state.locale].next}</button>
        </div>
      </div>
    `;

    let selection = null;
    const optionButtons = container.querySelectorAll(".option");
    optionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        selection = button.dataset.option;
        optionButtons.forEach((option) => option.classList.remove("active"));
        button.classList.add("active");
      });
    });

    container.querySelector("#quizNext").addEventListener("click", () => {
      answers[step] = selection;
      step += 1;
      if (step === quizItems.length) {
        finishQuiz();
      }
      update();
    });
  }

  update();
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getOrderedLevels(items) {
  const unique = Array.from(new Set(items.map((item) => item.level)));
  return unique.sort((a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b));
}

function setDefaultLevel(value, availableLevels) {
  if (value === "all") {
    return value;
  }
  return availableLevels.includes(value) ? value : "B1";
}

function sortByLevelThenName(a, b) {
  const levelCompare = LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level);
  if (levelCompare !== 0) {
    return levelCompare;
  }
  return (a.german || "").localeCompare(b.german || "");
}

function getOrderedVocabulary() {
  return [...vocabulary].sort(sortByLevelThenName);
}

function getOrderedSentences() {
  return [...sentences].sort(sortByLevelThenName);
}

function getExerciseVocabulary() {
  const level = elements.exerciseLevel.value;
  const ordered = getOrderedVocabulary();
  return level === "all" ? ordered : ordered.filter((item) => item.level === level);
}

function getExerciseSentences() {
  const level = elements.exerciseLevel.value;
  const ordered = getOrderedSentences();
  return level === "all" ? ordered : ordered.filter((item) => item.level === level);
}

function initTabs() {
  document.querySelectorAll(".tabs").forEach((tabGroup) => {
    const tabs = tabGroup.querySelectorAll(".tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((btn) => btn.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.dataset.tab;
        document.querySelectorAll(`#${target}`).forEach((panel) => panel.classList.add("active"));
        tabGroup.parentElement
          .querySelectorAll(".tab-content")
          .forEach((panel) => panel.classList.toggle("active", panel.id === target));
        if (tabGroup.classList.contains("exercise-tabs") && target === "quiz") {
          renderMiniQuiz();
        }
      });
    });
  });
}

function initControls() {
  elements.languageToggle.addEventListener("click", () => {
    elements.languageMenu.style.display =
      elements.languageMenu.style.display === "flex" ? "none" : "flex";
  });

  elements.languageMenu.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      toggleLocale(button.dataset.lang);
      elements.languageMenu.style.display = "none";
    });
  });

  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.vocabSearch.addEventListener("input", renderVocabulary);
  elements.sentenceSearch.addEventListener("input", renderSentences);
  elements.vocabLevel.addEventListener("change", renderVocabulary);
  elements.vocabCategory.addEventListener("change", renderVocabulary);
  elements.sentenceLevel.addEventListener("change", renderSentences);
  elements.sentenceCategory.addEventListener("change", renderSentences);
  elements.exerciseLevel.addEventListener("change", renderExercises);
}

function init() {
  applyLocale();
  applyTheme();
  initControls();
  initTabs();
  renderDailyWord();
  renderVocabulary();
  renderSentences();
  renderExercises();
  renderProgress();
}

init();

function bindSpeakButtons(scope) {
  scope.querySelectorAll("[data-speak]").forEach((button) => {
    button.addEventListener("click", () => speakGerman(button.dataset.speak));
  });
}

function speakGerman(text) {
  if (!("speechSynthesis" in window)) {
    alert(translations[state.locale].audioUnavailable);
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  const voices = window.speechSynthesis.getVoices();
  const germanVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("de"));
  if (germanVoice) {
    utterance.voice = germanVoice;
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
