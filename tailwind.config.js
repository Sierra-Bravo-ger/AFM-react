/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Aktiviere class-basierten Dark Mode
  theme: {
    extend: {
      colors: {
        // Benutzerdefinierte Farben für Light/Dark Mode
        primary: {
          light: '#3B82F6', // Blau für Light Mode
          dark: '#60A5FA'   // Helleres Blau für Dark Mode
        }
      }
    },
  },
  plugins: [],
}
