import { useCallback, useState } from "react";
import type { GameState, Goal, Match } from "../types";
import type { DifficultyId } from "../lib/difficulties";
import { findGoalToReveal } from "../lib/validate";
import { normalize } from "../lib/normalize";

const HARD_MAX_WRONG = 2; 

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

export function useGame(match: Match, difficulty: DifficultyId = "normal") {
    const [state, setState] = useState<GameState>(() => init(match));
    const [found, setFound] = useState(0);

    const [prevMatch, setPrevMatch] = useState(match);
    if (match !== prevMatch) {
        setPrevMatch(match);
        setState(init(match));
        setFound(0);
    }

    const guess = useCallback(
        (raw: string): GuessResult => {
            if (state.status !== "playing") return { type: "noop" };
            const idx = findGoalToReveal(raw, state.match.goals, state.revealed);
            if (idx === null) {
                const label = raw.trim();
                const key = normalize(label);
                setState((p) => {
                    if (key === "" || p.wrongGuesses.some((w) => normalize(w) === key)) {
                        return p;
                    }
                    const wrongGuesses = [...p.wrongGuesses, label];
                    const lost = difficulty === "hard" && wrongGuesses.length >= HARD_MAX_WRONG;
                    return { ...p, wrongGuesses, status: lost ? "lost" : p.status };
                });
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
        [state, difficulty]
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
