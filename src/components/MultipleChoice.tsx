// Escolha múltipla (modo Principiante): grelha 2×2 estilo gameshow, opções A–D.
// Uma opção correta (um marcador por revelar) + 3 distratores (jogadores de
// qualquer era que não marcaram neste jogo). Acertar → renova as 4 opções;
// errar → essa opção fica desativada, sem renovar.

import { useEffect, useState } from "react";
import type { Goal, PlayerEntry } from "../types";
import type { GuessResult } from "../hooks/useGame";
import playersData from "../data/players.json";

const PLAYERS = playersData as PlayerEntry[];
const LETTERS = ["A", "B", "C", "D"];

type Option = { key: string; label: string };

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function buildOptions(goals: Goal[], revealed: boolean[]): Option[] {
  const unrevealed = goals.filter((_, i) => !revealed[i]);
  if (unrevealed.length === 0) return [];
  const target = unrevealed[Math.floor(Math.random() * unrevealed.length)]!;
  // distratores: jogadores que NÃO marcaram neste jogo (garante 1 só correta)
  const scorerKeys = new Set(goals.map((g) => g.key));
  const distractors = shuffle(PLAYERS.filter((p) => !scorerKeys.has(p.key)))
    .slice(0, 3)
    .map((p) => ({ key: p.key, label: p.label }));
  return shuffle([{ key: target.key, label: target.name }, ...distractors]);
}

type Props = {
  goals: Goal[];
  revealed: boolean[];
  onGuess: (value: string) => GuessResult;
  disabled?: boolean;
};

export function MultipleChoice({ goals, revealed, onGuess, disabled }: Props) {
  const [options, setOptions] = useState<Option[]>([]);
  const [wrongKeys, setWrongKeys] = useState<Set<string>>(new Set());

  // (Re)gera as opções no arranque e sempre que `revealed` muda (= um acerto
  // revelou um golo, novo array). Num erro, `revealed` mantém a referência → não
  // regenera; apenas se desativa a opção errada.
  useEffect(() => {
    setOptions(buildOptions(goals, revealed));
    setWrongKeys(new Set());
  }, [goals, revealed]);

  if (options.length === 0) return null;

  function pick(opt: Option) {
    if (disabled || wrongKeys.has(opt.key)) return;
    const r = onGuess(opt.label);
    if (r.type === "miss") setWrongKeys((s) => new Set(s).add(opt.key));
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((opt, i) => {
        const isWrong = wrongKeys.has(opt.key);
        return (
          <button
            key={opt.key}
            type="button"
            disabled={disabled || isWrong}
            onClick={() => pick(opt)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-3.5 text-left font-body text-[15px] transition-colors ${
              isWrong
                ? "border-red/40 bg-panel text-muted line-through opacity-50"
                : "border-line bg-panel text-chalk hover:border-amber"
            }`}
          >
            <span className="font-display font-bold text-amber-soft">
              {LETTERS[i]}:
            </span>
            <span className="min-w-0 truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
