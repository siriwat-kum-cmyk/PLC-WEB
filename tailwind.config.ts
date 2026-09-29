import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          bg: "#0B0F17",
          card: "#121824",
          cardHover: "#1A2234",
          border: "#1E293B",
          text: "#E2E8F0",
          muted: "#94A3B8",
          running: "#10B981",
          stopped: "#64748B",
          alarm: "#EF4444",
          maintenance: "#F59E0B",
          waiting: "#8B5CF6",
        },
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
