import Fuse from "fuse.js";
import { normalize } from "./normalize";
import type { Goal } from "../types";

type Candidate = { goal: Goal; index: number };

export function findGoalToReveal(
    guess: string,
    goals: Goal[],
    revealed: boolean[]
): number | null {
    const nk = normalize(guess);
    if (!nk) return null;

    const open: Candidate[] = goals
        .map((goal, index) => ({ goal, index }))
        .filter((c) => !revealed[c.index]);
    if (open.length === 0) return null;

    const exact = open.find((c) => c.goal.key === nk);
    if (exact) return exact.index;

    const byToken = open.filter((c) => c.goal.key.split(" ").includes(nk));
    if (byToken.length > 0) {
        const distinct = new Set(byToken.map((c) => c.goal.key));
        if (distinct.size === 1) return byToken[0]!.index;
        return null;
    }

    const fuse = new Fuse(open, {
        keys: ["goal.key"],
        threshold: 0.2,
        ignoreLocation: true,
        minMatchCharLength: 3,
    });
    const best = fuse.search(nk)[0];
    return best ? best.item.index : null;
}
