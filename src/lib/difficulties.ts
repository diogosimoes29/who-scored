export type DifficultyId = "beginner" | "normal" | "hard";

export type Difficulty = {
  id: DifficultyId;
  emoji: string;
  label: string;
  desc: string;
};

export const DIFFICULTIES: Difficulty[] = [
  { id: "beginner", emoji: "🟢", label: "Beginner", desc: "Multiple choice" },
  { id: "normal", emoji: "🟡", label: "Normal", desc: "Unlimited guesses" },
  { id: "hard", emoji: "🔴", label: "Hard", desc: "2 guesses" },
];
