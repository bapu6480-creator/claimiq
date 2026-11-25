/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef3fb',
          100: '#d6e2f5',
          200: '#aec6ea',
          300: '#7ba0d8',
          400: '#4d7cc4',
          500: '#2f5fa8',
          600: '#214a8a',
          700: '#193a6e',
          800: '#142e57',
          900: '#0f2444',
          950: '#0a1830',
        },
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(15 36 68 / 0.08), 0 1px 2px -1px rgb(15 36 68 / 0.06)',
        cardLg: '0 8px 24px -8px rgb(15 36 68 / 0.18), 0 2px 6px -2px rgb(15 36 68 / 0.08)',
      },
    },
  },
  plugins: [],
};
