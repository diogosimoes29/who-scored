import { useCallback, useRef } from "react";
import type { Match } from "../types";
import { inMode, type GameMode } from "../lib/modes";
import matchesData from "../data/matches.json";

const ALL = matchesData as Match[];

export function useMatchPool() {
    const seen = useRef<Set<string>>(new Set());

    const next = useCallback((mode: GameMode): Match => {
        const inEra = ALL.filter((m) => inMode(m.year, mode));
        let remaining = inEra.filter((m) => !seen.current.has(m.id));
        if (remaining.length === 0) {
            for (const m of inEra) seen.current.delete(m.id);
            remaining = inEra;
        }
        const pick = remaining[Math.floor(Math.random() * remaining.length)]!;
        seen.current.add(pick.id);
        return pick;
    }, []);

    return { next, total: ALL.length };
}
