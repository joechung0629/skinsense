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
        skin: {
          50: "#fef7f3",
          100: "#fdeee5",
          200: "#fadacc",
          300: "#f5bfaa",
          400: "#ef9a7a",
          500: "#e57652",
          600: "#d25a39",
          700: "#b04429",
          800: "#8f3926",
          900: "#753324",
        },
      },
    },
  },
  plugins: [],
};

export default config;
