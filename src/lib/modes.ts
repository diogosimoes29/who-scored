export type GameModeId = "all" | "classic" | "renaissance" | "modern";

export type GameMode = {
    id: GameModeId;
    emoji: string;
    label: string; 
    years: string; 
    range: [number, number] | null;
};

export const MODES: GameMode[] = [
    { id: "all", emoji: "🌍", label: "All-time", years: "All years", range: null },
    { id: "classic", emoji: "📻", label: "Classic", years: "1930–1970", range: [1930, 1970] },
    { id: "renaissance", emoji: "🎨", label: "Renaissance", years: "1974–1994", range: [1974, 1994] },
    { id: "modern", emoji: "🚀", label: "Modern", years: "1998–present", range: [1998, 9999] },
];

export function inMode(year: number, mode: GameMode): boolean {
    if (!mode.range) return true;
    return year >= mode.range[0] && year <= mode.range[1];
}
