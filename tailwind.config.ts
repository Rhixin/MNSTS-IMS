import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          forest: '#2D5F3F',
          golden: '#F4C430',
          cream: '#F8F6F0',
        },
        secondary: {
          teal: '#1B4B47',
          sage: '#87A96B',
          gray: '#6B6B6B',
        },
        accent: {
          white: '#FFFFFF',
          lightGold: '#FFF2CC',
          charcoal: '#2C2C2C',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;