// Ecrã inicial (PRD 9.1): wordmark-placard, descrição curta, botão Jogar e
// estatísticas locais.

import type { Stats } from "../hooks/useStats";

type Props = { onPlay: () => void; stats: Stats };

export function HomeScreen({ onPlay, stats }: Props) {
  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="font-display text-[clamp(40px,14vw,54px)] font-bold uppercase leading-none tracking-[0.06em] scoreboard-glow">
          Quem Marcou?
        </h1>
        <p className="max-w-xs font-body text-[15px] leading-relaxed text-muted">
          Vês um jogo de Mundial — as equipas, a data e o resultado. Adivinha
          quem marcou os golos.
        </p>
      </div>

      <button
        type="button"
        onClick={onPlay}
        className="rounded-xl bg-amber px-10 py-3.5 font-display text-[16px] font-semibold uppercase tracking-[0.15em] text-bg shadow-cta"
      >
        Jogar
      </button>

      {stats.played > 0 && (
        <p className="font-mono text-[13px] text-muted">
          Sequência: <span className="text-amber-soft">{stats.streak}</span> ·
          Melhor: <span className="text-amber-soft">{stats.best}</span>
        </p>
      )}
    </section>
  );
}
