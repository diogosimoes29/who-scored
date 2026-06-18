import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const KEY = "quem-marcou:theme";

function load(): Theme {
    try {
        const v = localStorage.getItem(KEY);
        if (v === "light" || v === "dark") return v;
    } catch {
        console.warn("Loading unavailable"); 
    }
    return "dark";
}

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(load);

    useEffect(() => {
        document.documentElement.classList.toggle("light", theme === "light");
        try {
            localStorage.setItem(KEY, theme);
        } catch {
            console.warn("Theme ignored");
        }
    }, [theme]);

    const toggle = useCallback(
        () => setTheme((t) => (t === "dark" ? "light" : "dark")),
        []
    );

    return { theme, toggle };
}
