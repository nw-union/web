/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      width: {
        700: "700px",
      },
      fontFamily: {
        sg: ["Sawarabi Gothic", "Inter", "sans-serif"],
        vt323: ["VT323", "Inter", "monospace"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
