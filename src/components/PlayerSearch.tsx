// Pesquisa de jogador com autocomplete (DESIGN.md): dropdown ACIMA do campo
// (mobile-friendly), foco com anel âmbar, Enter submete. Botão "Adivinhar".

import { useId, useRef, useState } from "react";
import type { PlayerSearch as SearchFn } from "../lib/search";

type Props = {
  search: SearchFn;
  onGuess: (value: string) => void;
  disabled?: boolean;
};

export function PlayerSearch({ search, onGuess, disabled }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const suggestions = open ? search(query) : [];

  function submit(value: string) {
    const v = value.trim();
    if (!v || disabled) return;
    onGuess(v);
    setQuery("");
    setOpen(false);
    setActive(-1);
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") {
      // dropdown acima: ↑ aproxima do campo (fim da lista → topo visual)
      e.preventDefault();
      setActive((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit(active >= 0 && suggestions[active] ? suggestions[active]!.label : query);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div className="relative">
      {/* Dropdown ACIMA do campo */}
      {suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute bottom-full mb-2 max-h-56 w-full overflow-auto rounded-xl border border-line bg-panel2 py-1 shadow-lg"
        >
          {/* invertido: primeiro resultado fica junto ao campo */}
          {suggestions
            .map((s, i) => ({ s, i }))
            .reverse()
            .map(({ s, i }) => (
              <li key={s.key} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  // onMouseDown evita perder o foco antes do clique
                  onMouseDown={(e) => {
                    e.preventDefault();
                    submit(s.label);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`block w-full px-3 py-2 text-left font-body text-[15px] ${
                    i === active ? "bg-panel text-chalk" : "text-chalk/90"
                  }`}
                >
                  {s.label}
                </button>
              </li>
            ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          value={query}
          aria-label="Procurar jogador"
          aria-autocomplete="list"
          aria-controls={listId}
          placeholder="Procurar jogador…"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 rounded-xl border border-line bg-panel px-4 py-3 font-body text-[15px] text-chalk placeholder:text-muted focus:border-amber focus:outline-none disabled:opacity-50"
        />
        <button
          type="button"
          disabled={disabled || !query.trim()}
          onClick={() => submit(query)}
          className="shrink-0 rounded-xl bg-amber px-5 py-3 font-display font-semibold uppercase tracking-[0.1em] text-[14px] text-bg shadow-cta transition-opacity disabled:opacity-40 disabled:shadow-none"
        >
          Adivinhar
        </button>
      </div>
    </div>
  );
}
