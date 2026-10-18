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
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        fg: 'rgb(var(--color-fg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        accent2: 'rgb(var(--color-accent2) / <alpha-value>)',
        accent3: 'rgb(var(--color-accent3) / <alpha-value>)',
        'accent-bright': 'rgb(var(--color-accent-bright) / <alpha-value>)',
        'accent2-bright': 'rgb(var(--color-accent2-bright) / <alpha-value>)',
        'accent3-bright': 'rgb(var(--color-accent3-bright) / <alpha-value>)',
        'accent-ink': 'rgb(var(--color-accent-ink) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-space-grotesk)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
