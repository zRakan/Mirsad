/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        textColor: '#ffffff',
        background: '#1A1A1D',
        primary: '#3B1C32',
        secondary: '#A64D79',
      },
      boxShadow: {
        glow: '0 0 20px #A64D79',
      },
    },
  },
  plugins: [],
}