/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#f472b6",
        background: "#000000",
      },
      fontFamily: {
        regular: ["var(--font-family)", ...defaultTheme.fontFamily.mono],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        animation: {
          float: "float 4s ease-in-out infinite",
          fadeIn: "fadeIn 1.5s ease-in-out forwards",
        },
        fadeIn: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
