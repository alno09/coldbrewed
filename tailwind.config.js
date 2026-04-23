/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        coffee: '#4b3621', // Cokelat khas kopi
        gold: '#D4AF37',   // Untuk scoring premium
      }
    },
  },
  plugins: [],
}