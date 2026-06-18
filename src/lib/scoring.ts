export type ScoreResult = {
    found: number; 
    total: number;
    wrongGuesses: number;
    completed: boolean;
    stars: 0 | 1 | 2 | 3;
    percent: number;
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
        if (wrongGuesses === 0) stars = 3; 
        else if (wrongGuesses <= total) stars = 2; 
        else stars = 1; 
    }

    return { found, total, wrongGuesses, completed, stars, percent };
}
