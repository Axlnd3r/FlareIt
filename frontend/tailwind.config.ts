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
        background: "#090A0E",
        surface: {
          DEFAULT: "#12141D",
          light: "#1A1D2A",
          glass: "rgba(22, 25, 38, 0.7)",
          card: "#161926",
        },
        flare: {
          DEFAULT: "#E60037",
          crimson: "#E60037",
          bright: "#FF1A4B",
          dark: "#A30026",
          glow: "rgba(230, 0, 55, 0.35)",
          light: "#FF4D73",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-flare": "linear-gradient(135deg, #FF1A4B 0%, #E60037 50%, #990024 100%)",
        "gradient-dark": "linear-gradient(180deg, #161926 0%, #090A0E 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      boxShadow: {
        "flare-glow": "0 0 25px rgba(230, 0, 55, 0.3)",
        "flare-glow-sm": "0 0 12px rgba(230, 0, 55, 0.2)",
        "card-shadow": "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite alternate",
        "scan-line": "scanLine 2s linear infinite",
      },
      keyframes: {
        glowPulse: {
          "0%": { boxShadow: "0 0 15px rgba(230, 0, 55, 0.2)" },
          "100%": { boxShadow: "0 0 35px rgba(230, 0, 55, 0.5)" },
        },
        scanLine: {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
