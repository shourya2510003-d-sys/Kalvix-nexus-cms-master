/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          cream: '#FAF9F6', // Warm off-white background
          gold: '#C5A059',  // Primary design gold
          goldDark: '#A37E3B',
          goldLight: '#E8D3A7',
          emerald: '#097969', // Organic accent green
          charcoal: '#1C1C1C', // Sleek high-end body text
          darkBg: '#0A0A0A',
        }
      },
      fontFamily: {
        serif: ['Bagnard', 'serif'],
        sans: ['var(--font-montserrat-alt)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
