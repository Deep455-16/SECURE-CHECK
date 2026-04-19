/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        panel: '#151520',
        primary: '#4ade80',
        primaryHover: '#22c55e',
        danger: '#fb7185',
        warning: '#fcd34d',
        textMain: '#f8fafc',
        textMuted: '#94a3b8'
      },
    },
  },
  plugins: [],
}
