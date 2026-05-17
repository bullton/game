/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        red: {
          400: '#ff4d6d',
          500: '#ff2d55',
          600: '#e0263f',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        pink: {
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(255, 45, 85, 0.3), 0 0 10px rgba(255, 45, 85, 0.2)' },
          '100%': { boxShadow: '0 0 10px rgba(255, 45, 85, 0.5), 0 0 20px rgba(255, 45, 85, 0.3)' },
        },
      },
    },
  },
  plugins: [],
};
