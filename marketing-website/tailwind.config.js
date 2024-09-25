/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./{src,mdx}/**/*.{js,mjs,jsx,ts,tsx,mdx}'],
  darkMode: 'selector',
  theme: {
    extend: {
      colors:{
        starryBlue: {
          light: '#e1eaff',
          dark: '#061332'
        }
      },
      fontSize: {
        '2xs': '.6875rem',
      },
      fontFamily: {
        sans: 'var(--font-inter)',
        display: 'var(--font-mona-sans)',
      },
      opacity: {
        2.5: '0.025',
        7.5: '0.075',
        15: '0.15',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'),],
}
