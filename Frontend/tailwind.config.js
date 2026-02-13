/** @type {import('tailwindcss').Config} */
export default {
  // Enable class-based dark mode so toggling the `dark` class on <html>
  // switches dark variants (e.g. `dark:bg-slate-950`).
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

