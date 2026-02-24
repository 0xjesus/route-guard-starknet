import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        carbon: {
          50: "#f0fdfa",
          100: "#0a0a0a",
          200: "#111111",
          300: "#1a1a1a",
          400: "#222222",
          500: "#333333",
          600: "#666666",
          700: "#999999",
          800: "#cccccc",
          900: "#f5f5f5",
        },
        teal: {
          DEFAULT: "#00d4aa",
          50: "#00d4aa10",
          100: "#00d4aa20",
          200: "#00d4aa40",
          300: "#00d4aa60",
          400: "#00d4aa80",
          500: "#00d4aa",
          600: "#00b894",
          700: "#009d7e",
        },
        cyan: {
          DEFAULT: "#0ea5e9",
          500: "#0ea5e9",
        },
      },
      backgroundImage: {
        "carbon-texture":
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0,212,170,0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(0,212,170,0.4)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
