export type GameModeId = "all" | "classic" | "renaissance" | "modern";

export type GameMode = {
  id: GameModeId;
  emoji: string;
  label: string; // nome da era (PT-PT)
  years: string; // período a mostrar no tile
  range: [number, number] | null;
};

export const MODES: GameMode[] = [
  { id: "all", emoji: "🌍", label: "Todas as Eras", years: "Todos os anos", range: null },
  { id: "classic", emoji: "📻", label: "Clássica", years: "1930–1970", range: [1930, 1970] },
  { id: "renaissance", emoji: "🎨", label: "Renascimento", years: "1974–1994", range: [1974, 1994] },
  { id: "modern", emoji: "🚀", label: "Moderna", years: "1998–presente", range: [1998, 9999] },
];

/** O ano pertence ao modo? */
export function inMode(year: number, mode: GameMode): boolean {
  if (!mode.range) return true;
  return year >= mode.range[0] && year <= mode.range[1];
}
