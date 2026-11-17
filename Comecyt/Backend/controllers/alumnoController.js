import { pool } from "../config/database.js";
import { modulosEvaluadosEnServidor, modulosVistaPrevia } from "../services/evaluacionesGuiadas.js";
import bcrypt from "bcryptjs";
import { MINIMO_EVALUACION_CLASICA } from "../services/acreditacion.js";

// ===== CONSTANTES =====

// ✅ TOTALES REALES - IGUALES A Inicio.jsx

// ===== REGISTRO - CON DEBUG COMPLETO =====
export const registrarAlumno = async (req, res) => {
  const { nombre, apellido, correo, contraseña } = req.body;
  console.log(`\n🚀 [REGISTRO] INICIO para: ${correo}`);

  if (!nombre || !apellido || !correo || !contraseña) {
    console.error(`❌ [REGISTRO] Faltan datos: nombre=${nombre}, apellido=${apellido}, correo=${correo}`);
    return res.status(400).json({
      error: "Faltan datos requeridos",
      detalle: "nombre, apellido, correo y contraseña son obligatorios"
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    console.error(`❌ [REGISTRO] Correo inválido: ${correo}`);
    return res.status(400).json({ error: "Formato de correo inválido" });
  }

  if (contraseña.length < 6) {
    console.error(`❌ [REGISTRO] Contraseña muy corta para: ${correo}`);
    return res.status(400).json({ error: "La contraseña debe tener mínimo 6 caracteres" });
  }

  try {
    const hashed = await bcrypt.hash(contraseña, 10);

    const [result] = await pool.query(
      "INSERT INTO ALUMNO (nombre, apellido, correo, contraseña) VALUES (?,?,?,?)",
      [nombre.trim(), apellido.trim(), correo.toLowerCase().trim(), hashed]
    );

    const alumno_id = result.insertId;
    console.log(`✅ [REGISTRO] Alumno creado: ID=${alumno_id}, correo=${correo}`);

    // ✅ CREA PROGRESO INICIAL PARA TODOS LOS MÓDULOS EN 0
    const [modulos] = await pool.query("SELECT modulo_id, titulo FROM MODULO ORDER BY modulo_id ASC");
    console.log(`🔍 [REGISTRO] Módulos encontrados: ${modulos.length}`, modulos);

    if (modulos.length === 0) {
      console.warn(`⚠ [REGISTRO] No hay módulos en la BD para asignar a ${correo}`);
    } else {
      const valoresProgreso = modulos.map(mod => [correo.toLowerCase().trim(), mod.modulo_id, 0]);
      console.log(`🔍 [REGISTRO] Intentando insertar:`, valoresProgreso);

      try {
        const [insertResult] = await pool.query(
          "INSERT INTO progreso_modulos (correo, modulo_id, progreso_actual) VALUES?",
          [valoresProgreso]
        );
        console.log(`✅ [REGISTRO] SUCCESS: Insertados ${insertResult.affectedRows} registros de progreso para ${correo}`);
      } catch (insertErr) {
        console.error(`💥 [REGISTRO] ERROR EN INSERT progreso_modulos:`, insertErr);
        console.error(`💥 Código: ${insertErr.code}, Mensaje: ${insertErr.message}`);
      }
    }

    res.status(201).json({
      mensaje: "Alumno registrado correctamente",
      alumno_id,
      nombre,
      apellido,
      correo,
      modulos_creados: modulos.length,
      rol: "alumno"
    });

  } catch (err) {
    console.error("💥 ERROR COMPLETO AL REGISTRAR:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        error: "El correo ya está registrado",
        detalle: `Ya existe una cuenta con ${correo}`
      });
    }
    res.status(500).json({
      error: "Error interno del servidor",
      detalle: err.message
    });
  }
};

