/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
        display: ["var(--font-vt323)", "ui-monospace", "monospace"],
        heading: ["var(--font-vt323)", "ui-monospace", "monospace"],
      },
      colors: {
        phosphor: "var(--phosphor)",
        "phosphor-dim": "var(--phosphor-dim)",
        "crt-bg": "var(--bg)",
        "crt-bg-elevated": "var(--bg-elevated)",
        "crt-cyan": "var(--cyan)",
        "crt-amber": "var(--amber)",
        "crt-magenta": "var(--magenta)",
        "crt-white": "var(--white)",
        "crt-muted": "var(--muted)",
      },
    },
  },
  plugins: [],
};

export default config;
