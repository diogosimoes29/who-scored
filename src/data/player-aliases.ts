// Mapa de canonicalização de nomes de marcadores.
//
// O openfootball regista o mesmo jogador sob várias formas (apelido isolado,
// nome completo, inicial, nome do meio). Aqui mapeamos a CHAVE NORMALIZADA de
// cada variante → label canónico (regra: primeiro + último nome).
//
// Usado por scripts/build-data.ts: cada golo cuja key esteja aqui passa a usar o
// label canónico (e a key derivada dele), fundindo as entradas no dicionário.
// Só entram as variantes a REDIRECIONAR — o label canónico não precisa de chave.
//
// Curado à mão (como teams-pt.ts). Quando o build avisar sobre uma variante nova,
// acrescenta-a aqui.

export const PLAYER_ALIASES: Record<string, string> = {
  // ── A) Mesmo jogador → nome completo (primeiro + último) ──────────────────
  aguero: "Sergio Agüero",
  alvarez: "Julián Álvarez",
  batshuayi: "Michy Batshuayi",
  cahill: "Tim Cahill",
  "e cavani": "Edinson Cavani",
  cheryshev: "Denis Cheryshev",
  cuadrado: "Juan Cuadrado",
  dzemaili: "Blerim Džemaili",
  dzyuba: "Artem Dzyuba",
  fernandez: "Enzo Fernández",
  griezmann: "Antoine Griezmann",
  "kai lukas havertz": "Kai Havertz",
  "e hazard": "Eden Hazard",
  honda: "Keisuke Honda",
  inui: "Takashi Inui",
  jedinak: "Mile Jedinak",
  kane: "Harry Kane",
  khazri: "Wahbi Khazri",
  kroos: "Toni Kroos",
  lukaku: "Romelu Lukaku",
  "r lukaku": "Romelu Lukaku",
  mandzukic: "Mario Mandžukić",
  mbappe: "Kylian Mbappé",
  mertens: "Dries Mertens",
  messi: "Lionel Messi",
  "y mina": "Yerry Mina",
  mitrovic: "Aleksandar Mitrović",
  "en nesyri": "Youssef En-Nesyri",
  perisic: "Ivan Perišić",
  pogba: "Paul Pogba",
  "j quintero": "Juan Quintero",
  rashford: "Marcus Rashford",
  rodriguez: "James Rodríguez",
  shaqiri: "Xherdan Shaqiri",
  "l suarez": "Luis Suárez",
  xhaka: "Granit Xhaka",

  // ── A2) Apelido isolado desambiguado por contexto (equipa/ano) ────────────
  ronaldo: "Cristiano Ronaldo", // "Ronaldo" = 2018 Portugal (não há R9 no dataset)
  costa: "Diego Costa", // "Costa" = 2018 Espanha
  musa: "Ahmed Musa", // "Musa" = 2014 Nigéria (Petar Musa fica à parte)
  "j hernandez": "Javier Hernández", // 2018 México (Chicharito)

  // ── B) Enriquecido com nome completo ──────────────────────────────────────
  coutinho: "Philippe Coutinho",
  "p coutinho": "Philippe Coutinho",

  // ── C) Sufixo "Jr" → primeiro + último (jogadores distintos) ──────────────
  "neymar jr": "Neymar",
  "vinicius jr": "Vinícius Júnior",

  // ── Apelidos de jogadores DISTINTOS, enriquecidos com o nome completo ──────
  // (resolve falsos positivos do aviso, dando nome próprio a cada um)
  andersson: "Sune Andersson", // 1950 Suécia (golo à Itália + penálti ao Brasil)
  "h andersson": "Harry Andersson", // 1938 Suécia vs Cuba (jogador distinto do Sune)
  brown: "James Brown", // 1930 EUA vs Argentina (distinto de Nathaniel Brown, 2026)
};
