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
        sans:  ["Inter", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
