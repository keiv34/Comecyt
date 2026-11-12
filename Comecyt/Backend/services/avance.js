export function normalizarAvance(registros, guardado, total) {
  const lecciones = new Set(registros.filter(numero => Number.isInteger(numero) && numero > 0 && numero <= total));
  if (lecciones.size > 0) return lecciones;

  // Cuando faltan registros individuales, los valores mayores al total vienen del formato porcentual.
  const cantidad = guardado > total ? Math.round(Math.min(guardado, 100) * total / 100) : guardado;
  for (let numero = 1; numero <= cantidad; numero += 1) lecciones.add(numero);
  return lecciones;
}
