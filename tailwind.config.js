export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f6eefd",
          100: "#eddbfb",
          200: "#ddbaF7",
          300: "#c98df2",
          400: "#b45fe9",
          500: "#8f2fc4",
          600: "#7c24b8",
          700: "#652196",
          800: "#531f78",
          900: "#451d63",
          950: "#28103c",
        },
        success: "#10b981",
        warning: "#f59e0b",
        error: "#dc2626",
      },
    },
  },
  plugins: [],
};
