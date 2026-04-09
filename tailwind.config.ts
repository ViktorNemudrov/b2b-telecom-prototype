import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
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
          teal: "#1A5F7A",
          violet: "#6C63FF"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(16, 24, 40, 0.08)",
        softSm: "0 6px 18px rgba(16, 24, 40, 0.10)"
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

