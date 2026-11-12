import catalogo from "./catalogo.json";

export const MODULOS = catalogo.map(modulo => ({
  ...modulo,
  moduloId: modulo.id,
  nombre: modulo.titulo,
  inicio: 1,
  fin: modulo.lecciones.length,
  temas: modulo.lecciones.map((leccion, index) => ({ ...leccion, contenidoId: index + 1 }))
}));

export const TOTAL_CONTENIDOS = MODULOS.reduce((total, modulo) => total + modulo.fin, 0);
export const TOTAL_EXAMENES = MODULOS.filter(modulo => modulo.lecciones.some(leccion => leccion.evaluacion)).length;
