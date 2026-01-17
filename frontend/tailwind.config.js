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
        "background-light": "#ffffff",
        "background-dark": "#0a0a0a",
        "card-dark": "#161412",
        "card-border": "#2d2a27",
        "surface-dark": "#2c2117",
        "surface-border": "#684d31",
        "text-secondary": "#cbad90",
      },
      fontFamily: {
        "display": ["Outfit", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "sans": ["Inter", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "12px",
        "lg": "0.5rem",
        "xl": "20px",
        "full": "9999px"
      },
      boxShadow: {
        'primary-glow': '0 0 20px rgba(244, 140, 37, 0.3)',
        'primary-glow-hover': '0 0 30px rgba(244, 140, 37, 0.5)',
      },
    },
  },
  plugins: [],
}
