const STORAGE_KEYS = {
  favorites: "lernen_favorites",
  learned: "lernen_learned"
};

const state = {
  favorites: JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || "[]"),
  learned: JSON.parse(localStorage.getItem(STORAGE_KEYS.learned) || "[]")
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
  favoriteCount: document.getElementById("favoriteCount"),
  learnedCount: document.getElementById("learnedCount"),
  focusProgressBar: document.getElementById("focusProgressBar"),
  focusProgressLabel: document.getElementById("focusProgressLabel"),
  weekProgressBar: document.getElementById("weekProgressBar")
};

function scrollToTopImmediately() {
  window.history.scrollRestoration = "manual";
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
}

function initTopStart() {
  scrollToTopImmediately();
  window.addEventListener("pageshow", scrollToTopImmediately);
  window.addEventListener("beforeunload", () => window.scrollTo(0, 0));
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(state.favorites));
  localStorage.setItem(STORAGE_KEYS.learned, JSON.stringify(state.learned));
}

function toggleInList(listName, id) {
  const list = state[listName];
  if (list.includes(id)) {
    state[listName] = list.filter((item) => item !== id);
  } else {
    state[listName] = [...list, id];
  }
  saveState();
  renderVocabulary();
  updateProgress();
}

function dailyWord() {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return vocabulary[dayIndex % vocabulary.length];
}

function renderDailyWord() {
  const word = dailyWord();
  els.dailyWord.innerHTML = `
    <span class="tag">Daily Word</span>
    <h3>${word.arabic}</h3>
    <p><strong>${word.article} ${word.german}</strong></p>
    <p class="muted">${word.example_de}</p>
  `;
}

function renderVocabulary() {
  const query = els.vocabSearch.value.trim().toLowerCase();
  const subset = vocabulary
    .filter((item) => [item.arabic, item.german, item.example_de, item.example_ar].join(" ").toLowerCase().includes(query))
    .slice(0, 9);

  els.vocabGrid.innerHTML = subset
    .map((item) => {
      const isFav = state.favorites.includes(item.id);
      const isLearned = state.learned.includes(item.id);
      return `
        <article class="surface-card hover-lift reveal">
          <div class="word-card-head">
            <strong>${item.arabic}</strong>
            <span class="tag">${item.level}</span>
          </div>
          <p><strong>${item.article} ${item.german}</strong></p>
          <p class="muted">${item.example_de}</p>
          <div class="card-actions">
            <button data-favorite="${item.id}" class="${isFav ? "active" : ""}">${isFav ? "Favorit ✓" : "Favorit"}</button>
            <button data-learned="${item.id}" class="${isLearned ? "active" : ""}">${isLearned ? "Gelernt ✓" : "Gelernt"}</button>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-favorite]").forEach((btn) => {
    btn.addEventListener("click", () => toggleInList("favorites", btn.dataset.favorite));
  });

  document.querySelectorAll("[data-learned]").forEach((btn) => {
    btn.addEventListener("click", () => toggleInList("learned", btn.dataset.learned));
  });

  initReveal();
}

function renderSentences() {
  const query = els.sentenceSearch.value.trim().toLowerCase();
  const subset = sentences
    .filter((item) => [item.arabic, item.german, item.category].join(" ").toLowerCase().includes(query))
    .slice(0, 6);

  els.sentenceGrid.innerHTML = subset
    .map(
      (item) => `
        <article class="surface-card hover-lift reveal">
          <div class="word-card-head">
            <span class="tag">${item.category}</span>
            <span class="tag">${item.level}</span>
          </div>
          <h3>${item.german}</h3>
          <p class="muted">${item.arabic}</p>
        </article>
      `
    )
    .join("");

  initReveal();
}

function updateProgress() {
  const percent = Math.round((state.learned.length / vocabulary.length) * 100) || 0;
  els.favoriteCount.textContent = String(state.favorites.length);
  els.learnedCount.textContent = String(state.learned.length);
  els.focusProgressBar.style.width = `${Math.min(percent, 100)}%`;
  els.focusProgressLabel.textContent = `${Math.min(percent, 100)}%`;
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

let observer;
function initReveal() {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function initBackgroundMotion() {
  const blobs = document.querySelectorAll(".bg-blur");
  window.addEventListener("mousemove", (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    blobs.forEach((blob, index) => {
      const depth = (index + 1) * 18;
      blob.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
  });
}

function initStaticMetrics() {
  els.year.textContent = new Date().getFullYear();
  els.kpiWords.textContent = `${vocabulary.length}+`;
  els.kpiSentences.textContent = `${sentences.length}+`;

  const weekProgress = 72;
  requestAnimationFrame(() => {
    els.weekProgressBar.style.width = `${weekProgress}%`;
  });
}

function initSearch() {
  els.vocabSearch.addEventListener("input", renderVocabulary);
  els.sentenceSearch.addEventListener("input", renderSentences);
}

function init() {
  initTopStart();
  initNavigation();
  initBackgroundMotion();
  initSearch();
  initStaticMetrics();
  renderDailyWord();
  renderVocabulary();
  renderSentences();
  updateProgress();
  initReveal();
}

init();
