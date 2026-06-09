/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        cream: {
          50: "#FFFDF7",
          100: "#FFF5E6",
          200: "#FFE9C7",
          300: "#FFD79A",
        },
        sakura: {
          100: "#FFE5EC",
          200: "#FFB6C1",
          300: "#FF8FAB",
          400: "#FF6B9D",
          500: "#FF4785",
        },
        matcha: {
          100: "#E8F5E0",
          200: "#D4EBC6",
          300: "#B7D8A8",
          400: "#8FC17A",
          500: "#68A94A",
        },
        choco: {
          600: "#6B4423",
          700: "#54341A",
          800: "#3F2612",
        },
      },
      fontFamily: {
        cute: [
          '"ZCOOL KuaiLe"',
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          "cursive",
        ],
      },
      boxShadow: {
        cute: "0 8px 24px -8px rgba(251, 146, 60, 0.25)",
        pop: "0 12px 0 -4px rgba(0,0,0,0.1)",
      },
      borderRadius: {
        "3xl": "28px",
        "4xl": "36px",
      },
      borderWidth: {
        3: "3px",
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "bounce-slow": "bounce 3s ease-in-out infinite",
        wiggle: "wiggle 0.6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(3deg)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" },
        },
      },
    },
  },
  plugins: [],
};
