import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': '#B667F1',
        'secondary': '#F5F5F5',
        'text-primary': '#333333',
        'text-secondary': '#666666',
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F9F9F9',
        'border': '#E5E5E5',
        'error': '#FF4D4D',
        'success': '#4CAF50',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
        logo: ['var(--font-great-vibes)', 'cursive'],
      },
    },
  },
  plugins: [],
}

export default config 