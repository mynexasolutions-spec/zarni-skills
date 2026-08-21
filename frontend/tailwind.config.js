/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Sora', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        display: ['Playfair Display', 'serif']
      },
      colors: {
        primary: {
          dark: '#1a6fcf',
          DEFAULT: '#2b80f0',
          light: '#4da6ff',
          muted: '#8aaac8'
        },
        dark: {
          DEFAULT: '#0d1b2a',
          muted: '#5a7a99'
        }
      },
      animation: {
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'slide-down': 'slideDown 0.25s ease-out both',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pop-in': 'popIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'flip-in': 'flipIn 0.45s cubic-bezier(0.2, 0.9, 0.25, 1) both',
        'tick-glow': 'tickGlow 0.9s ease-out',
        'shine': 'shine 2.5s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.85) translateY(10px)' },
          '60%': { opacity: '1', transform: 'scale(1.02) translateY(0)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        shine: {
          '0%, 100%': { backgroundPosition: '200% center' },
          '50%': { backgroundPosition: '0% center' },
        },
        // Countdown digits: the outgoing number falls away as the incoming one
        // drops in, so a tick reads as a mechanical flip rather than a swap.
        flipIn: {
          '0%': { opacity: '0', transform: 'translateY(-90%) rotateX(75deg)' },
          '55%': { opacity: '1', transform: 'translateY(6%) rotateX(-12deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotateX(0deg)' },
        },
        tickGlow: {
          '0%': { boxShadow: '0 0 0 0 rgba(217,70,239,0.55)' },
          '100%': { boxShadow: '0 0 0 10px rgba(217,70,239,0)' },
        },
      }
    },
  },
  plugins: [],
}
