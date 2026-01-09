/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#f48c25",
        "primary-dark": "#d67311",
        "background-light": "#f8f7f5",
        "background-dark": "#221910",
        "surface-dark": "#2c2117",
        "surface-border": "#684d31",
        "text-secondary": "#cbad90",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"]
      },
      borderRadius: { "DEFAULT": "0.25rem", "lg": "0.5rem", "xl": "0.75rem", "full": "9999px" },
    },
  },
  plugins: [],
}
