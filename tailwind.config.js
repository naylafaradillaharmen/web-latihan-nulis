/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F2',
        'paper-warm': '#F5EFE6',
        'paper-card': '#FFFDFB',
        'ink-deep': '#2C2825',
        'ink-muted': '#6B625B',
        'ink-faint': '#9C9289',
        'rose-accent': '#C98B82',
        'rose-deep': '#945B54',
        'rose-soft': '#F4EBE7',
        'sage-accent': '#7D8B6F',
        'sage-deep': '#606C38',
        'sage-soft': '#EDF1E8',
        'line-warm': '#E8DFC8',

        palette: {
          mist: '#EDF1E8',
          sky: '#F4EBE7',
          slate: '#9C9289',
          periwinkle: '#6B625B',
          muted: '#6B625B',
          deep: '#2C2825',
          deepHover: '#1E1B19',
          canvas: '#FAF7F2',
          lavender: '#C98B82',
          lavenderLight: '#F4EBE7',
          lavenderBorder: '#E8DFC8',
          ink: '#2C2825',
          inkMuted: '#6B625B',
          inkSubtle: '#9C9289',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        script: ['"La Belle Aurore"', 'Sacramento', 'cursive'],
        hand: ['"La Belle Aurore"', 'Sacramento', 'cursive'],
      },
      boxShadow: {
        paper: '0 4px 20px -2px rgba(92, 77, 66, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        card: '0 4px 20px -2px rgba(92, 77, 66, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        cardHover: '0 8px 30px -4px rgba(92, 77, 66, 0.08)',
        soft: '0 2px 10px rgba(92, 77, 66, 0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
