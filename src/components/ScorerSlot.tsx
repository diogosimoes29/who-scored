// Lugar de marcador (DESIGN.md): etiqueta de equipa, minuto (âmbar-soft) e nome
// oculto ("? ? ?"). Ao revelar: borda lime, nome a verde, etiquetas de golo.

import type { Goal } from "../types";
import { goalTags, teamTag } from "../lib/format";

type Props = {
  goal: Goal;
  iso1?: string;
  iso2?: string;
  team1: string;
  team2: string;
  revealed: boolean;
  /** revelado por acerto (lime) vs por desistir/resultado (neutro). */
  byGuess?: boolean;
};

export function ScorerSlot({
  goal,
  iso1,
  iso2,
  team1,
  team2,
  revealed,
  byGuess = true,
}: Props) {
  const tag =
    goal.team === 1 ? teamTag(team1, iso1) : teamTag(team2, iso2);

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-panel px-3 py-2.5 transition-colors ${
        revealed && byGuess ? "border-lime/70" : "border-line"
      }`}
    >
      <span className="w-9 shrink-0 font-display text-[11px] uppercase tracking-[0.15em] text-muted">
        {tag}
      </span>
      <span className="w-12 shrink-0 text-right font-mono text-sm text-amber-soft">
        {goal.minute}'
      </span>
      <span className="min-w-0 flex-1">
        {revealed ? (
          <span
            className={`block truncate font-display font-semibold uppercase tracking-[0.04em] text-[15px] ${
              byGuess ? "text-lime" : "text-chalk"
            }`}
          >
            {goal.name}
            <span className="font-body text-[11px] normal-case tracking-normal text-muted">
              {goalTags(goal)}
            </span>
          </span>
        ) : (
          <span className="font-mono text-base tracking-[0.3em] text-muted/70">
            ? ? ?
          </span>
        )}
      </span>
    </div>
  );
}
