const FAVORITES_KEY = "lernen_favorites";
const LEARNED_KEY = "lernen_learned";
const STREAK_KEY = "lernen_streak";
const QUIZ_KEY = "lernen_quiz";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function setFavorites(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export function getLearned(): string[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(LEARNED_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function setLearned(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LEARNED_KEY, JSON.stringify(ids));
}

export function getStreak(): number {
  if (typeof window === "undefined") return 0;
  const stored = window.localStorage.getItem(STREAK_KEY);
  return stored ? Number(stored) : 0;
}

export function setStreak(value: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STREAK_KEY, value.toString());
}

export function getQuizHistory(): { date: string; score: number }[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(QUIZ_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function setQuizHistory(value: { date: string; score: number }[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUIZ_KEY, JSON.stringify(value));
}
