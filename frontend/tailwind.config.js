/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teacher: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        student: {
          50:  '#faf5ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        accent: {
          teal:  '#14b8a6',
          amber: '#f59e0b',
        },
      },
      boxShadow: {
        // Layered shadow
        card: '0 1px 2px rgba(16,24,40,0.04), 0 4px 8px rgba(16,24,40,0.04), 0 12px 24px rgba(16,24,40,0.06), 0 24px 48px rgba(16,24,40,0.10)',
      },
      backgroundImage: {
        // Subtle off-white mesh: faint blue/violet tints + cool gray on a near-white base.
        mesh:
          'radial-gradient(at 0% 0%, rgba(219,234,254,0.55) 0, transparent 50%),' +
          'radial-gradient(at 100% 0%, rgba(241,245,249,0.70) 0, transparent 50%),' +
          'radial-gradient(at 100% 100%, rgba(237,233,254,0.50) 0, transparent 50%),' +
          'radial-gradient(at 0% 100%, rgba(219,234,254,0.35) 0, transparent 50%)',
      },
      keyframes: {
        'float-1': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '50%':      { transform: 'translate(24px, -28px) rotate(8deg)' },
        },
        'float-2': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '50%':      { transform: 'translate(-30px, 22px) rotate(-10deg)' },
        },
        'float-3': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%':      { transform: 'translate(20px, 26px) rotate(6deg)' },
          '66%':      { transform: 'translate(-18px, 10px) rotate(-6deg)' },
        },
        'float-4': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '50%':      { transform: 'translate(-22px, -24px) rotate(12deg)' },
        },
      },
      animation: {
        'float-1': 'float-1 18s ease-in-out infinite',
        'float-2': 'float-2 22s ease-in-out infinite',
        'float-3': 'float-3 20s ease-in-out infinite',
        'float-4': 'float-4 16s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
