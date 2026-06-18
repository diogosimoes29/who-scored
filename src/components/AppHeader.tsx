import type { Theme } from "../hooks/useTheme";

type Props = {
    streak: number;
    theme: Theme;
    onToggleTheme: () => void;
    onHome: () => void;
};

export function AppHeader({
    streak,
    theme,
    onToggleTheme,
    onHome
}: Props) {
    return (
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="flex justify-start">
                <button
                    type="button"
                    onClick={onHome}
                    aria-label="Início"
                    className="rounded-xl border border-line bg-panel p-2 text-muted hover:border-amber hover:text-chalk"
                >
                <HomeIcon />
                </button>
            </div>

            <h1 className="font-display text-[15px] font-bold uppercase tracking-[0.12em] scoreboard-glow">
                Quem Marcou?
            </h1>

            <div className="flex items-center justify-end gap-2">
                <StreakCounter streak={streak} />
                <button
                    type="button"
                    onClick={onToggleTheme}
                    aria-label={
                        theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"
                    }
                    className="rounded-xl border border-line bg-panel p-2 text-muted hover:border-amber hover:text-chalk"
                >
                    {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </button>
            </div>
        </header>
    );
}

/** Contador de sequência: 🔥 cresce com a sequência (1 pequeno, 2 médio, 3+ normal). */
function StreakCounter({ streak }: { streak: number }) {
    const size = streak >= 3 
        ? "text-2xl" 
        : streak === 2 
            ? "text-lg"
            : "text-sm";
            
    return (
        <span
            className="flex items-center gap-1 font-mono"
            aria-label={`Sequência: ${streak}`}
        >
            <span
                className={`${size} leading-none ${streak <= 0 ? "opacity-40 grayscale" : ""}`}
                role="img"
                aria-hidden="true"
            >
                🔥
            </span>
            <span className="text-[13px] text-amber-soft">{streak}</span>
        </span>
    );
}

function HomeIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
            <path d="M9.5 21v-6h5v6" />
        </svg>
    );
}

function SunIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
    );
}
