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
        primary: "#4CA1F0",
        secondary: "#A1E3AF",
        "primary-focus": "#3B8CD8", // dark hover version
        accent: "#2C3A47",
        background: "#F5F9FC",
        text: "#2C3A47",
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
          primary: "#4CA1F0", // this sets btn-primary
          "primary-focus": "#3B8CD8", // dark hover version
          secondary: "#A1E3AF",
          accent: "#2C3A47",
          neutral: "#F5F9FC",
          "base-100": "#FFFFFF",
          info: "#2094F3",
          success: "#009485",
          warning: "#FF9900",
          error: "#FF5724",
        },
      },
    ],
  },
};
