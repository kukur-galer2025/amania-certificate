import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
      },
      colors: {
        'cert-purple': '#4a154b', // Ungu gelap megah
        'cert-yellow': '#d4af37', // Kuning Emas mewah
        'cert-green': '#0f5132',  // Hijau zamrud elegan
      }
    },
  },
  plugins: [],
};
export default config;