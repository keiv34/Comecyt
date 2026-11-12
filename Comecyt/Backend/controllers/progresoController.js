import { pool } from "../config/database.js";
import { normalizarAvance } from "../services/avance.js";
import { idEnConflicto } from "../services/catalogo.js";
import { MINIMO_APROBACION, evaluacionGuiada, buscarEvaluacionGuiada, mejorPuntaje, modulosVistaPrevia } from "../services/evaluacionesGuiadas.js";

const MENSAJE_CONFLICTO = "El catálogo de MySQL requiere revisión antes de continuar.";

function calcularPorcentaje(completados, total) {
  return total > 0 ? Math.round(completados * 100 / total) : 0;
}

export async function consultarProgreso(req, res) {
  const { correo } = req.user;
  if (!correo) return res.status(403).json({ error: "La sesión no tiene correo" });

  const [catalogo] = await pool.query(`
    SELECT m.modulo_id, m.titulo, m.descripcion, m.total_contenidos,
           COALESCE(p.progreso_actual, 0) AS progreso_guardado
    FROM MODULO m
    LEFT JOIN progreso_modulos p ON p.modulo_id = m.modulo_id AND p.correo = ?
    ORDER BY m.modulo_id
  `, [correo]);
  if (catalogo.some(modulo => idEnConflicto(modulo.modulo_id, modulo.titulo))) {
    return res.status(409).json({ error: MENSAJE_CONFLICTO });
  }
  const [registros] = await pool.query(
    "SELECT modulo_id, contenido_id FROM contenidos_completados WHERE correo = ?", [correo]
  );

  const contenidosCompletados = [];
  const modulos = catalogo.map(({ progreso_guardado, ...modulo }) => {
    const lecciones = normalizarAvance(
      registros.filter(registro => registro.modulo_id === modulo.modulo_id).map(registro => registro.contenido_id),
      progreso_guardado,
      modulo.total_contenidos
    );
    for (const contenido_id of lecciones) {
      contenidosCompletados.push({ modulo_id: modulo.modulo_id, contenido_id });
    }
    const progreso_actual = lecciones.size;
    let siguiente_numero = 1;
    while (lecciones.has(siguiente_numero)) siguiente_numero += 1;
    return {
      ...modulo,
      progreso_actual,
      porcentaje: calcularPorcentaje(progreso_actual, modulo.total_contenidos),
      siguiente_numero: siguiente_numero <= modulo.total_contenidos ? siguiente_numero : null
    };
  });

  const total = modulos.reduce((suma, modulo) => suma + modulo.total_contenidos, 0);
  const estadisticas = {
    modulos_completados: modulos.filter(modulo => modulo.porcentaje === 100).length,
    total_modulos: modulos.length,
    contenidos_completados: contenidosCompletados.length,
    total_contenidos: total,
    porcentaje_general: calcularPorcentaje(contenidosCompletados.length, total)
  };
  return res.json({ modulos, contenidosCompletados, estadisticas, modulos_vista_previa: modulosVistaPrevia(req.user) });
}

async function cargarAvance(db, correo, moduloId, total) {
  const [registros] = await db.query(
    "SELECT contenido_id FROM contenidos_completados WHERE correo = ? AND modulo_id = ?", [correo, moduloId]
  );
  const [[avance]] = await db.query(
    "SELECT progreso_actual FROM progreso_modulos WHERE correo = ? AND modulo_id = ?", [correo, moduloId]
  );
  return normalizarAvance(registros.map(registro => registro.contenido_id), avance?.progreso_actual ?? 0, total);
}

