// Seleção de jogo (DESIGN.md): escolhe um Match aleatório do pool, evitando
// repetições na mesma sessão. Quando o pool se esgota, recomeça.

import { useCallback, useRef } from "react";
import type { Match } from "../types";
import matchesData from "../data/matches.json";

const ALL = matchesData as Match[];

export function useMatchPool() {
  const seen = useRef<Set<string>>(new Set());

  const next = useCallback((): Match => {
    let remaining = ALL.filter((m) => !seen.current.has(m.id));
    if (remaining.length === 0) {
      seen.current.clear();
      remaining = ALL;
    }
    const pick = remaining[Math.floor(Math.random() * remaining.length)]!;
    seen.current.add(pick.id);
    return pick;
  }, []);

  return { next, total: ALL.length };
}
