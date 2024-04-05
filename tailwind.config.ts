import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-lightblue': '#f0faff',
        'custom-darkblue': '#e0eaff', // Adding another custom color for the gradient
      },
      backgroundImage: {
        'blue-gradient': 'linear-gradient(to right, #f0faff, #e0eaff)', // Custom gradient
      },
    },
  },
  plugins: [],
};

export default config;
