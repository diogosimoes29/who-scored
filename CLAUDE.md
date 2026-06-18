# CLAUDE.md — Quem Marcou?

Memória de projeto para o Claude Code. Mantém-te curto e de alto sinal. Para detalhe, lê os
documentos referenciados em vez de duplicar aqui.

## O que é
Jogo web: mostra um jogo de Mundial que já aconteceu (equipas, data, resultado) e o jogador
tem de **adivinhar os marcadores**. Pesquisa um nome, carrega em *Adivinhar*, cada acerto revela
o golo (jogador + minuto). Âmbito atual: **só Mundiais (1930–2026)**.

- Especificação completa: **PRD-quem-marcou.md**
- Estilo + system design: **DESIGN.md** (segue-o sempre que mexes em UI ou estrutura)

## Stack
- Vite + React + **TypeScript** (strict)
- Tailwind CSS
- Fuse.js (autocomplete tolerante a erros)
- Sem backend: app 100% no cliente, alojável como site estático
- `localStorage` para sequência/estatísticas locais

## Comandos
```bash
npm run dev          # servidor de desenvolvimento
npm run build        # build de produção
npm run preview      # pré-visualizar o build
npm run build:data   # descarrega openfootball, filtra e gera src/data/*.json
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
```
> Corre `npm run build:data` antes do primeiro arranque (gera os dados).

## Estrutura
```
src/
  App.tsx            # máquina de estados: home → game → result
  types.ts           # Match, Goal, PlayerEntry, GameState
  data/              # matches.json + players.json (GERADOS) + teams.ts (mapa nome→EN/ISO) + player-aliases.ts
  lib/               # normalize.ts, search.ts (Fuse), scoring.ts
  hooks/             # useGame.ts, useMatchPool.ts
  components/        # HomeScreen, GameScreen, MatchHeader, ScorerSlot, PlayerSearch, ResultScreen
scripts/
  build-data.ts      # pipeline de dados (build-time)
```

## Regras de produto (decididas — não mudar sem confirmar)
- **Modo amigável:** tentativas ilimitadas; a pontuação penaliza palpites errados (sem vidas no MVP).
- **Seleção aleatória** de jogo (sem repetir na mesma sessão). Modo diário fica para fase 2.
- **Um "lugar" por golo** (o nº de lugares bate certo com o resultado), ordenados por minuto.
- **Minutos visíveis** desde o início (pista); nomes ocultos.
- **Validação tolerante:** aceitar apelido ("Messi") e tolerar acentos/erros pequenos.

## Dados
- Fonte: **openfootball/worldcup.json** (CC0, sem API key).
  Raw: `https://raw.githubusercontent.com/openfootball/worldcup.json/master/<ANO>/worldcup.json`
- O `build-data.ts` percorre 1930…2026, **filtra jogos com ≥1 golo e com marcadores**, e gera
  `matches.json` + `players.json` (dicionário de nomes com chave normalizada).
- **Não** fazer fetch ao GitHub em runtime — os dados vêm sempre dos JSON gerados.
- O dataset **não tem plantéis**; o autocomplete usa o dicionário de marcadores históricos. Não
  inventes dados de jogadores nem fontes.

## Regras de trabalho
- Corre `npm run typecheck` depois de cada alteração de código.
- Faz alterações **mínimas e focadas**; não refatores código não relacionado.
- Deriva cores/tipografia/espaçamento **de DESIGN.md** (não inventes tokens novos).
- TypeScript strict; sem `any` salvo justificação.
- Sem `localStorage`/`sessionStorage` em artefactos de demonstração; na app real, `localStorage` é ok.
- Quando houver dúvida entre duas abordagens, explica ambas e deixa-me escolher.
- UI em **inglês** (textos visíveis e dados, ex.: nomes de seleções em `teams.ts`).
  Comentários de código em português, como o resto do código.
