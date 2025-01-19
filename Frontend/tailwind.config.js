/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite', // Slow spin for outer circle
        'spin-fast': 'spin 1s linear infinite', // Fast spin for inner circle
      },
    },
  },
  plugins: [],
};
