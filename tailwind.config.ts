import type { Config } from "tailwindcss";

/**
 * LayerSync / Hempac design tokens per DESIGN-BUILD-HANDOFF §1.
 * Locked palette — green-led, terracotta accent, no lavender-SaaS residue.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F5F4EF",
        card: "#FFFFFF",
        line: "#ECE9E0",
        ink: "#1E3D2C",
        green: "#2E5A40",
        "green-soft": "#EAF0EB",
        terra: "#C25E30",
        "terra-soft": "#F6E7DD",
        gold: "#A78950",
        "gold-soft": "#F0ECDB",
        cream: "#F7F5EF",
        success: "#4E9A5A",
        amber: "#C9992E",
        danger: "#B4452F",
        body: "#20302A",
        muted: "#6C7B72",
        faint: "#98A69D"
      },
      borderRadius: {
        card: "16px",
        hero: "20px",
        feature: "24px"
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,30,25,.04), 0 10px 28px rgba(20,30,25,.05)",
        lift: "0 2px 4px rgba(20,30,25,.06), 0 14px 34px rgba(20,30,25,.09)"
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"]
      },
      transitionDuration: {
        DEFAULT: "175ms"
      },
      keyframes: {
        "slide-fade-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" }
        },
        "check-burst": {
          "0%": { transform: "scale(0.4)", opacity: "0" },
          "45%": { transform: "scale(1.25)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "burst-ring": {
          from: { transform: "scale(0.5)", opacity: "0.6" },
          to: { transform: "scale(1.8)", opacity: "0" }
        }
      },
      animation: {
        "slide-fade-in": "slide-fade-in 200ms ease-out both",
        "check-burst": "check-burst 350ms ease-out both",
        "burst-ring": "burst-ring 450ms ease-out both"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
export default config;
