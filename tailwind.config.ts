import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FBF7F2",
        plum: { DEFAULT: "#5B2A3C", dark: "#3E1A28" },
        gold: { DEFAULT: "#B8924A", light: "#D9BE85" },
        rose: { soft: "#F1DCD8" },
      },
      fontFamily: { sans: ["var(--font-tajawal)", "sans-serif"], display: ["var(--font-reem)", "serif"] },
      keyframes: { "fade-up": { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } } },
      animation: { "fade-up": "fade-up .7s ease-out both" },
    },
  },
  plugins: [],
} satisfies Config;
