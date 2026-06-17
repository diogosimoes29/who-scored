// Pontuação (DESIGN.md / PRD 4.3) — função pura de (marcadores, erros).
// Modo amigável: tentativas ilimitadas; a pontuação penaliza palpites errados.

export type ScoreResult = {
  found: number; // golos revelados por acerto
  total: number; // total de golos (lugares)
  wrongGuesses: number;
  completed: boolean; // descobriu todos
  stars: 0 | 1 | 2 | 3;
  percent: number; // precisão: acertos / (acertos + erros)
};

export function computeScore(
  found: number,
  total: number,
  wrongGuesses: number
): ScoreResult {
  const completed = total > 0 && found >= total;
  const attempts = found + wrongGuesses;
  const percent = attempts === 0 ? 0 : Math.round((found / attempts) * 100);

  let stars: 0 | 1 | 2 | 3 = 0;
  if (completed) {
    if (wrongGuesses === 0) stars = 3; // sem erros
    else if (wrongGuesses <= total) stars = 2; // até 1 erro por golo
    else stars = 1; // completou, mas com muitos erros
  }

  return { found, total, wrongGuesses, completed, stars, percent };
}
