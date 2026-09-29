import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        scada: {
          bg: "#0B0F17",
          card: "#121824",
          border: "#1E293B",
          accent: "#06B6D4",
          running: "#10B981",
          stop: "#64748B",
          alarm: "#EF4444",
          maintenance: "#F59E0B",
          waiting: "#8B5CF6",
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("light", ".light &");
    }),
  ],
} satisfies Config;