export const obtenerDatosAlumno = async (req, res) => {
  try {
    const { correo } = req.body;
    const [rows] = await pool.query("SELECT alumno_id, nombre, apellido, correo FROM ALUMNO WHERE correo =?", [correo]);
    if (!rows.length) return res.status(404).json({ error: "Alumno no encontrado" });
    res.json({ alumno: rows[0] });
  } catch (err) {
    console.error("❌ Error al obtener datos:", err);
    res.status(500).json({ error: "Error al obtener datos" });
  }
};

export const actualizarDatosAlumno = async (req, res) => {
  try {
    const { alumno_id, nombre, apellido } = req.body;
    await pool.query("UPDATE ALUMNO SET nombre =?, apellido =? WHERE alumno_id =?", [nombre, apellido, alumno_id]);
    res.status(200).json({ mensaje: "Perfil actualizado correctamente" });
  } catch (err) {
    console.error("❌ Error al actualizar:", err);
    res.status(500).json({ error: "Error al actualizar" });
  }
};

export const cambiarPasswordAlumno = async (req, res) => {
  try {
    const { alumno_id, nueva_contrasena } = req.body;
    if (!nueva_contrasena || nueva_contrasena.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener mínimo 6 caracteres" });
    }
    const hashed = await bcrypt.hash(nueva_contrasena, 10);
    await pool.query("UPDATE ALUMNO SET contraseña =? WHERE alumno_id =?", [hashed, alumno_id]);
    res.json({ mensaje: "Contraseña actualizada" });
  } catch (err) {
    console.error("❌ Error password:", err);
    res.status(500).json({ error: "Error password" });
  }
};

// ===== CERTIFICADOS =====
export const obtenerCertificadosAlumno = async (req, res) => {
  try {
    const { correo } = req.user;
    const [rows] = await pool.query(`
      SELECT c.certificado_id, m.titulo AS titulo_modulo, m.modulo_id, c.fecha_emision
      FROM CERTIFICADO c
      JOIN ALUMNO a ON c.alumno_id = a.alumno_id
      JOIN MODULO m ON c.modulo_id = m.modulo_id
      WHERE a.correo =?
      ORDER BY c.fecha_emision DESC
    `, [correo]);
    res.json({ certificados: rows });
  } catch (err) {
    console.error("❌ Error cert:", err);
    res.status(500).json({ error: "Error al obtener certificados" });
  }
};

// ===== EVALUACIÓN =====
export const obtenerIntentosEvaluacion = async (req, res) => {
  try {
    const { correo } = req.user;
    const { evaluacion_id } = req.body;
    const [alumno] = await pool.query("SELECT alumno_id FROM ALUMNO WHERE correo =?", [correo]);
    if (!alumno.length) return res.status(404).json({ error: "Alumno no encontrado" });

    const [rows] = await pool.query(
      "SELECT puntaje FROM RESULTADO WHERE alumno_id =? AND evaluacion_id =?",
      [alumno[0].alumno_id, evaluacion_id]
    );

    const intentos = rows.length;
    const max_puntaje = rows.length > 0 ? Math.max(...rows.map(r => r.puntaje)) : 0;
    const [[evaluacion]] = await pool.query(
      "SELECT puntaje, modulo_id FROM EVALUACION WHERE evaluacion_id = ? AND modulo_id NOT IN (?)", [evaluacion_id, modulosEvaluadosEnServidor]
    );
    if (!evaluacion) return res.status(404).json({ error: "Evaluación no encontrada" });
    const aprobado = max_puntaje * 100 / evaluacion.puntaje >= MINIMO_EVALUACION_CLASICA;

    res.json({ intentos, max_puntaje, aprobado });
  } catch (err) {
    console.error("❌ Error intentos:", err);
    res.status(500).json({ error: "Error al obtener intentos" });
  }
};

