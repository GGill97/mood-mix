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
        terracotta: {
          DEFAULT: "#E2725B",
          light: "#F5B6A4",
        },
        "sandy-beige": "#F5DEB3",
        "soft-brown": "#8B4513",
      },
      fontFamily: {
        display: ["Sentient", "serif"],
        primary: ["Plus Jakarta Sans", "sans-serif"],
        accent: ["Cabinet Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};
