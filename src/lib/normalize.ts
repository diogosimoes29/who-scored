export function normalize(s: string): string {
  return s
    .normalize("NFD") 
    .replace(/[̀-ͯ]/g, "") 
    .toLowerCase()
    .replace(/['’`.]/g, "") 
    .replace(/-/g, " ") 
    .replace(/\s+/g, " ") 
    .trim();
}
