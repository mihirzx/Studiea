/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teacher: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          600: '#2e4da0',
          700: '#1e3a8a',
          800: '#1e3270',
          900: '#0f1f4f',
        },
        student: {
          50:  '#faf5ff',
          100: '#ede9fe',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
    },
  },
  plugins: [],
};
