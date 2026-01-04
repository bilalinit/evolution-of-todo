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
        background: "#F9F7F2",
        surface: "#F0EBE0",
        structure: "#E5E0D6",
        foreground: "#2A1B12",
        "foreground-secondary": "#5C4D45",
        accent: "#FF6B4A",
        "accent-dark": "#2A2A2A",
        muted: "#E8E4DD",
        border: "#E5E0D6",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;