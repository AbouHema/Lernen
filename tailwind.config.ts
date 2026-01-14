import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3B5BFF",
          foreground: "#ffffff"
        },
        surface: "#F7F8FB",
        muted: "#6B7280"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 23, 42, 0.08)",
        card: "0 12px 30px rgba(15, 23, 42, 0.08)"
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.75rem"
      }
    }
  },
  plugins: []
};

export default config;
