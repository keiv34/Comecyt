import { readFileSync } from "node:fs";

export const catalogo = JSON.parse(readFileSync(new URL(
  "../../RedesSociales/Comecyt/RedesSociales/src/curso/catalogo.json",
  import.meta.url
), "utf8"));

const alias = new Map([
  [1, /^correo( electronico)?$/],
  [2, /^facebook( (y )?marketplace)?$/],
  [3, /^whatsapp( (y )?whatsapp business| business)?$/],
  [4, /^instagram$/],
  [5, /^(retos( educaplay| finales( educaplay)?)?|educaplay)$/],
  [6, /^cobros digitales( y finanzas)?$/]
]);

function normalizarTitulo(titulo) {
  return titulo.normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function coincideTitulo(modulo, titulo) {
  const candidato = normalizarTitulo(titulo);
  return candidato === normalizarTitulo(modulo.titulo) || Boolean(alias.get(modulo.id)?.test(candidato));
}

export function idEnConflicto(id, titulo) {
  const modulo = catalogo.find(item => item.id === id);
  return modulo ? !coincideTitulo(modulo, titulo) : false;
}
