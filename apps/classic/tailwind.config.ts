import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/classic-kit/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "SF Pro Display",
          "SF Pro Text",
          "Segoe UI",
          "Roboto",
          "Arial",
          "Noto Sans",
          "sans-serif"
        ]
      },
      colors: {
        accent: {
          dark: "#1F2035",
          yellow: "#FFD429",
          violet: "#8F6BFF"
        }
      },
      boxShadow: {
        soft: "0 8px 20px rgba(31, 32, 53, 0.06)",
        softSm: "0 3px 10px rgba(31, 32, 53, 0.08)"
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px"
      }
    }
  },
  plugins: []
};

export default config;

