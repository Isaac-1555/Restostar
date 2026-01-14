import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Restostar color palette
        cream: {
          DEFAULT: "#F1F7EE",
          50: "#FAFCF9",
          100: "#F1F7EE",
          200: "#E3EFE0",
        },
        sage: {
          DEFAULT: "#92AA83",
          50: "#F4F7F2",
          100: "#E5EBE1",
          200: "#C5D4BC",
          300: "#A8BE9A",
          400: "#92AA83",
          500: "#7A9469",
          600: "#627854",
          700: "#4A5A3F",
        },
        lime: {
          DEFAULT: "#E7F59E",
          50: "#F9FCE8",
          100: "#F3FAD2",
          200: "#E7F59E",
          300: "#D4E96A",
          400: "#C0DB3C",
        },
        // Semantic aliases
        brand: {
          DEFAULT: "#92AA83",
          light: "#A8BE9A",
          dark: "#7A9469",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
