// Modos de dificuldade (ortogonais à era). Controlam COMO se joga.

export type DifficultyId = "beginner" | "normal" | "hard";

export type Difficulty = {
  id: DifficultyId;
  emoji: string;
  label: string; // PT-PT
  desc: string; // descrição curta no tile
};

export const DIFFICULTIES: Difficulty[] = [
  { id: "beginner", emoji: "🟢", label: "Principiante", desc: "Escolha múltipla" },
  { id: "normal", emoji: "🟡", label: "Normal", desc: "Tentativas ilimitadas" },
  { id: "hard", emoji: "🔴", label: "Difícil", desc: "2 tentativas" },
];
