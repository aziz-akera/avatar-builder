/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./demo/src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: false,
  theme: {
    extend: {
      screens: {
        tablet: "640px",
        laptop: "1024px",
        desktop: "1280px",
        highres: "1680px",
        superres: "1900px",
        "5k": "2200px"
      }
    }
  },
  plugins: []
};
