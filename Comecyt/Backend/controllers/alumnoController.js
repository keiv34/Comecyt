import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";

// ===== CONSTANTES =====
const TOTAL_PREGUNTAS_EVAL1 = 15;
const MIN_PORCENTAJE_APROBADO = 70;

// ✅ TOTALES REALES - IGUALES A Inicio.jsx
const CONTENIDOS_POR_MODULO = {
  1: 8, // Módulo 1: Correo Electrónico
  2: 6, // Módulo 2: Facebook y Marketplace
  3: 7, // Módulo 3: WhatsApp y WhatsApp Business
  4: 8, // Módulo 4: Instagram
  5: 16 // Módulo 5: Retos Finales
};

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

// ===== ✅ GRÁFICA DE AVANCES =====
export const obtenerProgresoAlumno = async (req, res) => {
  try {
    const { correo } = req.body;
    console.log(`📥 [PROGRESO] Pidiendo progreso para: ${correo}`);

    if (!correo) {
      return res.status(400).json({ error: "Correo requerido" });
    }

    const [alumnoRows] = await pool.query("SELECT * FROM ALUMNO WHERE correo =?", [correo]);
    if (!alumnoRows.length) return res.status(404).json({ error: "Alumno no encontrado" });
    const alumno = alumnoRows[0];

    const [progresos] = await pool.query(
      "SELECT modulo_id, progreso_actual FROM progreso_modulos WHERE correo =?",
      [correo]
    );
    console.log(`📦 [PROGRESO] Progresos en BD:`, progresos);

    const [modulos] = await pool.query("SELECT * FROM MODULO ORDER BY modulo_id ASC");
    const resultados = [];

    for (let modulo of modulos) {
      const prog = progresos.find(p => Number(p.modulo_id) === Number(modulo.modulo_id));
      const progresoActual = prog ? Number(prog.progreso_actual) : 0;
      const totalContenidos = CONTENIDOS_POR_MODULO[modulo.modulo_id] || 1;
      const porcentaje = totalContenidos > 0
        ? Math.min(Math.round((progresoActual / totalContenidos) * 100), 100)
        : 0;

      console.log(`Módulo ${modulo.modulo_id}: ${progresoActual}/${totalContenidos} = ${porcentaje}%`);

      const siguienteNumero = progresoActual + 1;
      const [siguienteRows] = await pool.query(
        "SELECT * FROM CONTENIDO WHERE modulo_id =? AND numero =?",
        [modulo.modulo_id, siguienteNumero]
      );

      const siguiente = siguienteRows[0] || null;

      resultados.push({
        modulo_id: modulo.modulo_id,
        titulo_modulo: modulo.titulo,
        progreso_actual: progresoActual,
        total_contenidos: totalContenidos,
        porcentaje: porcentaje,
        siguiente_contenido: siguiente ? siguiente.titulo : "Completado",
        siguiente_numero: siguiente ? siguiente.numero : null,
        completado: progresoActual >= totalContenidos
      });
    }

    res.json({
      alumno: {
        id: alumno.alumno_id,
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        correo: alumno.correo
      },
      modulos: resultados
    });
  } catch (error) {
    console.error("❌ Error en progreso:", error);
    res.status(500).json({ error: "Error en progreso" });
  }
};

