/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        origen: {
          granate: '#8B1A2B',
          'granate-dark': '#6B1221',
          'granate-light': '#A82035',
          mostaza: '#C4962A',
          'mostaza-dark': '#A07820',
          'mostaza-light': '#D4A93A',
          carbon: '#3A3A3A',
          'carbon-light': '#5A5A5A',
          crema: '#F5F0E8',
          'crema-dark': '#EDE6D8',
          blanco: '#FAFAF8',
        },
      },
      fontFamily: {
        display: ['Abril Fatface', 'serif'],
        body: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pop': 'pop 0.2s ease-out',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}