import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#F59E0B",
        "primary-focus": "#1D4ED8",
        accent: "#0F172A",
        background: "#F8FAFC",
        text: "#0F172A",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],

        // heading: ["Poppins", "sans-serif"],
        // body: ["Roboto", "sans-serif"],
        // ui: ["Inter", "sans-serif"],
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#2563EB",
          "primary-focus": "#1D4ED8",
          secondary: "#F59E0B",
          accent: "#0F172A",
          neutral: "#F8FAFC",
          "base-100": "#FFFFFF",
          info: "#2094F3",
          success: "#22C55E",
          warning: "#FF9900",
          error: "#FF5724",
        },
      },
    ],
  },
};