// ===== ✅ GUARDAR PARTIDA - CORREGIDO =====
export const actualizarProgresoContenido = async (req, res) => {
  const { correo, modulo_id, contenido_id } = req.body;

  if (!correo || !modulo_id || !contenido_id) {
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }

  try {
    // 1. Marcar contenido como completado
    await pool.query(
      'INSERT IGNORE INTO contenidos_completados (correo, modulo_id, contenido_id, fecha_completado) VALUES (?,?,?, NOW())',
      [correo, modulo_id, contenido_id]
    );

    // 2. Contar completados reales
    const [completados] = await pool.query(
      'SELECT COUNT(*) as count FROM contenidos_completados WHERE correo =? AND modulo_id =?',
      [correo, modulo_id]
    );

    const [total] = await pool.query(
      'SELECT total_contenidos FROM MODULO WHERE modulo_id =?',
      [modulo_id]
    );

    const nuevoProgreso = completados[0]?.count || 0;
    const totalContenidos = total[0]?.total_contenidos || 0;

    // 3. Actualizar progreso_modulos
    const [result] = await pool.query(
      `INSERT INTO progreso_modulos (correo, modulo_id, progreso_actual)
       VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE progreso_actual =?`,
      [correo, modulo_id, nuevoProgreso]
    );

    console.log(`✅ Progreso actualizado: ${correo} - Módulo ${modulo_id}: ${nuevoProgreso}/${totalContenidos}`);
    res.json({
      success: true,
      mensaje: "Progreso actualizado correctamente",
      progreso_actual: nuevoProgreso,
      progreso: nuevoProgreso,
      operacion: result.insertId > 0 ? "INSERT" : "UPDATE"
    });
  } catch (err) {
    console.error("❌ Error actualizando progreso:", err);
    res.status(500).json({
      success: false,
      error: "Error al actualizar progreso",
      detalle: err.message
    });
  }
};

// ===== DATOS ALUMNO =====
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
    const { correo } = req.body;
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
    const { correo, evaluacion_id } = req.body;
    const [alumno] = await pool.query("SELECT alumno_id FROM ALUMNO WHERE correo =?", [correo]);
    if (!alumno.length) return res.status(404).json({ error: "Alumno no encontrado" });

    const [rows] = await pool.query(
      "SELECT puntaje FROM RESULTADO WHERE alumno_id =? AND evaluacion_id =?",
      [alumno[0].alumno_id, evaluacion_id]
    );

    const intentos = rows.length;
    const max_puntaje = rows.length > 0 ? Math.max(...rows.map(r => r.puntaje)) : 0;
    const aprobado = (max_puntaje / TOTAL_PREGUNTAS_EVAL1) * 100 >= MIN_PORCENTAJE_APROBADO;

    res.json({ intentos, max_puntaje, aprobado });
  } catch (err) {
    console.error("❌ Error intentos:", err);
    res.status(500).json({ error: "Error al obtener intentos" });
  }
};

