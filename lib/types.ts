export type VocabularyItem = {
  id: string;
  arabic: string;
  german: string;
  article: "der" | "die" | "das";
  plural?: string;
  example_de: string;
  example_ar: string;
  level: "A1" | "A2";
  category: "Alltag" | "Essen" | "Arbeit" | "Arzt" | "Wohnung";
};

export type SentenceItem = {
  id: string;
  arabic: string;
  german: string;
  level: "A1" | "A2";
  category: "Alltag" | "Essen" | "Arbeit" | "Arzt" | "Wohnung";
};

export type QuizScore = {
  date: string;
  score: number;
};
