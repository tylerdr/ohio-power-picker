import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0b1b2b',
        mist: '#f4f7fb',
        sea: '#0f6b6d',
        leaf: '#1b8f5a',
        sun: '#f6c453',
        sky: '#e2f4ff',
        danger: '#b42318'
      },
      boxShadow: {
        card: '0 20px 45px rgba(15, 27, 43, 0.12)'
      }
    }
  },
  plugins: []
};

export default config;
