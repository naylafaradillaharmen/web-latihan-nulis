/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        palette: {
          mist: "#DBE7E7",       // Palette #49 - 1 (Paling terang)
          sky: "#B8D2DF",        // Palette #49 - 2 (Biru watercolor)
          slate: "#AEB8C1",      // Palette #49 - 3 (Dusty slate blue)
          periwinkle: "#A8ACC1", // Palette #49 - 4 (Periwinkle slate)
          muted: "#A8A8B0",      // Palette #49 - 5 (Cool charcoal / vintage)
          deep: "#4D6072",       // Slate navy gelap untuk teks utama & tombol kontras tinggi
          deepHover: "#3E4F5F",  // Hover state tombol utama
          canvas: "#F7FAF9",     // Background kertas canvas bersih
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "serif"],
        sans: ["var(--font-poppins)", "Poppins", "Inter", "sans-serif"],
        hand: ["var(--font-caveat)", "Caveat", "cursive", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(110, 130, 148, 0.08)",
        cardHover: "0 8px 30px -4px rgba(110, 130, 148, 0.14)",
        soft: "0 2px 10px rgba(168, 172, 193, 0.12)",
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.35rem',
      }
    },
  },
  plugins: [],
};
