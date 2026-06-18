import { useEffect, useMemo, useRef, useState } from "react";
import { HomeScreen } from "./components/HomeScreen";
import { GameScreen } from "./components/GameScreen";
import { ResultScreen } from "./components/ResultScreen";
import { useMatchPool } from "./hooks/useMatchPool";
import { useGame } from "./hooks/useGame";
import { useStats } from "./hooks/useStats";
import { useTheme } from "./hooks/useTheme";
import { createPlayerSearch } from "./lib/search";
import type { PlayerEntry } from "./types";
import playersData from "./data/players.json";

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
    const [match, setMatch] = useState(() => pool.next());
    const game = useGame(match);
    const recorded = useRef(false);

    const startNew = () => {
        recorded.current = false;
        setMatch(pool.next());
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
        return <HomeScreen stats={stats} onPlay={startNew} />;
    }

    if (screen === "result") {
        return (
            <ResultScreen
                match={match}
                found={game.found}
                wrongGuesses={game.state.wrongGuesses}
                streak={stats.streak}
                theme={theme}
                onToggleTheme={toggleTheme}
                onPlayAgain={startNew}
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
            streak={stats.streak}
            theme={theme}
            onToggleTheme={toggleTheme}
            onHome={goHome}
            onGuess={game.guess}
            onGiveUp={game.giveUp}
        />
    );
}
