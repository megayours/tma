/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      colors: {
        // Telegram theme colors - these will be overridden by CSS variables
        tg: {
          bg: 'var(--tg-bg-color)',
          text: 'var(--tg-text-color)',
          hint: 'var(--tg-hint-color)',
          link: '#007AFF', //link: 'var(--tg-link-color)',
          button: 'var(--tg-button-color)',
          'button-text': 'var(--tg-button-text-color)',
          'secondary-bg': 'var(--tg-secondary-bg-color)',
          'accent-text': 'var(--tg-accent-text-color)',
          'destructive-text': 'var(--tg-destructive-text-color)',
          'header-bg': 'var(--tg-header-bg-color)',
          'section-bg': 'var(--tg-section-bg-color)',
          'section-header-text': 'var(--tg-section-header-text-color)',
          'section-separator': 'var(--tg-section-separator-color)',
          'subtitle-text': 'var(--tg-subtitle-text-color)',
          'bottom-bar-bg': 'var(--tg-bottom-bar-bg-color)',
        },
      },
    },
  },
  plugins: [],
};
