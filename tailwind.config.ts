import type { Config } from "tailwindcss";

/**
 * Phase A1 (lo-fi): greyscale only — no brand colour in wireframes.
 * Brand tokens land here in Phase A2 per DESIGN-BUILD-HANDOFF §1.2.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wf: {
          bg: "#F3F3F1",
          card: "#FFFFFF",
          line: "#DDDDD8",
          ink: "#2B2B28",
          dark: "#3A3A36",
          mid: "#8A8A84",
          faint: "#B9B9B2",
          fill: "#ECECE8",
          fill2: "#E1E1DC"
        }
      },
      borderRadius: {
        card: "16px",
        hero: "20px"
      }
    }
  },
  plugins: []
};
export default config;
