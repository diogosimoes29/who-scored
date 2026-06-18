// Lógica de jogo (DESIGN.md). Mantém o GameState de um Match e expõe ações.
// Validação tolerante delegada em lib/validate.ts (pura).

import { useCallback, useEffect, useState } from "react";
import type { GameState, Goal, Match } from "../types";
import { findGoalToReveal } from "../lib/validate";
import { normalize } from "../lib/normalize";

export type GuessResult =
  | { type: "hit"; index: number; goal: Goal }
  | { type: "miss" }
  | { type: "noop" };

function init(match: Match): GameState {
  return {
    match,
    revealed: match.goals.map(() => false),
    wrongGuesses: [],
    status: "playing",
  };
}

export function useGame(match: Match) {
  const [state, setState] = useState<GameState>(() => init(match));
  // Golos revelados por acerto (≠ revelados por "Desistir"). Base da pontuação.
  const [found, setFound] = useState(0);

  // Recomeça quando muda o jogo (nova partida).
  useEffect(() => {
    setState(init(match));
    setFound(0);
  }, [match]);

  const guess = useCallback(
    (raw: string): GuessResult => {
      if (state.status !== "playing") return { type: "noop" };
      const idx = findGoalToReveal(raw, state.match.goals, state.revealed);
      if (idx === null) {
        const label = raw.trim();
        const key = normalize(label);
        setState((p) =>
          // ignora repetições do mesmo palpite errado (não penaliza 2x)
          key === "" || p.wrongGuesses.some((w) => normalize(w) === key)
            ? p
            : { ...p, wrongGuesses: [...p.wrongGuesses, label] }
        );
        return { type: "miss" };
      }
      setFound((n) => n + 1);
      setState((p) => {
        const revealed = p.revealed.slice();
        revealed[idx] = true;
        const won = revealed.every(Boolean);
        return { ...p, revealed, status: won ? "won" : p.status };
      });
      return { type: "hit", index: idx, goal: state.match.goals[idx]! };
    },
    [state]
  );

  const giveUp = useCallback(() => {
    setState((p) => ({
      ...p,
      revealed: p.revealed.map(() => true),
      status: "revealed",
    }));
  }, []);

  return { state, guess, giveUp, found, total: state.match.goals.length };
}