export const guardarResultadoEvaluacion = async (req, res) => {
  const { correo } = req.user;
  const { evaluacion_id, puntaje } = req.body;
  console.log(`📥 [EVAL] Guardando: correo=${correo}, eval=${evaluacion_id}, puntaje=${puntaje}`);

  try {
    const [alumno] = await pool.query("SELECT alumno_id FROM ALUMNO WHERE correo =?", [correo]);
    if (!alumno.length) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const alumno_id = alumno[0].alumno_id;
    const [[evaluacion]] = await pool.query(
      "SELECT puntaje, modulo_id FROM EVALUACION WHERE evaluacion_id = ? AND modulo_id NOT IN (?)", [evaluacion_id, modulosEvaluadosEnServidor]
    );
    if (!evaluacion) return res.status(404).json({ error: "Evaluación no encontrada" });
    if (!Number.isInteger(puntaje) || puntaje < 0 || puntaje > evaluacion.puntaje) {
      return res.status(400).json({ error: "Puntaje fuera de rango" });
    }
    const aprobado = puntaje * 100 / evaluacion.puntaje >= MINIMO_EVALUACION_CLASICA;
    if (modulosVistaPrevia(req).includes(evaluacion.modulo_id)) {
      return res.json({ mensaje: "Resultado de vista previa", intentos: 1, max_puntaje: puntaje, aprobado });
    }

    await pool.query(
      "INSERT INTO RESULTADO (evaluacion_id, alumno_id, puntaje, fecha) VALUES (?, ?, ?, NOW())",
      [evaluacion_id, alumno_id, puntaje]
    );

    const [rows] = await pool.query(
      "SELECT puntaje FROM RESULTADO WHERE alumno_id =? AND evaluacion_id =?",
      [alumno_id, evaluacion_id]
    );

    const intentos = rows.length || 1;
    const max_puntaje = rows.length > 0 ? Math.max(...rows.map(r => r.puntaje)) : puntaje;

    res.json({
      mensaje: "Resultado guardado",
      intentos,
      max_puntaje,
      aprobado
    });

  } catch (err) {
    console.error("❌ Error crítico en guardarResultadoEvaluacion:", err);
    res.status(500).json({
      error: "Error al guardar resultado",
      intentos: 0,
      max_puntaje: 0,
      aprobado: false
    });
  }
};

export const reiniciarEvaluacionModulo = async (req, res) => {
  try {
    const { correo } = req.user;
    const { evaluacion_id } = req.body;
    const [alumno] = await pool.query("SELECT alumno_id FROM ALUMNO WHERE correo =?", [correo]);
    if (!alumno.length) return res.status(404).json({ error: "Alumno no encontrado" });

    const [[evaluacion]] = await pool.query(
      "SELECT evaluacion_id, modulo_id FROM EVALUACION WHERE evaluacion_id = ? AND modulo_id NOT IN (?)", [evaluacion_id, modulosEvaluadosEnServidor]
    );
    if (!evaluacion) return res.status(404).json({ error: "Evaluación no encontrada" });
    if (modulosVistaPrevia(req).includes(evaluacion.modulo_id)) {
      return res.json({ message: "Vista previa reiniciada" });
    }
    await pool.query("DELETE FROM RESULTADO WHERE alumno_id =? AND evaluacion_id =?", [alumno[0].alumno_id, evaluacion_id]);
    console.log(`🔄 [EVAL] Evaluación reiniciada para ${correo}`);
    res.json({ message: "Reiniciado con éxito" });
  } catch (err) {
    console.error("❌ Error reiniciar:", err);
    res.status(500).json({ error: "Error al reiniciar evaluación" });
  }
};

export const obtenerContenidosCompletados = async (req, res) => {
  try {
    const { correo } = req.user;

    const [rows] = await pool.query(
      `SELECT
          modulo_id,
          contenido_id AS num_contenido
       FROM contenidos_completados
       WHERE correo = ?
       ORDER BY modulo_id, contenido_id`,
      [correo]
    );

    res.json(rows);

  } catch (err) {
    console.error("❌ Error obteniendo contenidos completados:", err);
    res.status(500).json({
      error: "Error obteniendo contenidos completados"
    });
  }
};
