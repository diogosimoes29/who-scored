// Estatísticas locais (localStorage): sequência atual e melhor. Permitido na
// app real (CLAUDE.md). Lê com tolerância a falhas (modo privado, etc.).

import { useCallback, useState } from "react";

export type Stats = { streak: number; best: number; played: number };

const KEY = "quem-marcou:stats";
const EMPTY: Stats = { streak: 0, best: 0, played: 0 };

function load(): Stats {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const v = JSON.parse(raw) as Partial<Stats>;
    return {
      streak: v.streak ?? 0,
      best: v.best ?? 0,
      played: v.played ?? 0,
    };
  } catch {
    return EMPTY;
  }
}

function save(stats: Stats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    /* ignora (armazenamento indisponível) */
  }
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(load);

  // Regista o fim de um jogo: completou todos os marcadores → soma sequência.
  const record = useCallback((completed: boolean) => {
    setStats((prev) => {
      const streak = completed ? prev.streak + 1 : 0;
      const next: Stats = {
        streak,
        best: Math.max(prev.best, streak),
        played: prev.played + 1,
      };
      save(next);
      return next;
    });
  }, []);

  // Volta ao início: zera a sequência atual, mantém melhor e jogos jogados.
  const resetStreak = useCallback(() => {
    setStats((prev) => {
      if (prev.streak === 0) return prev;
      const next: Stats = { ...prev, streak: 0 };
      save(next);
      return next;
    });
  }, []);

  return { stats, record, resetStreak };
}
