// Pipeline de dados (build-time) — DESIGN.md Parte 2 / PRD 5.3.
//
// 1. Para cada ano 1930…2026 faz fetch do worldcup.json (raw GitHub).
// 2. Mapeia cada jogo para o tipo Match; achata goals1/goals2 em goals[].
// 3. Filtra jogos sem golos / sem marcadores.
// 4. Traduz team1/team2 para PT-PT + ISO via teams-pt.ts.
// 5. Escreve src/data/matches.json e src/data/players.json (dedup por key).
//
// NÃO é executado em runtime — só com `npm run build:data`.

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { normalize } from "../src/lib/normalize.ts";
import { teamInfo } from "../src/data/teams-pt.ts";
import type { Goal, Match, PlayerEntry, Score } from "../src/types.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "src", "data");
const FIRST_YEAR = 1930;
const LAST_YEAR = 2026;
const BASE =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master";

// ── Tipos do JSON bruto (openfootball) ──────────────────────────────────────
type RawGoal = {
  name?: string;
  minute?: number | string;
  offset?: number;
  penalty?: boolean;
  owngoal?: boolean;
};
type RawMatch = {
  round?: string;
  group?: string;
  date?: string;
  team1?: string;
  team2?: string;
  ground?: string;
  city?: string;
  stadium?: { name?: string } | string;
  score?: Partial<Score> & { ft?: [number, number] };
  score1?: number;
  score2?: number;
  goals1?: RawGoal[];
  goals2?: RawGoal[];
};
type RawRound = { name?: string; matches?: RawMatch[] };
type RawData = { rounds?: RawRound[]; matches?: RawMatch[] };

// ── Helpers ─────────────────────────────────────────────────────────────────
const slug = (s: string) =>
  normalize(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Minuto canónico: "90" ou "90+9" (juntando offset de descontos). */
function minuteOf(g: RawGoal): string {
  const base = g.minute ?? "";
  if (g.offset && Number(g.offset) > 0) return `${base}+${g.offset}`;
  return String(base);
}

/** Valor numérico do minuto para ordenação (90+9 → 99). */
function minuteValue(m: string): number {
  const [a, b] = m.split("+");
  return (Number(a) || 0) + (b ? Number(b) || 0 : 0);
}

function groundOf(m: RawMatch): string {
  if (m.ground) return m.ground;
  const stadium =
    typeof m.stadium === "string" ? m.stadium : m.stadium?.name ?? "";
  if (stadium && m.city) return `${stadium}, ${m.city}`;
  return stadium || m.city || "";
}

function scoreOf(m: RawMatch): Score {
  if (m.score?.ft) {
    const s: Score = { ft: m.score.ft };
    if (m.score.ht) s.ht = m.score.ht;
    if (m.score.et) s.et = m.score.et;
    if (m.score.p) s.p = m.score.p;
    return s;
  }
  return { ft: [m.score1 ?? 0, m.score2 ?? 0] };
}

function goalsOf(m: RawMatch): Goal[] {
  const out: Goal[] = [];
  for (const [team, list] of [
    [1, m.goals1],
    [2, m.goals2],
  ] as const) {
    for (const g of list ?? []) {
      if (!g.name) continue; // sem marcador identificável → ignora
      const goal: Goal = {
        team,
        name: g.name,
        key: normalize(g.name),
        minute: minuteOf(g),
      };
      if (g.penalty) goal.penalty = true;
      if (g.owngoal) goal.ownGoal = true;
      out.push(goal);
    }
  }
  return out.sort((a, b) => minuteValue(a.minute) - minuteValue(b.minute));
}

// ── Pipeline ────────────────────────────────────────────────────────────────
const unknownTeams = new Set<string>();

function toMatch(
  raw: RawMatch,
  year: number,
  roundName: string,
  usedIds: Set<string>
): Match | null {
  if (!raw.team1 || !raw.team2) return null;
  const goals = goalsOf(raw);
  if (goals.length === 0) return null; // filtro: sem golos/marcadores

  const t1 = teamInfo(raw.team1);
  const t2 = teamInfo(raw.team2);
  if (!t1) unknownTeams.add(raw.team1);
  if (!t2) unknownTeams.add(raw.team2);

  const round = raw.round || roundName || "";
  const a = t1?.iso ?? slug(raw.team1);
  const b = t2?.iso ?? slug(raw.team2);
  let id = `${year}-${slug(round) || "x"}-${a}-${b}`;
  let n = 2;
  while (usedIds.has(id)) id = `${year}-${slug(round) || "x"}-${a}-${b}-${n++}`;
  usedIds.add(id);

  const match: Match = {
    id,
    year,
    date: raw.date ?? "",
    round,
    ground: groundOf(raw),
    team1: t1?.pt ?? raw.team1,
    team2: t2?.pt ?? raw.team2,
    score: scoreOf(raw),
    goals,
  };
  if (raw.group) match.group = raw.group;
  if (t1?.iso) match.iso1 = t1.iso;
  if (t2?.iso) match.iso2 = t2.iso;
  return match;
}

function collectMatches(
  data: RawData,
  year: number,
  usedIds: Set<string>
): Match[] {
  const result: Match[] = [];
  const push = (raw: RawMatch, roundName: string) => {
    const m = toMatch(raw, year, roundName, usedIds);
    if (m) result.push(m);
  };
  if (data.rounds) {
    for (const r of data.rounds)
      for (const raw of r.matches ?? []) push(raw, r.name ?? "");
  }
  if (data.matches) for (const raw of data.matches) push(raw, "");
  return result;
}

async function fetchYear(year: number): Promise<RawData | null> {
  const url = `${BASE}/${year}/worldcup.json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null; // 404 em anos sem Mundial
    return (await res.json()) as RawData;
  } catch {
    return null;
  }
}

async function main() {
  const usedIds = new Set<string>();
  const matches: Match[] = [];

  for (let year = FIRST_YEAR; year <= LAST_YEAR; year++) {
    const data = await fetchYear(year);
    if (!data) continue;
    const got = collectMatches(data, year, usedIds);
    if (got.length) {
      matches.push(...got);
      console.log(`  ${year}: ${got.length} jogos jogáveis`);
    }
  }

  // Dicionário de pesquisa: união de marcadores, deduplicada por key.
  const playerMap = new Map<string, PlayerEntry>();
  for (const m of matches)
    for (const g of m.goals)
      if (!playerMap.has(g.key)) playerMap.set(g.key, { key: g.key, label: g.name });
  const players = [...playerMap.values()].sort((a, b) =>
    a.label.localeCompare(b.label, "pt")
  );

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, "matches.json"), JSON.stringify(matches), "utf8");
  await writeFile(join(OUT_DIR, "players.json"), JSON.stringify(players), "utf8");

  console.log(`\n✔ ${matches.length} jogos → src/data/matches.json`);
  console.log(`✔ ${players.length} marcadores → src/data/players.json`);

  if (unknownTeams.size) {
    console.warn(
      `\n⚠ Equipas sem tradução em teams-pt.ts (${unknownTeams.size}):`
    );
    console.warn("  " + [...unknownTeams].sort().join(", "));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
