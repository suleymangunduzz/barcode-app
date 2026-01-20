/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // scan the HTML
    "./src/*.{ts,tsx,js,jsx}", // scan all TS/JS files in renderer root
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
