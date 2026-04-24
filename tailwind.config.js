/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'news-ticker': {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-50%,0,0)' },
        },
      },
      animation: {
        // Uzun metin: yavaş = daha akıcı; linear = hiç duraklamaz
        'news-ticker': 'news-ticker 42s linear infinite',
      },
    },
  },
  plugins: [],
}