import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Wings brand palette (primary going forward) ──────────────────
        navy: {
          DEFAULT: "#001E50",
          light:   "#0A2D6E",
          deep:    "#001240",
        },
        gold: {
          DEFAULT: "#C4933F",
          hover:   "#D4A855",
          light:   "#F0E4CC",
        },
        charcoal: "#1C1A16",
        "warm-white": "#F8F6F0",
        "warm-gray":  "#E8E4DB",
        "mid-gray":   "#6B6560",

        // ── Legacy brown/cream (kept during phase-by-phase migration) ────
        brown: {
          50:  "#FAF7F4",
          100: "#F2EBE2",
          200: "#E3D4C3",
          300: "#CEBA9E",
          400: "#B49878",
          500: "#96755A",
          600: "#7A5640",
          700: "#5C3D2A",
          800: "#3D2614",
          900: "#1E1008",
        },
        cream: {
          DEFAULT: "#F5EFE6",
          50:  "#FDFBF8",
          100: "#F5EFE6",
          200: "#EAE0D0",
          300: "#DDD0BC",
        },
      },
      fontFamily: {
        // ── Wings brand fonts (primary going forward) ────────────────────
        display: ["Cormorant Garamond", "Georgia", "serif"],
        body:    ["Flexo", "system-ui", "sans-serif"],
        // ── Legacy (kept during migration) ──────────────────────────────
        sans:    ["Flexo", "Inter", "system-ui", "sans-serif"],
        serif:   ["Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card: "0 2px 16px rgba(0, 0, 0, 0.06)",
        "card-md": "0 2px 24px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
