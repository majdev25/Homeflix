/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        nRed: "#E50914",
        "nRed-dark": "#b80912",
      },
      keyframes: {
        slideInFromRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0%)", opacity: "1" },
        },
        slideOutLeft: {
          "0%": { transform: "translateX(0%)", opacity: "1" },
          "100%": { transform: "translateX(-100%)", opacity: "0" },
        },
        slideInFromLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0%)", opacity: "1" },
        },
        slideOutRight: {
          "0%": { transform: "translateX(0%)", opacity: "1" },
          "100%": { transform: "translateX(100%)", opacity: "0" },
        },
      },
      animation: {
        slideInFromRight: "slideInFromRight 0.7s ease-in-out forwards",
        slideOutLeft: "slideOutLeft 0.7s ease-in-out forwards",
        slideInFromLeft: "slideInFromLeft 0.7s ease-in-out forwards",
        slideOutRight: "slideOutRight 0.7s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};
