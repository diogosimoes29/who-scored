# DESIGN.md — Quem Marcou?

Guia de estilo visual **e** de system design. O Claude Code deve seguir este documento sempre que
cria ou altera UI ou estrutura da aplicação. Os tokens aqui são a fonte de verdade.

---

## Parte 1 — Identidade visual

### Conceito
**Placard de estádio à noite.** Âmbar fosforescente sobre um verde-noite de relvado iluminado por
holofotes. O resultado é o herói da página (grande, com brilho, estilo marcador eletrónico). Os
marcadores por descobrir são "cromos" vazios à espera de serem preenchidos. Tom nostálgico que liga
1930 a 2026 sem ser retro-clichê.

**Elemento-assinatura:** o resultado em mono com brilho âmbar e textura de *scanlines* (placard).
Toda a boldness vive aí; o resto é escuro, calmo e disciplinado.

### Tokens de cor
| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#081310` | fundo base (noite de relvado) |
| `--bg2` | `#0b201a` | fundo de cartão/telefone |
| `--panel` | `#0f2620` | painéis, slots, inputs |
| `--panel2` | `#123029` | painel elevado (dropdown) |
| `--line` | `#1d4338` | bordas/divisórias |
| `--amber` | `#ffb000` | **acento principal** (placard, CTA) |
| `--amber-soft` | `#ffd27a` | minutos, detalhes |
| `--lime` | `#3ddc84` | acerto/sucesso |
| `--red` | `#ff5b5b` | erro |
| `--chalk` | `#eaf0ec` | texto principal |
| `--muted` | `#7e978b` | texto secundário/labels |

Usar **sempre** via variáveis CSS / tema do Tailwind — nunca hex soltos nos componentes.

### Tipografia (Google Fonts)
- **Oswald** — display/condensada, **MAIÚSCULAS** com tracking largo: wordmark, nomes de equipa,
  labels, botões.
- **JetBrains Mono** — dados de placard: resultado, minutos, contadores, partilha.
- **Inter** — corpo de texto (descrições, mensagens).

Escala: wordmark ~54px / títulos 24–30px / nomes 14–16px / corpo 15px / labels 10–11px (tracking `.2em`).

### Componentes-chave
- **CTA primário** (`Jogar`, `Adivinhar`): fundo âmbar, texto escuro, glow `0 0 28px rgba(255,176,0,.35)`.
- **Placard:** gradiente escuro, borda `--line`, `border-radius:16px`, *scanlines* subtis por cima,
  resultado em mono âmbar com `text-shadow` de brilho. Grelha `1fr auto 1fr` (equipa / resultado / equipa).
- **Slot de marcador:** linha com etiqueta de equipa (AR/FR), minuto (âmbar-soft) e nome oculto
  (`? ? ?`). Ao revelar: borda `--lime`, nome a verde, etiqueta de penálti `(g.p.)` quando aplicável.
- **Pesquisa:** input com dropdown de autocomplete **acima** do campo (mobile-friendly), foco com
  anel âmbar. Toast curto e mono para feedback ("Certo!" / "Não foi esse").

### Quality floor (obrigatório)
- Mobile-first; alvo ~380–420px de largura, sobe bem para desktop.
- Foco de teclado visível; `Enter` submete o palpite.
- Respeitar `prefers-reduced-motion` (sem brilhos animados se desativado).
- Contraste suficiente do texto sobre fundos escuros.

### Cópia (microtexto)
- PT-PT, voz ativa, frase no caso normal. O botão mantém o nome em toda a ação.
- Erros dão direção, não desculpas. Ecrã vazio é um convite a agir.
- Exemplos: CTA "Jogar"; campo "Procurar jogador…"; progresso "3 de 6"; resultado "6 de 6 marcadores".

> O ficheiro `mockups-quem-marcou.html` é a referência visual viva destes tokens e componentes.

---

## Parte 2 — System design

### Princípios
- **Sem backend no MVP.** Tudo no cliente; dados empacotados no bundle.
- **Dados imutáveis em runtime**: lidos dos JSON gerados em build-time; nunca fetch ao GitHub em runtime.
- **Estado simples e explícito**: uma máquina de estados de ecrãs + um hook de jogo.

### Máquina de estados (App.tsx)
```
home ──Jogar──▶ playing ──todos revelados / desistir──▶ result ──▶ home | playing
```

### Modelo de dados (types.ts)
```ts
type Goal = {
  team: 1 | 2;          // 1 = team1, 2 = team2
  name: string;         // nome do marcador (label)
  key: string;          // nome normalizado (sem acentos, minúsculas)
  minute: string;       // "23", "90+9", "108"
  penalty?: boolean;
  ownGoal?: boolean;
};

type Match = {
  id: string;           // ex.: "2022-final-arg-fra"
  year: number;
  date: string;         // ISO
  round: string;        // "Final", "Matchday 1"…
  group?: string;
  ground: string;
  team1: string; team2: string;          // nomes em PT (via teams-pt.ts)
  iso1?: string; iso2?: string;          // código p/ bandeira
  score: { ft:[number,number]; ht?:[number,number]; et?:[number,number]; p?:[number,number] };
  goals: Goal[];        // já ordenados por minuto; "lugares" = goals.length
};

type PlayerEntry = { key: string; label: string };  // dicionário de pesquisa

type GameState = {
  match: Match;
  revealed: boolean[];  // por golo
  wrongGuesses: number;
  status: "playing" | "won" | "revealed";
};
```

### Pipeline de dados (scripts/build-data.ts)
1. Para cada ano 1930…2026: fetch do `worldcup.json` (raw GitHub).
2. Mapear cada `match` para o tipo `Match`; achatar `goals1`/`goals2` em `goals[]` com `team` e `key`.
3. **Filtrar** jogos sem golos ou sem dados de marcador.
4. Mapear `team1`/`team2` para PT-PT + ISO via `teams-pt.ts`.
5. Escrever `src/data/matches.json` e `src/data/players.json` (união de marcadores, deduplicada por `key`).

### Lógica de jogo
- **Seleção (useMatchPool):** escolhe um `Match` aleatório do pool, evitando repetições na sessão.
- **Validação (useGame):** ao submeter, `normalize(palpite)` é comparado com os `key` dos golos ainda
  por revelar. Correspondência exata > *fuzzy* com limiar apertado. Aceitar apelido se identificar
  inequivocamente um marcador do jogo. Acerto → revela o golo mais cedo desse jogador; erro →
  `wrongGuesses++`.
- **Fim:** todos revelados (`won`) ou *Desistir* (`revealed`) → ecrã de resultado.
- **Pontuação (scoring.ts):** função pura de `(nº marcadores, wrongGuesses)` → estrelas/percentagem.

### Acessibilidade & qualidade
- Componentes pequenos e de responsabilidade única (ver lista no CLAUDE.md).
- `typecheck` limpo; sem efeitos colaterais escondidos em componentes de apresentação.
- Texto de partilha gerado em `lib/` (puro), não na UI.
