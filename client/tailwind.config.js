/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fefdf0',
          100: '#fdf8d0',
          200: '#fbf0a0',
          300: '#f7e265',
          400: '#f2ce2e',
          500: '#D4AF37',
          600: '#C5981A',
          700: '#A67C12',
          800: '#8A6510',
          900: '#6B4E0D',
        },
        luxury: {
          black: '#0A0A0A',
          dark:  '#111111',
          card:  '#1A1A1A',
          border:'#2A2A2A',
          muted: '#888888',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Jost"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float':    'float 6s ease-in-out infinite',
        'shimmer':  'shimmer 2s linear infinite',
        'spin-slow':'spin 8s linear infinite',
        'pulse-gold':'pulse-gold 2s ease-in-out infinite',
        'marquee':  'marquee 25s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,175,55,0.4)' },
          '50%':      { boxShadow: '0 0 0 20px rgba(212,175,55,0)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C5981A 0%, #D4AF37 50%, #F2CE2E 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
        'card-gradient': 'linear-gradient(135deg, #1A1A1A 0%, #222222 100%)',
      }
    },
  },
  plugins: [],
};
