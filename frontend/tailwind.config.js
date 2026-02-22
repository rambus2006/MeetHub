/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // className 등에서 활용할 tailwind 색깔 커스텀
        // 예시: 'our-green': '#8ECC2C',
        'meethub-blue': '#14299F',
      },
    },
  },
  plugins: [],
};
