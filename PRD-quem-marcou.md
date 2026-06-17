# PRD — "Quem Marcou?"

> Jogo web em que vês um jogo de Mundial que já aconteceu (equipas, data e resultado) e tens de adivinhar quem marcou os golos.

**Versão:** 0.1 (rascunho) · **Estado:** para discussão · **Âmbito MVP:** jogos de Campeonatos do Mundo (1930–2026)

---

## 1. Conceito

Mostra-se ao jogador um jogo real de um Mundial. Ele vê:

- As **equipas** (ex.: Argentina vs França)
- O **resultado** (ex.: 3–3, 4–2 g.p.)
- A **data** e contexto (ronda/grupo, estádio)

A partir daqui, e **sem ver os nomes dos marcadores**, tem de os adivinhar. Escreve um nome numa caixa de pesquisa, escolhe/confirma e carrega em **Adivinhar**. Cada acerto revela o golo (jogador + minuto). O jogo termina quando descobre todos os marcadores (ou usa as tentativas/vidas, conforme o modo).

É um quiz de cultura futebolística, rápido e rejogável, com potencial para modo diário partilhável (estilo Wordle).

### Nome
Proposta principal: **Quem Marcou?**
Alternativas: *Marcador*, *Golaço*, *Bola ao Centro*, *Onze*.

---

## 2. Objetivos e não-objetivos

**Objetivos (MVP)**
- Loop de jogo jogável de ponta a ponta: ecrã inicial → jogo → resultado.
- Dados reais de Mundiais com marcadores fiáveis.
- Pesquisa de jogadores com autocomplete e validação tolerante a acentos/erros.
- Funcionar 100% no cliente (sem backend), alojável como site estático.

**Não-objetivos (por agora)**
- Contas de utilizador / login.
- Multijogador em tempo real.
- Ligas de clubes, qualificações, outras competições (fica para depois).
- Dados ao vivo de jogos a decorrer.

---

## 3. Público-alvo
Adeptos de futebol, casuais a entusiastas, em desktop e mobile. UI em **Português de Portugal**.

---

## 4. Mecânica de jogo

### 4.1 Loop principal
1. Jogador carrega em **Jogar** → o sistema escolhe um jogo elegível (aleatório no MVP).
2. Mostra cabeçalho do jogo + **N "lugares" de marcador vazios** (um por golo).
3. Jogador pesquisa um nome, confirma e carrega **Adivinhar**.
   - **Acerto:** revela o golo correspondente (nome + minuto + equipa) num lugar.
   - **Erro:** conta como tentativa falhada (contador de erros / vida, conforme modo).
4. Termina quando todos os marcadores estiverem revelados (ou esgotadas as vidas, no modo difícil).
5. **Ecrã de resultado:** revela tudo, mostra pontuação e botões *Jogar outra vez* / *Partilhar*.

### 4.2 "Lugares" de marcador
Decisão proposta: **um lugar por golo** (não por jogador único), para o número de lugares bater certo com o resultado no marcador. Exemplo (Final 2022):

- Argentina (3): `[? 23']` `[? 36']` `[? 108']`
- França (3): `[? 80']` `[? 81']` `[? 118']`

