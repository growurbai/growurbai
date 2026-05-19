import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "aspect-square",
    "aspect-[4/5]",
    "aspect-[9/16]",
    "aspect-[16/9]",
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
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
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
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
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
