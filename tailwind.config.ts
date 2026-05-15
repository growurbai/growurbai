import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#0a0a0a",
        electric: {
          DEFAULT: "#7c3aed",
          dim: "#5b21b6",
          glow: "#a78bfa",
        },
        gold: {
          DEFAULT: "#f59e0b",
          dim: "#d97706",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(124, 58, 237, 0.55)",
        "glow-gold": "0 0 32px -6px rgba(245, 158, 11, 0.45)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "gradient-shift": "gradient-shift 18s ease infinite",
        shimmer: "shimmer 2.4s linear infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 40%" },
          "50%": { backgroundPosition: "100% 60%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
      },
      backgroundSize: {
        "300%": "300% 300%",
      },
    },
  },
  plugins: [],
};

export default config;
