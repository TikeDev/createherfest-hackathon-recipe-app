/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: '#6B9E78',
          dark: '#4e7a5a',
        },
        mist: {
          DEFAULT: '#A8C5B0',
          pale: '#D4E6DA',
        },
        cream: '#FAF4EF',
        forest: '#2D3B35',
        surface: '#EEF5F0',
      },
      fontFamily: {
        headline: ['Lora', 'serif'],
        body: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
