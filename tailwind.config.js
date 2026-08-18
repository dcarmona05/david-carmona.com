/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#FF3D81',
        accent2: '#D9FF3D',
        accent3: '#3DDBFF',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
