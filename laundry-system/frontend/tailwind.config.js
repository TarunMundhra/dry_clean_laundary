/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Sora", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "serif"],
      },
      colors: {
        ink: "var(--ink)",
        paper: "var(--paper)",
        coral: "var(--coral)",
        teal: "var(--teal)",
        sand: "var(--sand)",
        slate: "var(--slate)",
        mist: "var(--mist)",
      },
      boxShadow: {
        soft: "0 20px 60px -40px rgba(31, 41, 51, 0.6)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s ease-out",
        "float-slow": "float-slow 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
