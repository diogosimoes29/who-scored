// Ecrã de resultado (PRD 9.3): revelação completa, pontuação em estrelas,
// Jogar outra vez e Partilhar (texto/emoji).

import { useState } from "react";
import type { Match } from "../types";
import { computeScore } from "../lib/scoring";
import { buildShareText } from "../lib/share";
import { ScorerSlot } from "./ScorerSlot";
import { MatchHeader } from "./MatchHeader";

type Props = {
  match: Match;
  found: number;
  wrongGuesses: string[];
  onPlayAgain: () => void;
  onHome: () => void;
};

export function ResultScreen({
  match,
  found,
  wrongGuesses,
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
      /* utilizador cancelou ou indisponível */
    }
  }

  return (
    <section className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 px-4 py-5">
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

      <ul className="flex flex-col gap-2">
        {match.goals.map((goal, i) => (
          <li key={i}>
            <ScorerSlot
              goal={goal}
              iso1={match.iso1}
              iso2={match.iso2}
              team1={match.team1}
              team2={match.team2}
              revealed
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
          <p className="mt-1 text-red">{wrongGuesses.join(", ")}</p>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-2">
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-xl bg-amber px-6 py-3.5 font-display text-[15px] font-semibold uppercase tracking-[0.12em] text-bg shadow-cta"
        >
          Jogar outra vez
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
