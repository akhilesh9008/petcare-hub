import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 12px 32px -16px rgba(15, 62, 63, 0.24)",
        lift: "0 18px 45px -20px rgba(15, 62, 63, 0.34)",
      },
      colors: {
        ink: "#163A3B",
        moss: "#0E6B62",
        mint: "#E6F5F1",
        sky: "#EAF5FC",
        coral: "#F27A64",
        cream: "#FBFAF6",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-up": "fade-up .45s ease-out both",
        float: "float 5s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-9px)" } },
      },
    },
  },
  plugins: [],
};

export default config;
