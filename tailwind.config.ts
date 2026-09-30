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
        brand: {
          primary: "#0F172A", // Navy gelap
          accent: "#2563EB", // Biru terang untuk hover
          background: "#F8FAFC", // Background terang
        },
      },
    },
  },
  plugins: [],
};
export default config;
