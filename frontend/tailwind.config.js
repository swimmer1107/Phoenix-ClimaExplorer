/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        c: {
          dark:    '#020617',
          card:    '#0f172a',
          board:   '#1e293b',
          cyan:    '#06b6d4',
          emerald: '#10b981',
          blue:    '#3b82f6',
          violet:  '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
