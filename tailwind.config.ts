import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        display: ["'Syne'", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#E8392A",
          dark: "#C42D1E",
          light: "#FFF0EE",
        },
        ink: {
          DEFAULT: "#0F0E0D",
          2: "#3A3835",
          3: "#7A7670",
        },
        surface: {
          DEFAULT: "#FAFAF9",
          2: "#F3F0ED",
          3: "#E8E4DF",
        },
        editor: {
          bg: "#0F0E0D",
          surface: "#1A1917",
          surface2: "#242220",
          border: "#2E2B28",
          border2: "#3D3A36",
          text: "#F5F2EE",
          text2: "#9E9890",
          text3: "#5A5650",
        },
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(15,14,13,.08), 0 0 0 1px rgba(15,14,13,.05)",
        "card-lg": "0 12px 40px rgba(15,14,13,.14), 0 0 0 1px rgba(15,14,13,.06)",
        "brand-glow": "0 4px 16px rgba(232,57,42,.35)",
        editor: "0 8px 40px rgba(0,0,0,.5)",
      },
    },
  },
  plugins: [],
};
export default config;
