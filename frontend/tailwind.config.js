/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        accent: "var(--accent-color)",
        background: "var(--background-color)",
        border: "var(--border-color)",
        command: "var(--text-command-color)",
        highlight: "var(--highlight-color)",
        text: "var(--text-color)",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        blink: "blink 1.0s step-end infinite",
      },
    },
  },
  plugins: [],
};
