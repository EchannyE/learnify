/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        learnify: {
          blue: "#2563EB",
          green: "#16A34A",
          yellow: "#FACC15",
          light: "#F8FAFC",
          dark: "#0F172A"
        }
      }
    }
  },
  plugins: []
};