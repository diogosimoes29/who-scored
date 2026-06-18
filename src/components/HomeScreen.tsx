import type { Stats } from "../hooks/useStats";
import { MODES, type GameMode } from "../lib/modes";

type Props = { onPlay: (mode: GameMode) => void; stats: Stats };

export function HomeScreen({ onPlay, stats }: Props) {
    return (
        <section className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col items-center justify-center gap-8 px-6 text-center">
            <div className="flex flex-col items-center gap-4">
                <h1 className="font-display text-[clamp(40px,14vw,54px)] font-bold uppercase leading-none tracking-[0.06em] scoreboard-glow">
                    Quem Marcou?
                </h1>
                <p className="max-w-xs font-body text-[15px] leading-relaxed text-muted">
                    Vês um jogo de Mundial — as equipas, a data e o resultado. Adivinha
                    quem marcou os golos.
                </p>
            </div>

            <div className="grid w-full grid-cols-4 gap-3">
                {MODES.map((mode) => (
                    <button
                        key={mode.id}
                        type="button"
                        onClick={() => onPlay(mode)}
                        className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-panel px-2 py-4 transition-colors hover:border-amber"
                    >
                        <span className="text-3xl leading-none" role="img" aria-hidden="true">
                            {mode.emoji}
                        </span>
                        <span className="font-display text-[14px] font-bold uppercase tracking-[0.06em] text-chalk">
                            {mode.label}
                        </span>
                        <span className="font-mono text-[11px] text-muted">
                            {mode.years}
                        </span>
                    </button>
                ))}
            </div>

            {stats.played > 0 && (
                <p className="font-mono text-[13px] text-muted">
                    Sequência: <span className="text-amber-soft">{stats.streak}</span> ·
                    Melhor: <span className="text-amber-soft">{stats.best}</span>
                </p>
            )}
        </section>
    );
}
