// Placeholder do Passo 1 — verifica tokens e fontes. Substituído pela máquina
// de estados (home → playing → result) no Passo 5.
export default function App() {
  return (
    <main className="min-h-dvh bg-bg text-chalk flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="font-display font-bold uppercase tracking-[0.12em] text-[54px] leading-none scoreboard-glow">
        Quem Marcou?
      </h1>
      <div className="scanlines rounded-placard border border-line bg-bg2 px-8 py-5">
        <p className="font-mono text-4xl scoreboard-glow">3–3</p>
      </div>
      <p className="font-body text-[15px] text-muted max-w-xs text-center">
        Scaffold pronto. Tokens, fontes e Tailwind ligados.
      </p>
    </main>
  );
}
