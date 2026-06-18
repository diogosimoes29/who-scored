// Tema claro/escuro (localStorage). Padrão: escuro (DESIGN.md "noite de relvado").
// Aplica/retira a classe `.light` no <html>; os tokens em index.css fazem o resto.

import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const KEY = "quem-marcou:theme";

function load(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* armazenamento indisponível */
  }
  return "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(load);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* ignora */
    }
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  return { theme, toggle };
}
