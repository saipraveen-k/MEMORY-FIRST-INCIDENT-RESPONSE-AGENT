/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090d16',
        surface: '#111827',
        'surface-hover': '#1f293d',
        card: '#131b2e',
        border: '#1f2d4d',
        primary: '#3b82f6',
        'primary-hover': '#2563eb',
        accent: '#8b5cf6',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
      },
    },
  },
  plugins: [],
}
