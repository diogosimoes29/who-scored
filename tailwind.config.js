/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Tokens de cor — fonte de verdade em src/index.css (variáveis CSS).
      colors: {
        bg: "var(--bg)",
        bg2: "var(--bg2)",
        panel: "var(--panel)",
        panel2: "var(--panel2)",
        line: "var(--line)",
        amber: "var(--amber)",
        "amber-soft": "var(--amber-soft)",
        lime: "var(--lime)",
        red: "var(--red)",
        chalk: "var(--chalk)",
        muted: "var(--muted)",
      },
      fontFamily: {
        // Oswald — display condensada (wordmark, equipas, labels, botões)
        display: ['"Oswald"', "system-ui", "sans-serif"],
        // JetBrains Mono — dados de placard (resultado, minutos, contadores)
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        // Inter — corpo de texto
        body: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        cta: "0 0 28px rgba(255,176,0,.35)",
        glow: "0 0 20px rgba(255,176,0,.25)",
      },
      borderRadius: {
        placard: "16px",
      },
    },
  },
  plugins: [],
};