Um jogador com *bis*/*hat-trick* ocupa vários lugares; ao acertar o nome, revela-se o golo (mais cedo) ainda por descobrir desse jogador. Para revelar todos os golos de um *hat-trick*, o jogador acerta o nome as vezes necessárias.

> Os minutos podem estar visíveis desde o início (como pistas) ou só serem revelados ao acertar. Proposta: minutos **visíveis** (ajudam e dão ritmo), nomes ocultos.

### 4.3 Pontuação e dificuldade
Proposta de modo por omissão (**amigável**): tentativas ilimitadas; objetivo é descobrir todos os marcadores; a pontuação penaliza erros (ex.: estrelas/percentagem em função dos palpites errados). Opção de *Desistir* revela tudo.

**Hard mode** (fase 2): número limitado de erros (vidas) por jogo.

**Pistas** (fase 2): revelar inicial do nome, ou a equipa do golo, em troca de pontos.

### 4.4 Casos especiais
- **Autogolos:** o dataset atribui o golo a quem o marcou; tratar como marcador normal e assinalar "(p.b.)" se identificável.
- **Penáltis:** o campo `penalty: true` permite marcar "(g.p.)" no golo revelado.
- **Desempate por penáltis (shootout):** não conta para os "lugares" de marcador (são golos do jogo, não da grande penalidade) — mostrar só no resultado (`4–2 g.p.`).
- **Jogos 0–0:** excluídos do conjunto jogável.

---

## 5. Dados (secção-chave)

### 5.1 Fonte recomendada para o MVP — openfootball/worldcup.json
Repositório de **domínio público (CC0)**, **sem API key** e sem limites práticos de utilização. Cobre **todas as edições de 1930 a 2026**, uma pasta por ano. Acede-se aos ficheiros "raw" do GitHub.

Exemplo de URL:
```
https://raw.githubusercontent.com/openfootball/worldcup.json/master/2022/worldcup.json
```

Estrutura de cada jogo (exemplo real — Final 2022):
```json
{
  "round": "Final",
  "date": "2022-12-18",
  "time": "18:00",
  "team1": "Argentina",
  "team2": "France",
  "score": { "p": [4, 2], "et": [3, 3], "ft": [2, 2], "ht": [2, 0] },
  "goals1": [
    { "name": "Lionel Messi",     "minute": "23",  "penalty": true },
    { "name": "Lionel Messi",     "minute": "108" },
    { "name": "Ángel Di María",   "minute": "36" }
  ],
  "goals2": [
    { "name": "Kylian Mbappé", "minute": "80",  "penalty": true },
    { "name": "Kylian Mbappé", "minute": "81" },
    { "name": "Kylian Mbappé", "minute": "118", "penalty": true }
  ],
  "ground": "Lusail Iconic Stadium, Lusail"
}
```

Campos relevantes: `team1`/`team2`, `date`, `round`/`group`, `ground`, `score` (`ft` tempo regulamentar, `ht` intervalo, `et` prolongamento, `p` penáltis), e `goals1`/`goals2` (`name`, `minute`, `penalty`).

### 5.2 Limitação importante (e como contornar)
O dataset **não traz plantéis/onzes** — só os **marcadores**. Isto afeta o autocomplete de pesquisa de jogadores:

- **Abordagem MVP:** construir um **dicionário global de nomes** = união de todos os marcadores do dataset (todos os `name` em `goals1`/`goals2`, de todas as edições). O autocomplete pesquisa esse dicionário; a validação compara o palpite com os marcadores **daquele jogo**.
- **Limitação:** a lista de sugestões só contém quem marcou *nalgum* Mundial (não revela quem marcou *neste* jogo, mas restringe o universo a "marcadores históricos"). Aceitável para MVP.
- **Evolução (remover a limitação):** obter onzes/plantéis para o autocomplete incluir também não-marcadores. Fontes: ficheiros de detalhe upstream do openfootball (line-ups, não atualizados ao vivo) ou uma API paga (ver 5.5).

### 5.3 Pipeline de dados (build-time)
Recomenda-se **não** depender do GitHub em runtime. Um script de build descarrega, limpa e empacota os dados:

1. `scripts/build-data.ts` percorre os anos 1930…2026 e descarrega cada `worldcup.json`.
2. **Filtra jogos jogáveis:** com `goals1`/`goals2` preenchidos e ≥1 golo.
3. Gera `src/data/matches.json` (jogos curados) e `src/data/players.json` (dicionário de nomes com chave normalizada).
4. (Opcional) etiqueta cada jogo com `era`/dificuldade e mapeia nomes de equipa → **PT-PT** e → código ISO (para bandeiras).
5. Corre no build/CI; dados ficam *bundled* na app.

> Nota: edições antigas (1930–1950) têm dados mais esparsos; o filtro "tem marcadores" naturalmente favorece 1990+, mas mantém muitos jogos clássicos antigos.

### 5.4 Normalização e validação de nomes
- Função `normalize(s)`: minúsculas + remover acentos (`"Mbappé" → "mbappe"`) + *trim* + colapsar espaços.
- **Pesquisa (autocomplete):** Fuse.js sobre o dicionário (tolerante a erros).
- **Validação do palpite:** comparar `normalize(palpite)` com os marcadores do jogo; aceitar correspondência exata ou *fuzzy* com limiar apertado (tolera acentos/erros pequenos, evita falsos positivos).
- **Apelido vs nome completo:** decidir se "Messi" é aceite tal como "Lionel Messi" (recomendado: aceitar apelido se identificar inequivocamente um marcador do jogo).
- **Equipas em PT:** o dataset usa nomes em inglês (`"South Korea"`); manter mapa `team → PT-PT` ("Coreia do Sul").

### 5.5 Alternativas (fases futuras / produção)
- **TheStatsAPI** — histórico de Mundiais 1930–2022 via REST (jogos, marcadores, top-scorers); sem tier gratuito permanente após trial.
- **Sportmonks** — cobertura forte (eventos, plantéis, xG), mas dados avançados/odds podem implicar add-ons e planos superiores.
- **football-data.org** — gratuito/simples para jogos e resultados; bom para protótipos, mas com limites diários e menos profundidade (não ideal para stats de jogador).
- **API-Football (api-sports.io)** — cobertura ampla, plano gratuito com limite diário.

Para o MVP, **openfootball** chega e sobra; as APIs pagas entram quando quisermos plantéis completos, escudos oficiais ou outras competições.

---

## 6. Tech stack

| Camada | Escolha | Notas |
|---|---|---|
| Build/dev | **Vite** | Arranque rápido, ótimo DX |
| UI | **React + TypeScript** | Componentes; TS para segurança de tipos dos dados |
| Estilos | **Tailwind CSS** | Conforme pedido |
| Estado | React hooks (+ Zustand se crescer) | Máquina de estados simples: home → jogo → resultado |
| Persistência | `localStorage` | Sequência (streak)/estatísticas locais |
| Pesquisa | **Fuse.js** | Autocomplete tolerante a erros |
| Dados | JSON empacotado (de openfootball, via script de build) | Sem backend no MVP |
| Bandeiras | Emoji (MVP) → `flag-icons`/assets ISO (depois) | Requer mapa equipa→ISO |
| Alojamento | Vercel / Netlify / Cloudflare Pages / GitHub Pages | Estático |
| Qualidade (opcional) | Vitest + Testing Library, ESLint, Prettier | |
| Analytics (opcional) | Plausible / Umami | Sem cookies |

Sem backend para o MVP. Se mais tarde quisermos modo diário com leaderboard global ou anti-batota, aí sim entra um pequeno backend/edge function.

---

## 7. Requisitos funcionais

- **RF-1** — Ecrã inicial com nome do jogo, descrição curta e botão **Jogar**.
- **RF-2** — Ao carregar em Jogar, abre o ecrã de jogo com um jogo elegível (aleatório, sem repetir na mesma sessão).
- **RF-3** — O ecrã de jogo mostra: equipas, data, ronda/grupo, estádio e resultado.
- **RF-4** — Mostra um lugar de marcador vazio por cada golo (com minuto visível, nome oculto).
- **RF-5** — Caixa de pesquisa de jogadores com autocomplete (Fuse.js) e botão **Adivinhar**.
- **RF-6** — Validação tolerante a acentos/erros; acerto revela o golo (nome + minuto + equipa).
- **RF-7** — Contador de progresso (X de N marcadores) e de tentativas falhadas.
- **RF-8** — Estado de fim de jogo + ecrã de resultado com revelação completa e pontuação.
- **RF-9** — Botões **Jogar outra vez** e **Partilhar** (resumo de texto/emoji).
- **RF-10** — Opção **Desistir / Revelar** durante o jogo.

## 8. Requisitos não-funcionais
- **Responsivo** (mobile-first) e acessível (foco visível por teclado, contraste, `prefers-reduced-motion`).
- **Rápido:** dados *bundled*, sem chamadas de rede no loop de jogo.
- **PT-PT** em toda a UI; preparado para i18n futuro.
- **Sem dados pessoais** (privacy-friendly).

---

## 9. Ecrãs

> Mockups visuais interativos no ficheiro HTML que acompanha este PRD.

### 9.1 Ecrã inicial
```
┌───────────────────────────────┐
│            QUEM MARCOU?        │  ← wordmark estilo placard
│                               │
│  Vês um jogo de Mundial — as  │
│  equipas, a data e o          │  ← descrição curta
│  resultado. Adivinha quem     │
│  marcou.                      │
│                               │
│         [  JOGAR  ]           │  ← botão primário
│                               │
│   Sequência: 3 · Melhor: 7    │  ← (opcional) stats locais
└───────────────────────────────┘
```

### 9.2 Ecrã de jogo
```
┌───────────────────────────────┐
│ 18 Dez 2022 · Final · Lusail  │  ← contexto
│                               │
│   🇦🇷 ARGENTINA   3–3   FRANÇA 🇫🇷│  ← placard (4–2 g.p.)
│                  4–2 g.p.      │
│                               │
│ MARCADORES                    │
│  AR  23'  ▢ ? ?               │  ← lugares vazios (minuto visível)
│  AR  36'  ▢ ? ?               │
│  AR 108'  ▢ ? ?               │
│  FR  80'  ▢ ? ?               │
│  FR  81'  ▢ ? ?               │
│  FR 118'  ▢ ? ?               │
│                               │
│ Erros: ●●○○○                  │  ← (modo difícil) ou "Palpites: 4"
│                               │
│ [ procurar jogador…        ]  │  ← input + autocomplete
│            [ ADIVINHAR ]      │
│                               │
│              Desistir         │
└───────────────────────────────┘
```

### 9.3 Ecrã de resultado
```
┌───────────────────────────────┐
│      6 de 6 marcadores ✓      │
│        Pontuação: ★★★         │
│                               │
│  🇦🇷 Messi 23'(gp), Messi 108',│  ← revelação completa
│     Di María 36'              │
│  🇫🇷 Mbappé 80'(gp), 81',     │
│     118'(gp)                  │
│                               │
│  [ Jogar outra vez ]  [ Partilhar ] │
└───────────────────────────────┘
```

---

## 10. Arquitetura / fluxo

```
[build] openfootball JSON ──script──▶ matches.json + players.json (bundled)
                                          │
[runtime] React app (estático)            ▼
   Home ──Jogar──▶ Jogo (escolhe match) ──fim──▶ Resultado ──▶ Home/Jogo
                     │  Fuse.js (players.json)
                     └─ valida palpite vs marcadores do match
```

Componentes sugeridos: `App` (máquina de estados), `HomeScreen`, `GameScreen` (`MatchHeader`, `ScorerSlot`, `PlayerSearch`, `Strikes`), `ResultScreen`. Lógica em hooks: `useGame()`, `useMatchPool()`, `usePlayerSearch()`.

---

## 11. Roadmap

- **Fase 0 — Dados:** script de build, `matches.json` + `players.json`, mapa equipa→PT + ISO.
- **Fase 1 — MVP:** 3 ecrãs, loop completo, modo amigável, aleatório, partilha em texto.
- **Fase 2 — Modo diário:** 1 jogo/dia determinístico por data, partilha estilo Wordle, streaks.
- **Fase 3 — Profundidade:** hard mode com vidas, pistas, escudos/bandeiras oficiais, filtros por edição/dificuldade.
- **Fase 4 — Plantéis completos:** integrar onzes (autocomplete melhor) via fonte adicional; possível backend para leaderboard.

---

## 12. Questões em aberto (a confirmar)

1. **Pontuação:** modo amigável (tentativas ilimitadas, penaliza erros) ou hard mode (vidas limitadas) já no MVP?
2. **Modo de seleção:** aleatório/infinito ou diário partilhável (estilo Wordle) como experiência principal?
3. **Lugares de marcador:** um por golo (bate certo com o resultado) ou um por jogador único?
4. **Validação:** aceitar apelido ("Messi") ou exigir nome do dataset? Tolerância a erros?
5. **Bandeiras/escudos:** emoji (rápido) ou assets ISO (mais bonito, exige mapa de nomes)?
6. **Minutos:** visíveis como pista desde o início, ou revelados só ao acertar?

---

## Anexo — exemplo de `players.json` (dicionário de pesquisa)
```json
[
  { "key": "lionel messi",   "label": "Lionel Messi" },
  { "key": "kylian mbappe",  "label": "Kylian Mbappé" },
  { "key": "angel di maria", "label": "Ángel Di María" }
]
```
`key` = nome normalizado (sem acentos, minúsculas) para pesquisa/validação; `label` = nome a mostrar.
