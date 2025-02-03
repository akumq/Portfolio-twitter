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
        background: "#0a0a0a",
        secondary: "#16181c",
        border_color: "#2f3336",
        text_highlight: "#1d9bf0",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}; 