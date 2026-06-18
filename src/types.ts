// Modelo de dados (DESIGN.md, Parte 2). Partilhado entre o pipeline de build
// (scripts/build-data.ts) e a app.

export type Goal = {
  team: 1 | 2; // 1 = team1, 2 = team2
  name: string; // nome do marcador (label)
  key: string; // nome normalizado (sem acentos, minúsculas)
  minute: string; // "23", "90+9", "108"
  penalty?: boolean;
  ownGoal?: boolean;
};

export type Score = {
  ft: [number, number]; // tempo regulamentar
  ht?: [number, number]; // intervalo
  et?: [number, number]; // prolongamento
  p?: [number, number]; // grandes penalidades
};

export type Match = {
  id: string; // ex.: "2022-final-arg-fra"
  year: number;
  date: string; // ISO
  round: string; // "Final", "Matchday 1"…
  group?: string;
  ground: string;
  team1: string;
  team2: string; // nomes em PT (via teams-pt.ts)
  iso1?: string;
  iso2?: string; // código p/ bandeira
  score: Score;
  goals: Goal[]; // já ordenados por minuto; "lugares" = goals.length
};

export type PlayerEntry = { key: string; label: string }; // dicionário de pesquisa

// "lost" = derrota no modo difícil (cartão vermelho); não revela o que faltou.
export type GameStatus = "playing" | "won" | "revealed" | "lost";

export type GameState = {
  match: Match;
  revealed: boolean[]; // por golo
  wrongGuesses: string[]; // nomes dos palpites errados (sem repetições)
  status: GameStatus;
};
