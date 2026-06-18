import { useEffect, useRef, useState } from "react";

export function WrongGuesses({ guesses }: { guesses: string[] }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: PointerEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    if (guesses.length === 0) return null;

    const recent = guesses.slice(-3).reverse();
    const hidden = guesses.slice(0, -3);

    return (
        <div ref={ref} className="relative flex flex-wrap items-center gap-1.5">
            <span className="text-red">{recent.join(", ")}</span>

            {hidden.length > 0 && (
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-label={`Show ${hidden.length} more wrong guesses`}
                    className="shrink-0 rounded-md border border-line bg-panel px-1.5 py-0.5 text-[11px] text-muted hover:border-amber hover:text-chalk"
                >
                    +{hidden.length}
                </button>
            )}

            {open && hidden.length > 0 && (
                <div
                    role="tooltip"
                    className="absolute bottom-full left-0 z-10 mb-1.5 max-w-[18rem] rounded-lg border border-line bg-panel2 px-3 py-2 text-[12px] leading-relaxed text-red shadow-lg"
                >
                    {hidden.join(", ")}
                </div>
            )}
        </div>
    );
}
