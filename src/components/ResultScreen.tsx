import { useState } from "react";
import type { Match } from "../types";
import type { Theme } from "../hooks/useTheme";
import { computeScore } from "../lib/scoring";
import { buildShareText } from "../lib/share";
import { ScorerSlot } from "./ScorerSlot";
import { MatchHeader } from "./MatchHeader";
import { AppHeader } from "./AppHeader";
import { WrongGuesses } from "./WrongGuesses";

type Props = {
    match: Match;
    found: number;
    wrongGuesses: string[];
    revealed: boolean[];
    streak: number;
    theme: Theme;
    onToggleTheme: () => void;
    onPlayAgain: () => void;
    onHome: () => void;
};

export function ResultScreen({
    match,
    found,
    wrongGuesses,
    revealed,
    streak,
    theme,
    onToggleTheme,
    onPlayAgain,
    onHome,
}: Props) {
    const result = computeScore(found, match.goals.length, wrongGuesses.length);
    const [shared, setShared] = useState(false);

    async function share() {
        const text = buildShareText(match, result);
        try {
        if (navigator.share) {
            await navigator.share({ text });
        } else {
            await navigator.clipboard.writeText(text);
            setShared(true);
            window.setTimeout(() => setShared(false), 1800);
        }
        } catch {
            console.warn("Share failed");
        }
    }

    return (
        <section className="mx-auto flex h-dvh w-full max-w-5xl flex-col gap-4 overflow-hidden px-4 py-5">
            <AppHeader
                streak={streak}
                theme={theme}
                onToggleTheme={onToggleTheme}
                onHome={onHome}
            />

            <div className="text-center">
                <p className="font-mono text-[15px] text-amber-soft">
                    {result.found} de {result.total} marcadores
                    {result.completed ? " ✓" : ""}
                </p>
                <p
                    className="mt-1 text-2xl scoreboard-glow"
                    aria-label={`Pontuação: ${result.stars} de 3 estrelas`}
                >
                    {"★".repeat(result.stars)}
                    <span className="text-muted/50">{"★".repeat(3 - result.stars)}</span>
                </p>
                <p className="mt-1 font-mono text-[12px] text-muted">
                    {result.percent}% de precisão · {result.wrongGuesses} erro
                    {result.wrongGuesses === 1 ? "" : "s"}
                </p>
            </div>

            <MatchHeader match={match} />

            <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                {match.goals.map((goal, i) => (
                <li key={i}>
                    <ScorerSlot
                    goal={goal}
                    iso1={match.iso1}
                    iso2={match.iso2}
                    team1={match.team1}
                    team2={match.team2}
                    revealed={revealed[i] ?? false}
                    byGuess={false}
                    />
                </li>
                ))}
            </ul>

            {wrongGuesses.length > 0 && (
                <div className="font-mono text-[12px] text-muted">
                <span className="uppercase tracking-[0.15em] text-[11px]">
                    Palpites errados ({wrongGuesses.length})
                </span>
                <div className="mt-1">
                    <WrongGuesses guesses={wrongGuesses} />
                </div>
                </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
                <button
                    type="button"
                    onClick={onPlayAgain}
                    className="rounded-xl bg-amber px-6 py-3.5 font-display text-[15px] font-semibold uppercase tracking-[0.12em] text-bg shadow-cta"
                >
                    Próximo
                </button>
                <div className="flex gap-2">
                <button
                    type="button"
                    onClick={share}
                    className="flex-1 rounded-xl border border-line bg-panel px-6 py-3 font-display text-[14px] font-semibold uppercase tracking-[0.12em] text-chalk hover:border-amber"
                >
                    {shared ? "Copiado!" : "Partilhar"}
                </button>
                <button
                    type="button"
                    onClick={onHome}
                    className="rounded-xl border border-line bg-panel px-6 py-3 font-display text-[14px] font-semibold uppercase tracking-[0.12em] text-muted hover:text-chalk"
                >
                    Início
                </button>
                </div>
            </div>
        </section>
    );
}
