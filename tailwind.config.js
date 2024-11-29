/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  plugins: [
    require("@catppuccin/tailwindcss")({
      prefix: "ctp",
      flavor: "mocha",
    }),
  ],
};