export async function obtenerLeccion(req, res) {
  const { correo } = req.user;
  if (!correo) return res.status(403).json({ error: "La sesión no tiene correo" });

  const [[leccion]] = await pool.query(`
    SELECT c.*, m.total_contenidos, m.titulo AS titulo_modulo
    FROM CONTENIDO c JOIN MODULO m ON m.modulo_id = c.modulo_id
    WHERE c.modulo_id = ? AND c.numero = ?
  `, [req.params.modulo_id, req.params.numero]);
  if (!leccion) return res.status(404).json({ error: "Lección no encontrada" });
  if (idEnConflicto(leccion.modulo_id, leccion.titulo_modulo)) {
    return res.status(409).json({ error: MENSAJE_CONFLICTO });
  }

  const vista_previa = modulosVistaPrevia(req.user).includes(leccion.modulo_id);
  if (!vista_previa && leccion.numero > 1) {
    const completadas = await cargarAvance(pool, correo, leccion.modulo_id, leccion.total_contenidos);
    if (!completadas.has(leccion.numero) && !completadas.has(leccion.numero - 1)) {
      return res.status(403).json({ error: "Completa la lección anterior primero" });
    }
  }
  return res.json({ ...leccion, vista_previa });
}

export async function guardarAvance(req, res) {
  const { correo } = req.user;
  if (!correo) return res.status(403).json({ error: "La sesión no tiene correo" });

  const moduloId = Number(req.body.modulo_id);
  // Las lecciones anteriores al catálogo enviaban su número como progreso_actual.
  const numero = Number(req.body.contenido_id ?? req.body.progreso_actual);
  if (!Number.isSafeInteger(moduloId) || moduloId < 1 || !Number.isSafeInteger(numero) || numero < 1) {
    return res.status(400).json({ error: "Indica un módulo y número de lección válidos" });
  }

  const db = await pool.getConnection();
  try {
    await db.beginTransaction();
    const [[alumno]] = await db.query("SELECT alumno_id FROM ALUMNO WHERE correo = ? FOR UPDATE", [correo]);
    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });

    const [[modulo]] = await db.query("SELECT titulo, total_contenidos FROM MODULO WHERE modulo_id = ?", [moduloId]);
    const [[leccion]] = await db.query(
      "SELECT numero FROM CONTENIDO WHERE modulo_id = ? AND numero = ?", [moduloId, numero]
    );
    if (!modulo || !leccion || numero > modulo.total_contenidos) {
      return res.status(404).json({ error: "Lección no encontrada" });
    }

    if (idEnConflicto(moduloId, modulo.titulo)) {
      return res.status(409).json({ error: MENSAJE_CONFLICTO });
    }

    const completadas = await cargarAvance(db, correo, moduloId, modulo.total_contenidos);
    if (modulosVistaPrevia(req.user).includes(moduloId)) {
      return res.json({
        success: true,
        progreso_actual: completadas.size,
        progreso: completadas.size,
        porcentaje: calcularPorcentaje(completadas.size, modulo.total_contenidos)
      });
    }
    if (numero > 1 && !completadas.has(numero) && !completadas.has(numero - 1)) {
      return res.status(403).json({ error: "Completa la lección anterior primero" });
    }

    const examen = evaluacionGuiada(moduloId);
    if (examen?.numero === numero) {
      const evaluacionId = await buscarEvaluacionGuiada(db, examen);
      const puntaje = evaluacionId ? await mejorPuntaje(db, alumno.alumno_id, evaluacionId) : null;
      if (puntaje === null || puntaje < MINIMO_APROBACION) {
        return res.status(403).json({ error: "Aprueba la evaluación final primero." });
      }
    }

    completadas.add(numero);
    await db.query(`
      INSERT INTO contenidos_completados (correo, modulo_id, contenido_id)
      VALUES ?
      ON DUPLICATE KEY UPDATE fecha_completado = contenidos_completados.fecha_completado
    `, [[...completadas].map(contenido => [correo, moduloId, contenido])]);

    const progreso = completadas.size;
    await db.query(`
      INSERT INTO progreso_modulos (correo, modulo_id, progreso_actual)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE progreso_actual = ?
    `, [correo, moduloId, progreso, progreso]);

    await db.commit();
    return res.json({
      success: true,
      progreso_actual: progreso,
      progreso,
      porcentaje: calcularPorcentaje(progreso, modulo.total_contenidos)
    });
  } finally {
    try {
      await db.rollback();
    } finally {
      db.release();
    }
  }
}
