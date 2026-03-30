/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a',
        primary: '#7c3aed',
        primaryHover: '#6d28d9',
        secondary: '#22c55e',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
}
