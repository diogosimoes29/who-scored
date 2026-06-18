import { useEffect, useMemo, useRef, useState } from "react";
import { HomeScreen } from "./components/HomeScreen";
import { GameScreen } from "./components/GameScreen";
import { ResultScreen } from "./components/ResultScreen";
import { useMatchPool } from "./hooks/useMatchPool";
import { useGame } from "./hooks/useGame";
import { useStats } from "./hooks/useStats";
import { useTheme } from "./hooks/useTheme";
import { createPlayerSearch } from "./lib/search";
import { MODES, type GameMode } from "./lib/modes";
import { DIFFICULTIES, type Difficulty } from "./lib/difficulties";
import type { PlayerEntry } from "./types";
import playersData from "./data/players.json";

const NORMAL = DIFFICULTIES.find((d) => d.id === "normal")!;

type Screen = "home" | "playing" | "result";

const REVEAL_DELAY = 900;

export default function App() {
    const pool = useMatchPool();
    const { stats, record, resetStreak } = useStats();
    const { theme, toggle: toggleTheme } = useTheme();
    const search = useMemo(
        () => createPlayerSearch(playersData as PlayerEntry[]),
        []
    );

    const [screen, setScreen] = useState<Screen>("home");
    const [mode, setMode] = useState<GameMode>(MODES[0]!);
    const [difficulty, setDifficulty] = useState<Difficulty>(NORMAL);
    const [match, setMatch] = useState(() => pool.next(MODES[0]!));
    const game = useGame(match, difficulty.id);
    const recorded = useRef(false);

    // Sem argumentos (ex.: "Próximo") mantém a era e a dificuldade atuais.
    const startNew = (m: GameMode = mode, d: Difficulty = difficulty) => {
        recorded.current = false;
        setMode(m);
        setDifficulty(d);
        setMatch(pool.next(m));
        setScreen("playing");
    };

    const goHome = () => {
        resetStreak();
        setScreen("home");
    };

    const { status } = game.state;
    useEffect(() => {
        if (screen !== "playing") return;
        if (status === "playing") return;
        if (!recorded.current) {
            record(status === "won");
            recorded.current = true;
        }
        const reduce = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        const delay = status === "won" && !reduce ? REVEAL_DELAY : 0;
        const t = window.setTimeout(() => setScreen("result"), delay);
        return () => window.clearTimeout(t);
    }, [screen, status, record]);

    if (screen === "home") {
        return (
            <HomeScreen
                stats={stats}
                onPlay={startNew}
                theme={theme}
                onToggleTheme={toggleTheme}
            />
        );
    }

    if (screen === "result") {
        return (
            <ResultScreen
                match={match}
                found={game.found}
                wrongGuesses={game.state.wrongGuesses}
                revealed={game.state.revealed}
                streak={stats.streak}
                theme={theme}
                onToggleTheme={toggleTheme}
                onPlayAgain={() => startNew()}
                onHome={goHome}
            />
        );
    }

    return (
        <GameScreen
            state={game.state}
            found={game.found}
            total={game.total}
            search={search}
            difficulty={difficulty.id}
            streak={stats.streak}
            theme={theme}
            onToggleTheme={toggleTheme}
            onHome={goHome}
            onGuess={game.guess}
            onGiveUp={game.giveUp}
        />
    );
}
