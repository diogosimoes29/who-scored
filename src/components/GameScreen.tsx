import { useEffect, useRef, useState } from "react";
import type { GameState } from "../types";
import type { GuessResult } from "../hooks/useGame";
import type { PlayerSearch as SearchFn } from "../lib/search";
import type { Theme } from "../hooks/useTheme";
import type { DifficultyId } from "../lib/difficulties";
import { MatchHeader } from "./MatchHeader";
import { ScorerSlot } from "./ScorerSlot";
import { PlayerSearch } from "./PlayerSearch";
import { MultipleChoice } from "./MultipleChoice";
import { AppHeader } from "./AppHeader";
import { WrongGuesses } from "./WrongGuesses";

type Props = {
    state: GameState;
    found: number;
    total: number;
    search: SearchFn;
    difficulty: DifficultyId;
    streak: number;
    theme: Theme;
    onToggleTheme: () => void;
    onHome: () => void;
    onGuess: (value: string) => GuessResult;
    onGiveUp: () => void;
};

type Toast = { text: string; tone: "hit" | "miss" } | null;

export function GameScreen({
    state,
    found,
    total,
    search,
    difficulty,
    streak,
    theme,
    onToggleTheme,
    onHome,
    onGuess,
    onGiveUp,
}: Props) {
    const { match, revealed, wrongGuesses, status } = state;
    const [toast, setToast] = useState<Toast>(null);
    const timer = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    function handleGuess(value: string): GuessResult {
        const r = onGuess(value);
        if (r.type === "noop") return r;
        setToast(
            r.type === "hit"
                ? { text: "Certo!", tone: "hit" }
                : { text: "Não foi esse", tone: "miss" }
        );
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setToast(null), 1600);
        return r;
    }

    return (
        <section className="mx-auto flex h-dvh w-full max-w-5xl flex-col gap-4 overflow-hidden px-4 py-5">
            <AppHeader
                streak={streak}
                theme={theme}
                onToggleTheme={onToggleTheme}
                onHome={onHome}
            />
            <MatchHeader match={match} />

            <div className="flex items-center justify-between">
                <h2 className="font-display uppercase tracking-[0.2em] text-[11px] text-muted">
                    Marcadores
                </h2>
                <span className="font-mono text-[13px] text-amber-soft">
                    {found} de {total}
                </span>
            </div>

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
                        />
                    </li>
                ))}
            </ul>

            <div className="flex flex-col items-start justify-between gap-3 font-mono text-[12px] text-muted">
                <div className="flex w-full flex-row place-content-between gap-3">
                    {difficulty === "hard" ? (
                        <HardCards wrong={wrongGuesses.length} />
                    ) : (
                        <span className="min-w-0">
                            Palpites errados: <span className="text-red">{wrongGuesses.length}</span>
                        </span>
                    )}
                    {/* região viva para anunciar feedback a leitores de ecrã */}
                    <span
                        aria-live="polite"
                        className={`min-h-[1.2em] shrink-0 ${
                            toast?.tone === "hit"
                            ? "text-lime"
                            : toast?.tone === "miss"
                                ? "text-red"
                                : ""
                        }`}
                    >
                        {toast?.text ?? ""}
                    </span>
                </div>
                {difficulty !== "hard" && <WrongGuesses guesses={wrongGuesses} />}
            </div>

            <div className="flex flex-col gap-3 pt-2">
                {difficulty === "beginner" ? (
                    <MultipleChoice
                        goals={match.goals}
                        revealed={revealed}
                        onGuess={handleGuess}
                        disabled={status !== "playing"}
                    />
                ) : (
                    <PlayerSearch
                        search={search}
                        onGuess={handleGuess}
                        disabled={status !== "playing"}
                    />
                )}
                <button
                    type="button"
                    onClick={onGiveUp}
                    disabled={status !== "playing"}
                    className="rounded-xl bg-red px-6 py-3.5 font-display text-[15px] font-semibold uppercase tracking-[0.12em] text-ink shadow-[0_0_28px_rgba(255,91,91,.35)] disabled:opacity-40"
                >
                    Desistir
                </button>
            </div>
        </section>
    );
}

/** Indicador de cartões no modo difícil: 🟨 ao 1.º erro, 🟥 ao 2.º (fim). */
function HardCards({ wrong }: { wrong: number }) {
    return (
        <span className="flex items-center gap-2" aria-label={`Cartões: ${wrong} de 2`}>
            <span className={`text-base leading-none ${wrong >= 1 ? "" : "opacity-20 grayscale"}`} role="img" aria-hidden="true">🟨</span>
            <span className={`text-base leading-none ${wrong >= 2 ? "" : "opacity-20 grayscale"}`} role="img" aria-hidden="true">🟥</span>
        </span>
    );
}
