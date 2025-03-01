// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      colors: {
        'restaurant-black': '#0A0A0A',
        'restaurant-dark': '#121212',
        'restaurant-gold': {
          50: '#FFF9E5',
          100: '#FFF0BF',
          200: '#FFE680',
          300: '#FFD940',
          400: '#D4B254',  // Oro más natural
          500: '#C09E45',  // Oro clásico
          600: '#A98834',  // Oro oscuro
          700: '#8A6E1E',
          800: '#74591A',
          900: '#5C4515',
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4B254 0%, #8A6E1E 100%)',
        'gold-gradient-hover': 'linear-gradient(135deg, #C09E45 0%, #74591A 100%)',
        'dark-gradient': 'linear-gradient(to bottom, #0A0A0A 0%, #1A1A1A 100%)',
        'card-gradient': 'linear-gradient(to bottom, rgba(18, 18, 18, 0.95) 0%, rgba(10, 10, 10, 0.95) 100%)',
      },
      boxShadow: {
        'gold': '0 0 15px -3px rgba(212, 178, 84, 0.4)',
        'gold-intense': '0 0 20px -2px rgba(212, 178, 84, 0.6)',
        'inner-gold': 'inset 0 2px 4px 0 rgba(212, 178, 84, 0.2)',
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 15px -3px rgba(212, 178, 84, 0.4)' },
          '50%': { boxShadow: '0 0 20px 0px rgba(212, 178, 84, 0.6)' },
        }
      }
    },
  },
  plugins: [],
};