import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0b",
        dim: "#a1a1aa",
        accent: "#ff0d0d",
        "tk-cyan": "#25f4ee",
        "tk-red": "#fe2c55",
        wa: "#25d366",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
