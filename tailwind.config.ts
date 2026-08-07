import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        soft: '0 12px 32px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config;
