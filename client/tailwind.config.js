/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
      },
      keyframes: {
        "roll-walk": {
          "0%": { transform: "translateX(-120px)" },
          "100%": { transform: "translateX(calc(100vw + 120px))" },
        },
      },
      animation: {
        "roll-walk": "roll-walk 12s linear infinite",
      },
    },
  },
  plugins: [],
};
