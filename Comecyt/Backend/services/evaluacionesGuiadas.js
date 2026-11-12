import { catalogo } from "./catalogo.js";
import { preguntasModulos } from "./preguntasModulos.js";
import { preguntasSeguridadDigital } from "./preguntasSeguridadDigital.js";

export const MINIMO_APROBACION = 80;
const bancos = { 7: preguntasSeguridadDigital, ...preguntasModulos };

const evaluaciones = new Map(catalogo.filter(modulo => bancos[modulo.id]).map(modulo => {
  const numero = modulo.lecciones.findIndex(leccion => leccion.evaluacion && leccion.puntajeMaximo) + 1;
  const { nombre, puntajeMaximo } = modulo.lecciones[numero - 1];
  const preguntas = bancos[modulo.id];
  const publicas = preguntas.map(([enunciado, opciones]) => ({ enunciado, opciones }));
  return [modulo.id, { moduloId: modulo.id, numero, nombre, puntajeMaximo, preguntas, publicas }];
}));

export const modulosEvaluadosEnServidor = [...evaluaciones.keys()];

export function evaluacionGuiada(moduloId) {
  return evaluaciones.get(moduloId);
}

export function modulosVistaPrevia(user) {
  const correo = process.env.MODULOS_VISTA_PREVIA_CORREO || process.env.MODULO_7_VISTA_PREVIA_CORREO;
  if (process.env.NODE_ENV === "production" || !correo || user?.correo !== correo ||
      (user.rol !== "alumno" && user.role !== "alumno")) return [];
  const ids = (process.env.MODULOS_VISTA_PREVIA_IDS || "7").split(",").map(Number);
  return catalogo.map(modulo => modulo.id).filter(id => ids.includes(id));
}

export function calificar(evaluacion, respuestas) {
  const { preguntas, puntajeMaximo } = evaluacion;
  if (!Array.isArray(respuestas) || respuestas.length !== preguntas.length ||
      !preguntas.every(([, opciones], indice) => Number.isInteger(respuestas[indice]) &&
        respuestas[indice] >= 0 && respuestas[indice] < opciones.length)) {
    return null;
  }
  const aciertos = preguntas.filter(([, , correcta], indice) => correcta === respuestas[indice]).length;
  return Math.round(aciertos * puntajeMaximo / preguntas.length);
}

export async function buscarEvaluacionGuiada(db, evaluacion) {
  const [[fila]] = await db.query(
    "SELECT evaluacion_id FROM EVALUACION WHERE modulo_id = ? AND titulo = ? AND puntaje = ?",
    [evaluacion.moduloId, evaluacion.nombre, evaluacion.puntajeMaximo]
  );
  return fila?.evaluacion_id;
}

export async function mejorPuntaje(db, alumnoId, evaluacionId) {
  const [[{ puntaje }]] = await db.query(
    "SELECT MAX(puntaje) AS puntaje FROM RESULTADO WHERE alumno_id = ? AND evaluacion_id = ?",
    [alumnoId, evaluacionId]
  );
  return puntaje === null ? null : Number(puntaje);
}
