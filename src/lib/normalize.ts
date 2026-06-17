// Normalização de nomes (PRD 5.4): minúsculas + remover acentos + trim +
// colapsar espaços. Usada para a `key` dos golos, no dicionário de pesquisa e
// na validação de palpites. Função pura.

export function normalize(s: string): string {
  return s
    .normalize("NFD") // separa letra + diacrítico
    .replace(/[̀-ͯ]/g, "") // remove os diacríticos combinantes
    .toLowerCase()
    .replace(/['’`.]/g, "") // pontuação comum em nomes (O'Neill, M'Bappe…)
    .replace(/-/g, " ") // hífenes → espaço
    .replace(/\s+/g, " ") // colapsa espaços
    .trim();
}
