/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          background: '#050719',
          surface: '#0B0B2B',
          primary: '#6D19FF',
          light: '#9B7BFF',
          bright: '#7C2FFF',
          muted: '#8586A5',
          text: '#FFFFFF',
          secondary: '#B7B8D0',
          success: '#28D9A0',
          gold: '#F5B942',
          cyan: '#5DE7FF',
        }
      }
    },
  },
  plugins: [],
}
