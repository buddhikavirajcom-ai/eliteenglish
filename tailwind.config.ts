import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)"
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)"
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)"
        },
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)"
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)"
        },
        brand: {
          50: "#edf4ff",
          100: "#dbe8ff",
          200: "#bed4ff",
          300: "#91b6ff",
          400: "#5f90f3",
          500: "#386ed8",
          600: "#2857b7",
          700: "#234693",
          800: "#223d77",
          900: "#203563"
        },
        accent: {
          50: "#fff7ea",
          100: "#ffecc8",
          200: "#ffd98c",
          300: "#ffc354",
          400: "#f4a62a",
          500: "#de8615",
          600: "#ba6511",
          700: "#954813",
          800: "#7a3b15",
          900: "#663216"
        }
      },
      fontFamily: {
        sans: ["var(--font-manrope)"],
        display: ["var(--font-plus-jakarta)"]
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2rem"
      },
      boxShadow: {
        soft: "0 20px 55px rgba(15, 23, 42, 0.08)",
        panel: "0 18px 48px rgba(26, 44, 79, 0.10)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.6)"
      },
      backgroundImage: {
        "dashboard-grid":
          "linear-gradient(to right, rgba(56, 110, 216, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 110, 216, 0.06) 1px, transparent 1px)",
        "login-glow": "radial-gradient(circle at top left, rgba(95, 144, 243, 0.28), transparent 32%), radial-gradient(circle at bottom right, rgba(222, 134, 21, 0.16), transparent 28%)"
      }
    }
  },
  plugins: []
};

export default config;

