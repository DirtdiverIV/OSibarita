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
        'restaurant-gold': {
          50: '#FFF9E5',
          100: '#FFF0BF',
          200: '#FFE680',
          300: '#FFD940',
          400: '#FFCC00',
          500: '#D4AF37',  // Oro clásico
          600: '#B8860B',  // Oro oscuro
          700: '#996515',
          800: '#7A5000',
          900: '#5C3D00',
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
        'dark-gradient': 'linear-gradient(to bottom, #0A0A0A 0%, #1A1A1A 100%)',
      },
      boxShadow: {
        'gold': '0 0 15px -3px rgba(212, 175, 55, 0.4)',
      }
    },
  },
  plugins: [],
};