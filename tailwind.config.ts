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
        // ── Wings site palette ───────────────────────────────────────────
        navy: {
          DEFAULT: "#004389",
          light:   "#1459A8",
          deep:    "#062663",
        },
        gold: {
          DEFAULT: "#C4933F",
          hover:   "#D4A855",
          light:   "#F0E4CC",
        },
        charcoal: "#1C1A16",
        "warm-white": "#FAFAFA",
        "warm-gray":  "#DDE3EA",
        "mid-gray":   "#495C6B",

        // ── Wings brandbook palette (6 official blues) ───────────────────
        brand: {
          imperial:  "#004389",
          madison:   "#062663",
          ada:       "#3A498D",
          meteorito: "#495C6B",
          campestre: "#76A1B2",
          tierno:    "#C8D4E4",
        },

        // ── Homepage v2 palette — values live in globals.css :root tokens ──
        ink:      "var(--color-ink)",
        paper:    "var(--color-paper)",
        harbor:   "var(--color-harbor)",
        graphite: "var(--color-graphite)",
        steel:    "var(--color-steel)",
        oxide:    "var(--color-oxide)",

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
        // ── Swiss system — single typeface family, weight hierarchy ──────
        display: ["Flexo", "system-ui", "sans-serif"],
        body:    ["Flexo", "system-ui", "sans-serif"],
        data:    ["DM Mono", "monospace"],
        // ── Homepage v2 fonts ────────────────────────────────────────────
        "display-v2": ["var(--font-archivo)", "system-ui", "sans-serif"],
        "body-v2":    ["var(--font-inter)", "system-ui", "sans-serif"],
        "data-v2":    ["var(--font-ibm-plex-mono)", "monospace"],
        // ── Legacy (kept during migration) ──────────────────────────────
        sans:    ["Flexo", "Inter", "system-ui", "sans-serif"],
        serif:   ["Flexo", "system-ui", "sans-serif"],
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
