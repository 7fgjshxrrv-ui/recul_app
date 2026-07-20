import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        amber: {
          brand: "#E8A23D",
        },
        teal: {
          brand: "#5FC1A6",
        },
        rust: {
          brand: "#E2855F",
        },
        dark: {
          bg: "#14161A",
        },
        light: {
          bg: "#EFF1EE",
        },
      },
      fontFamily: {
        grotesk: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      borderRadius: {
        pill: "9999px",
        xl: "14px",
        "2xl": "20px",
      },
    },
  },
  plugins: [],
};
export default config;