export const guardarResultadoEvaluacion = async (req, res) => {
  const { correo, evaluacion_id, puntaje } = req.body;
  console.log(`📥 [EVAL] Guardando: correo=${correo}, eval=${evaluacion_id}, puntaje=${puntaje}`);

  try {
    const [alumno] = await pool.query("SELECT alumno_id FROM ALUMNO WHERE correo =?", [correo]);
    if (!alumno.length) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const alumno_id = alumno[0].alumno_id;
    const porcentaje = (puntaje / TOTAL_PREGUNTAS_EVAL1) * 100;
    const aprobado = porcentaje >= MIN_PORCENTAJE_APROBADO;

    try {
      await pool.query(
        "INSERT INTO RESULTADO (evaluacion_id, alumno_id, puntaje, fecha) VALUES (?,?,?, NOW())",
        [evaluacion_id, alumno_id, puntaje]
      );
      console.log(`✅ [EVAL] Resultado insertado en RESULTADO`);
    } catch (err) {
      console.error("⚠ Error al insertar en RESULTADO:", err.message);
    }

    const [rows] = await pool.query(
      "SELECT puntaje FROM RESULTADO WHERE alumno_id =? AND evaluacion_id =?",
      [alumno_id, evaluacion_id]
    );

    const intentos = rows.length || 1;
    const max_puntaje = rows.length > 0 ? Math.max(...rows.map(r => r.puntaje)) : puntaje;

    if (aprobado) {
      const MODULO_ID = 1;
      const NUM_CONTENIDO = CONTENIDOS_POR_MODULO[MODULO_ID];
      const SIGUIENTE_MODULO_ID = 2;

      await pool.query(`
        INSERT INTO progreso_modulos (correo, modulo_id, progreso_actual, fecha_actualizacion)
        VALUES (?,?,?, NOW())
        ON DUPLICATE KEY UPDATE
          progreso_actual = VALUES(progreso_actual),
          fecha_actualizacion = CURRENT_TIMESTAMP
      `, [correo, MODULO_ID, NUM_CONTENIDO]);

      await pool.query(`
        INSERT INTO progreso_modulos (correo, modulo_id, progreso_actual)
        VALUES (?,?, 0)
        ON DUPLICATE KEY UPDATE progreso_actual = progreso_actual
      `, [correo, SIGUIENTE_MODULO_ID]);

      console.log(`💾 [EVAL] Módulo 1 completado (${NUM_CONTENIDO}/${NUM_CONTENIDO}) y Módulo 2 desbloqueado para ${correo}`);
    }

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
    const { correo, evaluacion_id } = req.body;
    const [alumno] = await pool.query("SELECT alumno_id FROM ALUMNO WHERE correo =?", [correo]);
    if (!alumno.length) return res.status(404).json({ error: "Alumno no encontrado" });

    await pool.query("DELETE FROM RESULTADO WHERE alumno_id =? AND evaluacion_id =?", [alumno[0].alumno_id, evaluacion_id]);
    console.log(`🔄 [EVAL] Evaluación reiniciada para ${correo}`);
    res.json({ message: "Reiniciado con éxito" });
  } catch (err) {
    console.error("❌ Error reiniciar:", err);
    res.status(500).json({ error: "Error al reiniciar evaluación" });
  }
};

// ✅ NUEVO: Validar si puede ver un contenido - AGREGADO SIN QUITAR NADA
export const obtenerContenido = async (req, res) => {
  try {
    const { correo } = req.user; // viene del JWT middleware
    const { modulo_id, numero } = req.params;

    console.log(`🔍 [CONTENIDO] Usuario ${correo} pide modulo ${modulo_id} contenido ${numero}`);

    // Si es contenido 1, siempre déjalo pasar
    if (parseInt(numero) === 1) {
      const [contenido] = await pool.query(
        "SELECT * FROM CONTENIDO WHERE modulo_id =? AND numero =?",
        [modulo_id, numero]
      );
      if (!contenido.length) return res.status(404).json({ error: 'Contenido no encontrado' });
      console.log(`✅ [CONTENIDO] Acceso permitido a contenido 1`);
      return res.json(contenido[0]);
    }

    // Para contenido > 1, checa si completó el anterior
    const [anterior] = await pool.query(
      `SELECT * FROM contenidos_completados 
       WHERE correo =? AND modulo_id =? AND contenido_id =?`,
      [correo, modulo_id, parseInt(numero) - 1]
    );

    if (!anterior.length) {
      console.log(`🔒 [CONTENIDO] Bloqueado: ${correo} no completó contenido ${parseInt(numero) - 1}`);
      return res.status(403).json({
        error: 'Bloqueado',
        mensaje: 'Completa el contenido anterior primero',
        contenido_bloqueado: numero,
        contenido_requerido: parseInt(numero) - 1
      });
    }

    const [contenido] = await pool.query(
      "SELECT * FROM CONTENIDO WHERE modulo_id =? AND numero =?",
      [modulo_id, numero]
    );

    if (!contenido.length) return res.status(404).json({ error: 'Contenido no encontrado' });

    console.log(`✅ [CONTENIDO] Acceso permitido a contenido ${numero}`);
    res.json(contenido[0]);

  } catch (err) {
    console.error("❌ Error en obtenerContenido:", err);
    res.status(500).json({ error: "Error al obtener contenido" });
  }
};

export const obtenerContenidosCompletados = async (req, res) => {
  try {
    const { correo } = req.params;

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
