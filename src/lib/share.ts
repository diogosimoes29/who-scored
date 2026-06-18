import type { Match } from "../types";
import type { ScoreResult } from "./scoring";
import { mainScore, scoreNote } from "./format";

export function buildShareText(match: Match, result: ScoreResult): string {
    const note = scoreNote(match.score);
    const placar = `${match.team1} ${mainScore(match.score)} ${match.team2}`;
    const ctx = note ? `${match.round} ${match.year} · ${note}` : `${match.round} ${match.year}`;
    const stars =
        "★".repeat(result.stars) + "☆".repeat(3 - result.stars);
    const linha = `${stars}  ${result.found}/${result.total} goalscorers · ${result.wrongGuesses} error${result.wrongGuesses === 1 ? "" : "s"}`;

    return [`Who Scored? ⚽`, placar, ctx, linha].join("\n");
}
