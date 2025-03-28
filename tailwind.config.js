/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        twpink: '#FF79C6',
        twblack: {
          DEFAULT: '#0E0D11',
          secondary: '#1D1B22',
        },
        twwhite: {
          DEFAULT: '#F8F8F2',
          secondary: '#565167',
          tertiary: '#6272A4',
        },
        twgreen: '#50FA7B',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
