import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep indigo/royal blue primary, teal secondary, amber accent —
        // per the proposal's "modern, colorful, professional university"
        // palette. Slate is used for neutrals via Tailwind's built-ins.
        primary: {
          50: '#eef1ff',
          100: '#e0e4ff',
          200: '#c4caff',
          300: '#a0a6fb',
          400: '#7c7ff2',
          500: '#5b57e6',
          600: '#4740c9',
          700: '#3a34a3',
          800: '#2f2c80',
          900: '#1e1b52',
        },
        teal: {
          500: '#14b8a6',
          600: '#0d9488',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
