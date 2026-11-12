import { pool } from "../config/database.js";
import { verifyAlumno } from "../middleware/auth.js";
import { idEnConflicto } from "../services/catalogo.js";
import {
  MINIMO_APROBACION, evaluacionGuiada, buscarEvaluacionGuiada, calificar, mejorPuntaje, modulosVistaPrevia
} from "../services/evaluacionesGuiadas.js";

async function obtenerContexto(req, res, next) {
  const evaluacion = evaluacionGuiada(Number(req.params.modulo_id));
  if (!evaluacion) return res.status(404).json({ error: "Evaluación no encontrada." });

  const [[modulo]] = await pool.query("SELECT titulo FROM MODULO WHERE modulo_id = ?", [evaluacion.moduloId]);
  if (!modulo || idEnConflicto(evaluacion.moduloId, modulo.titulo)) {
    return res.status(409).json({ error: "El catálogo de MySQL requiere revisión antes de continuar." });
  }

  const [[alumno]] = await pool.query("SELECT alumno_id FROM ALUMNO WHERE correo = ?", [req.user.correo]);
  if (!alumno) return res.status(404).json({ error: "Alumno no encontrado." });

  const vistaPrevia = modulosVistaPrevia(req.user).includes(evaluacion.moduloId);
  if (!vistaPrevia) {
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) AS total FROM contenidos_completados WHERE correo = ? AND modulo_id = ? AND contenido_id BETWEEN 1 AND ?",
      [req.user.correo, evaluacion.moduloId, evaluacion.numero - 1]
    );
    if (Number(total) !== evaluacion.numero - 1) {
      return res.status(403).json({ error: "Completa las lecciones antes de presentar la evaluación." });
    }
  }

  const evaluacionId = await buscarEvaluacionGuiada(pool, evaluacion);
  if (!evaluacionId) return res.status(503).json({ error: "La evaluación aún no está disponible." });
  req.evaluacionGuiada = { alumnoId: alumno.alumno_id, evaluacionId, evaluacion, vistaPrevia };
  next();
}

async function obtenerPreguntas(req, res) {
  const { alumnoId, evaluacionId, evaluacion, vistaPrevia } = req.evaluacionGuiada;
  const puntaje = vistaPrevia ? null : await mejorPuntaje(pool, alumnoId, evaluacionId);
  return res.json({ preguntas: evaluacion.publicas, minimo: MINIMO_APROBACION, puntaje, aprobado: puntaje >= MINIMO_APROBACION });
}

async function guardarIntento(req, res) {
  const { alumnoId, evaluacionId, evaluacion, vistaPrevia } = req.evaluacionGuiada;
  const puntaje = calificar(evaluacion, req.body?.respuestas);
  if (puntaje === null) return res.status(400).json({ error: "Selecciona una opción válida en cada pregunta." });

  if (!vistaPrevia) {
    await pool.query(
      "INSERT INTO RESULTADO (evaluacion_id, alumno_id, puntaje) VALUES (?, ?, ?)",
      [evaluacionId, alumnoId, puntaje]
    );
  }
  return res.json({ puntaje, aprobado: puntaje >= MINIMO_APROBACION });
}

export const consultarEvaluacionGuiada = [verifyAlumno, obtenerContexto, obtenerPreguntas];
export const enviarEvaluacionGuiada = [verifyAlumno, obtenerContexto, guardarIntento];
