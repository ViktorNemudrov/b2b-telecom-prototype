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
          dark: "#12121A",
          yellow: "#FFD429",
          violet: "#8F6BFF",
          orange: "#FF6B35",
          amber: "#FFB03B"
        },
        surface: {
          DEFAULT: "rgb(var(--card))",
          2: "rgb(var(--surface-2))"
        }
      },
      boxShadow: {
        soft: "0 8px 24px rgba(13, 13, 26, 0.12)",
        softSm: "0 3px 12px rgba(13, 13, 26, 0.10)",
        card: "0 2px 8px rgba(13, 13, 26, 0.08), 0 0 0 1px rgba(38, 40, 65, 0.06)"
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px"
      }
    }
  },
  plugins: []
};

export default config;

