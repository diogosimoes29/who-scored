import { useState } from "react";
import type { Stats } from "../hooks/useStats";
import type { Theme } from "../hooks/useTheme";
import { MODES, type GameMode } from "../lib/modes";
import { DIFFICULTIES, type Difficulty } from "../lib/difficulties";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
    onPlay: (mode: GameMode, difficulty: Difficulty) => void;
    stats: Stats;
    theme: Theme;
    onToggleTheme: () => void;
};

export function HomeScreen({ onPlay, stats, theme, onToggleTheme }: Props) {
    const [difficulty, setDifficulty] = useState<Difficulty>(
        DIFFICULTIES.find((d) => d.id === "normal")!
    );
    const [era, setEra] = useState<GameMode>(MODES[0]!);

    return (
        <section className="mx-auto flex h-dvh w-full max-w-5xl flex-col overflow-hidden px-4 py-5">
            <div className="flex items-center justify-between">
                <span
                    className="flex items-center gap-1.5 rounded-xl border border-line bg-panel px-2.5 py-2 font-mono text-[14px] text-amber-soft"
                    aria-label={`Best streak: ${stats.best}`}
                >
                    <span className="text-xl leading-none" role="img" aria-hidden="true">
                        🏆
                    </span>
                    {stats.best}
                </span>
                <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="flex min-h-full flex-col items-center justify-center gap-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <h1 className="font-display text-[clamp(40px,14vw,54px)] font-bold uppercase leading-none tracking-[0.06em] scoreboard-glow">
                            Who Scored?
                        </h1>
                        <p className="max-w-xs font-body text-[15px] leading-relaxed text-muted">
                            You get a World Cup game. See the teams, date and result.
                            Guess the goalscorers.
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-5">
                        <fieldset className="flex flex-col gap-2">
                            <legend className="mb-2 font-display uppercase tracking-[0.2em] text-[11px] text-muted">
                                Difficulty
                            </legend>
                            <div className="grid grid-cols-3 gap-3">
                                {DIFFICULTIES.map((d) => (
                                    <Tile
                                        key={d.id}
                                        selected={d.id === difficulty.id}
                                        onClick={() => setDifficulty(d)}
                                        emoji={d.emoji}
                                        title={d.label}
                                        subtitle={d.desc}
                                    />
                                ))}
                            </div>
                        </fieldset>

                        <fieldset className="flex flex-col gap-2">
                            <legend className="mb-2 font-display uppercase tracking-[0.2em] text-[11px] text-muted">
                                Era
                            </legend>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {MODES.map((m) => (
                                    <Tile
                                        key={m.id}
                                        selected={m.id === era.id}
                                        onClick={() => setEra(m)}
                                        emoji={m.emoji}
                                        title={m.label}
                                        subtitle={m.years}
                                    />
                                ))}
                            </div>
                        </fieldset>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <button
                    type="button"
                    onClick={() => onPlay(era, difficulty)}
                    className="rounded-xl w-full bg-amber px-10 py-3.5 font-display text-[16px] font-semibold uppercase tracking-[0.15em] text-ink shadow-cta"
                >
                    Play
                </button>
            </div>
        </section>
    );
}

function Tile({
    selected,
    onClick,
    emoji,
    title,
    subtitle,
}: {
    selected: boolean;
    onClick: () => void;
    emoji: string;
    title: string;
    subtitle: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-4 transition-colors ${
                selected
                    ? "border-amber bg-panel2"
                    : "border-line bg-panel hover:border-amber/60"
            }`}
        >
            <span className="text-3xl leading-none" role="img" aria-hidden="true">
                {emoji}
            </span>
            <span className="font-display text-[14px] font-bold uppercase tracking-[0.06em] text-chalk">
                {title}
            </span>
            <span className="font-mono text-[11px] text-muted">{subtitle}</span>
        </button>
    );
}
