// Placard estilo marcador eletrónico (DESIGN.md). Grelha 1fr auto 1fr:
// equipa / resultado / equipa. Resultado em mono âmbar com brilho + scanlines.

import type { Match } from "../types";
import {
  flagUrl,
  formatDate,
  mainScore,
  roundLabel,
  scoreNote,
} from "../lib/format";

export function MatchHeader({ match }: { match: Match }) {
  const note = scoreNote(match.score);
  return (
    <header>
      <p className="text-center font-display uppercase tracking-[0.2em] text-[11px] text-muted">
        {formatDate(match.date)} · {roundLabel(match)}
      </p>
      {match.ground && (
        <p className="mt-1 text-center font-body text-[12px] text-muted/80">
          {match.ground}
        </p>
      )}

      <div className="scanlines mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-placard border border-line bg-gradient-to-b from-panel to-bg2 px-4 py-5">
        <Team name={match.team1} iso={match.iso1} align="right" />

        <div className="flex flex-col items-center">
          <span className="font-mono text-4xl font-bold leading-none scoreboard-glow">
            {mainScore(match.score)}
          </span>
          {note && (
            <span className="mt-1 font-mono text-[11px] text-amber-soft">
              {note}
            </span>
          )}
        </div>

        <Team name={match.team2} iso={match.iso2} align="left" />
      </div>
    </header>
  );
}

function Team({
  name,
  iso,
  align,
}: {
  name: string;
  iso?: string;
  align: "left" | "right";
}) {
  const flag = <Flag iso={iso} name={name} />;
  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${
        align === "right" ? "justify-end text-right" : "justify-start text-left"
      }`}
    >
      {align === "left" && flag}
      <span className="truncate font-display font-semibold uppercase tracking-[0.08em] text-[15px] text-chalk">
        {name}
      </span>
      {align === "right" && flag}
    </div>
  );
}

function Flag({ iso, name }: { iso?: string; name: string }) {
  const src = flagUrl(iso);
  if (!src) return null;
  return (
    <img
      src={src}
      alt={`Bandeira: ${name}`}
      width={28}
      height={21}
      loading="lazy"
      className="h-[21px] w-7 shrink-0 rounded-sm object-cover ring-1 ring-line"
    />
  );
}
