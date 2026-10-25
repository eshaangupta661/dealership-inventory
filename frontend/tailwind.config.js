/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#14532d',
        'brand-light': '#dcfce7',
      },
    },
  },
  plugins: [],
};
