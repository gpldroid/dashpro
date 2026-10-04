/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Arial", "Tahoma", "sans-serif"]
      },
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81"
        },
        canvas: {
          light: "#f8fafc",
          dark: "#090d18"
        },
        panel: {
          light: "#ffffff",
          dark: "#111827"
        }
      },
      boxShadow: {
        panel: "0 10px 35px -18px rgb(15 23 42 / 0.22)",
        glow: "0 0 0 1px rgb(99 102 241 / 0.18), 0 12px 36px -18px rgb(99 102 241 / 0.45)"
      },
      borderRadius: {
        "4xl": "2rem"
      }
    }
  },
  plugins: []
};
