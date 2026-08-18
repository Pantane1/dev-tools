import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // --- Pantane DevTools design tokens ---
        // Neutral surface + text
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F8FAFC", // slate-50
          muted: "#F1F5F9", // slate-100
        },
        ink: {
          DEFAULT: "#0F172A", // slate-900 — primary text
          muted: "#475569", // slate-600 — secondary text
          faint: "#94A3B8", // slate-400 — placeholders / captions
        },
        border: {
          DEFAULT: "#E2E8F0", // slate-200
          strong: "#CBD5E1", // slate-300
        },
        // Primary accent — blue
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        // Secondary accent — emerald (success / valid states)
        accent: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#10B981",
          600: "#059669",
        },
        // Status colors reused across tool outputs
        warn: { 50: "#FFFBEB", 500: "#F59E0B", 600: "#D97706" },
        danger: { 50: "#FEF2F2", 500: "#EF4444", 600: "#DC2626" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "10px",
        xl: "14px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 1px 0 rgb(15 23 42 / 0.03)",
        popover: "0 10px 30px -8px rgb(15 23 42 / 0.18)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "slide-up": { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "slide-up": "slide-up 180ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
