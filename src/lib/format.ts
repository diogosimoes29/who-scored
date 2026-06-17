// Helpers de apresentação puros (datas, placard, etiquetas, bandeiras).

import type { Goal, Match, Score } from "../types";

const MESES = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

/** "2022-12-18" → "18 dez 2022". */
export function formatDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  const mes = MESES[Number(mo) - 1] ?? mo;
  return `${Number(d)} ${mes} ${y}`;
}

/** Resultado principal do placard (prolongamento se existir, senão t. regul.). */
export function mainScore(score: Score): string {
  const [a, b] = score.et ?? score.ft;
  return `${a}–${b}`;
}

/** Legenda do desempate: "4–2 g.p." ou "a.p." (após prolongamento). */
export function scoreNote(score: Score): string | null {
  if (score.p) return `${score.p[0]}–${score.p[1]} g.p.`;
  if (score.et) return "a.p.";
  return null;
}

/** Etiqueta curta da equipa para o slot (AR, FR, ENG…). */
export function teamTag(name: string, iso?: string): string {
  if (iso) {
    const sub = iso.split("-")[1];
    if (sub) return sub.toUpperCase(); // gb-eng → ENG
    return iso.toUpperCase(); // ar → AR
  }
  return name.slice(0, 3).toUpperCase();
}

/** Bandeira emoji a partir do ISO alpha-2 (sem subdivisões). */
export function flagEmoji(iso?: string): string {
  if (!iso || iso.includes("-") || iso.length !== 2) return "🏳️";
  const A = 0x1f1e6;
  const cc = iso.toUpperCase();
  return String.fromCodePoint(
    A + (cc.charCodeAt(0) - 65),
    A + (cc.charCodeAt(1) - 65)
  );
}

/** Etiquetas de um golo: "(g.p.)" penálti, "(p.b.)" autogolo. */
export function goalTags(goal: Goal): string {
  const tags: string[] = [];
  if (goal.penalty) tags.push("g.p.");
  if (goal.ownGoal) tags.push("p.b.");
  return tags.length ? ` (${tags.join(", ")})` : "";
}

/** "Final", "Matchday 1 · Grupo A"… para o cabeçalho. */
export function roundLabel(match: Match): string {
  return match.group ? `${match.round} · ${match.group}` : match.round;
}
