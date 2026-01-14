"use client";

import * as React from "react";

import { translations, type Locale } from "@/lib/translations";

type AppContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  t: typeof translations.de;
};

const AppContext = React.createContext<AppContextValue | undefined>(undefined);

const LOCALE_KEY = "lernen_locale";
const THEME_KEY = "lernen_theme";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("de");
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const storedLocale = window.localStorage.getItem(LOCALE_KEY) as Locale | null;
    const storedTheme = window.localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
    if (storedLocale) {
      setLocaleState(storedLocale);
    }
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = locale === "ar" ? "ar" : "de";
  }, [locale]);

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_KEY, next);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  const value = React.useMemo(
    () => ({
      locale,
      setLocale,
      theme,
      toggleTheme,
      t: translations[locale]
    }),
    [locale, setLocale, theme, toggleTheme]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
