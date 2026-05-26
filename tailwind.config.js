/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        text: "var(--text)",
        accent: "var(--accent)",
      },
      fontFamily: {
        sans: ['"JetBrains Mono"'],
      },
    },
  },
  plugins: [],
};
