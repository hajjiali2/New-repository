/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
        sans: ['Inter', 'Cairo', 'sans-serif'],
      },
      colors: {
        navy: {
          50: '#e8eaf2',
          100: '#c5cadf',
          200: '#9fa7ca',
          300: '#7984b5',
          400: '#5c69a5',
          500: '#3f4e95',
          600: '#2d3a7a',
          700: '#1e2a61',
          800: '#111c4a',
          900: '#060f33',
          950: '#03081f',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease forwards',
        'slide-up': 'slideUp 0.5s ease forwards',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        glow: { from: { boxShadow: '0 0 20px rgba(249,115,22,0.3)' }, to: { boxShadow: '0 0 40px rgba(249,115,22,0.6)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
