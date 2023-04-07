/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        'custom-light-blue': '#037dd6',
        'custom-light-gray': '#f9f9fb',
        'custom-dark': '#181a1b',
        'custom-dark-blue': '#142c8e'
      }
    },
  },
  plugins: [],
}
