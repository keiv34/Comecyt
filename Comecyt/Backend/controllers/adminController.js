import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";

// ========= REGISTRO ADMINISTRADOR =========
export const crearAdminRegistro = async (req, res) => {
  console.log('📝 [ADMIN] 1. Entró al endpoint /api/admin/registrar');
  console.log('📝 [ADMIN] 2. Body recibido:', req.body);

  try {
    const { nombre, apellido, correo, contraseña } = req.body;

    if (!nombre || !apellido || !correo || !contraseña) {
      console.log('❌ [ADMIN] 3. Faltan campos');
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
    console.log('✅ [ADMIN] 3. Campos OK');

    // PRUEBA 1: Verificar conexión a BD
    console.log('🔍 [ADMIN] 4. Probando conexión a BD...');
    try {
      const [test] = await pool.query("SELECT 1");
      console.log('✅ [ADMIN] 4. Conexión BD OK:', test);
    } catch (dbErr) {
      console.error('💥 [ADMIN] 4. ERROR DE CONEXIÓN BD:', dbErr);
      return res.status(500).json({ message: "Error de conexión a BD: " + dbErr.message });
    }

    // PRUEBA 2: Verificar si existe
    console.log('🔍 [ADMIN] 5. Buscando usuario existente...');
    let existe;
    try {
      [existe] = await pool.query("SELECT admin_id FROM ADMINISTRADOR WHERE usuario =?", [correo]);
      console.log('✅ [ADMIN] 5. Query SELECT OK. Existe:', existe.length > 0);
    } catch (selectErr) {
      console.error('💥 [ADMIN] 5. ERROR EN SELECT:', selectErr);
      return res.status(500).json({ message: "Error al buscar usuario: " + selectErr.message });
    }

    if (existe.length > 0) {
      console.log('❌ [ADMIN] 6. Usuario ya existe');
      return res.status(400).json({ message: "Ya existe un administrador con ese usuario" });
    }

    // PRUEBA 3: Hashear contraseña
    console.log('🔐 [ADMIN] 6. Hasheando contraseña...');
    let hash;
    try {
      hash = await bcrypt.hash(contraseña, 10);
      console.log('✅ [ADMIN] 6. Hash generado:', hash.substring(0, 20) + '...');
    } catch (hashErr) {
      console.error('💥 [ADMIN] 6. ERROR EN BCRYPT:', hashErr);
      return res.status(500).json({ message: "Error al hashear contraseña: " + hashErr.message });
    }

    // PRUEBA 4: Insertar
    console.log('💾 [ADMIN] 7. Ejecutando INSERT...');
    let result;
    try {
      [result] = await pool.query(
        "INSERT INTO ADMINISTRADOR (nombre, apellido, usuario, contraseña) VALUES (?,?,?,?)",
        [nombre, apellido, correo, hash]
      );
      console.log('✅ [ADMIN] 7. INSERT exitoso. ID:', result.insertId);
    } catch (insertErr) {
      console.error('💥 [ADMIN] 7. ERROR EN INSERT:', insertErr);
      console.error('💥 [ADMIN] 7. Error code:', insertErr.code);
      console.error('💥 [ADMIN] 7. Error sqlMessage:', insertErr.sqlMessage);
      return res.status(500).json({ message: "Error al insertar: " + insertErr.sqlMessage });
    }

    console.log('✅ [ADMIN] 8. Registro completado');
    res.status(201).json({ message: "Administrador registrado correctamente", admin_id: result.insertId });

  } catch (error) {
    console.error("💥 [ADMIN] ERROR GENERAL:", error);
    res.status(500).json({ message: "Error general: " + error.message });
  }
};

// ========= REGISTRO DOCENTE =========
export const crearDocenteAdmin = async (req, res) => {
  console.log('📝 [DOCENTE] 1. Entró al endpoint /api/admin/docentes');
  console.log('📝 [DOCENTE] 2. Body recibido:', req.body);

  try {
    const { nombre, apellido, correo, contraseña } = req.body;
    if (!nombre || !apellido || !correo || !contraseña) {
      return res.status(400).json({ message: "Nombre, apellido, correo y contraseña son obligatorios" });
    }

    console.log('🔍 [DOCENTE] 3. Verificando si existe correo...');
    const [existe] = await pool.query("SELECT docente_id FROM DOCENTE WHERE correo =?", [correo]);
    console.log('✅ [DOCENTE] 3. Verificación OK. Existe:', existe.length > 0);

    if (existe.length > 0) {
      return res.status(400).json({ message: "Ya existe un docente con ese correo" });
    }

    console.log('🔐 [DOCENTE] 4. Hasheando contraseña...');
    const hash = await bcrypt.hash(contraseña, 10);
    console.log('✅ [DOCENTE] 4. Hash generado');

    console.log('💾 [DOCENTE] 5. Ejecutando INSERT...');
    const [result] = await pool.query(
      "INSERT INTO DOCENTE (nombre, apellido, contraseña, correo) VALUES (?,?,?,?)",
      [nombre, apellido, hash, correo]
    );
    console.log('✅ [DOCENTE] 5. INSERT exitoso. ID:', result.insertId);

    res.status(201).json({ docente_id: result.insertId, nombre, apellido, correo, total_reportes: 0 });
  } catch (error) {
    console.error("💥 [DOCENTE] ERROR:", error);
    res.status(500).json({ message: "Error al crear docente: " + error.message });
  }
};

// ========= REGISTRO ALUMNO DESDE ADMIN =========
export const crearAlumnoAdmin = async (req, res) => {
  console.log('📝 [ALUMNO-ADMIN] 1. Entró al endpoint');
  try {
    const { nombre, apellido, correo, contraseña } = req.body;
    if (!nombre || !apellido || !correo || !contraseña) {
      return res.status(400).json({ message: "Nombre, apellido, correo y contraseña son obligatorios" });
    }
    const [existe] = await pool.query("SELECT alumno_id FROM ALUMNO WHERE correo =?", [correo]);
    if (existe.length > 0) {
      return res.status(400).json({ message: "Ya existe un alumno con ese correo" });
    }
    const hash = await bcrypt.hash(contraseña, 10);
    const [result] = await pool.query(
      "INSERT INTO ALUMNO (nombre, apellido, contraseña, correo) VALUES (?,?,?,?)",
      [nombre, apellido, hash, correo]
    );
    res.status(201).json({ alumno_id: result.insertId, nombre, apellido, correo, progreso_m1: 0 });
  } catch (error) {
    console.error("💥 [ALUMNO-ADMIN] ERROR:", error);
    res.status(500).json({ message: "Error al crear alumno: " + error.message });
  }
};

// ========= RESTO DE FUNCIONES =========
export const obtenerDatosAdmin = async (req, res) => {
  try {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ error: "Correo requerido" });
    const [rows] = await pool.query("SELECT admin_id, nombre, apellido, usuario FROM ADMINISTRADOR WHERE usuario =?", [correo]);
    if (rows.length === 0) return res.status(404).json({ error: "Administrador no encontrado" });
    res.json({ admin: rows[0] });
  } catch (err) {
    console.error("Error en obtenerDatosAdmin:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const actualizarDatosAdmin = async (req, res) => {
  try {
    const { admin_id, nombre, apellido, usuario } = req.body;
    if (!admin_id || !nombre || !apellido || !usuario) return res.status(400).json({ error: "Todos los campos son obligatorios" });
    await pool.query("UPDATE ADMINISTRADOR SET nombre =?, apellido =?, usuario =? WHERE admin_id =?", [nombre, apellido, usuario, admin_id]);
    res.json({ mensaje: "Datos del administrador actualizados correctamente" });
  } catch (err) {
    console.error("Error en actualizarDatosAdmin:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const cambiarPasswordAdmin = async (req, res) => {
  try {
    const { admin_id, nueva_contrasena } = req.body;
    if (!admin_id || !nueva_contrasena) return res.status(400).json({ error: "Datos incompletos" });
    const hashed = await bcrypt.hash(nueva_contrasena, 10);
    await pool.query("UPDATE ADMINISTRADOR SET contraseña =? WHERE admin_id =?", [hashed, admin_id]);
    res.json({ mensaje: "Contraseña del administrador actualizada correctamente" });
  } catch (err) {
    console.error("Error en cambiarPasswordAdmin:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const obtenerDashboardAdmin = async (req, res) => {
  try {
    const [alumnosRows] = await pool.query("SELECT COUNT(*) AS totalAlumnos FROM ALUMNO");
    const [docentesRows] = await pool.query("SELECT COUNT(*) AS totalDocentes FROM DOCENTE");
    const [modulosRows] = await pool.query("SELECT COUNT(*) AS totalModulos FROM MODULO");
    const [certRows] = await pool.query("SELECT COUNT(*) AS totalCertificados FROM CERTIFICADO");
    const [certPorModuloRows] = await pool.query(`SELECT m.modulo_id, m.titulo AS titulo_modulo, COUNT(c.certificado_id) AS totalCertificados FROM MODULO m LEFT JOIN CERTIFICADO c ON c.modulo_id = m.modulo_id GROUP BY m.modulo_id, m.titulo ORDER BY m.modulo_id`);
    const [contRows] = await pool.query(`SELECT m.modulo_id, m.titulo AS titulo_modulo, SUM(CASE WHEN c.tipo = 'contenido' THEN 1 ELSE 0 END) AS total_contenidos, SUM(CASE WHEN c.tipo = 'evaluacion' THEN 1 ELSE 0 END) AS total_evaluaciones FROM MODULO m LEFT JOIN CONTENIDO c ON c.modulo_id = m.modulo_id GROUP BY m.modulo_id, m.titulo ORDER BY m.modulo_id`);
    res.json({ totalAlumnos: alumnosRows[0]?.totalAlumnos || 0, totalDocentes: docentesRows[0]?.totalDocentes || 0, totalModulos: modulosRows[0]?.totalModulos || 0, totalCertificados: certRows[0]?.totalCertificados || 0, certificadosPorModulo: certPorModuloRows, resumenContenidos: contRows });
  } catch (error) {
    console.error("Error en obtenerDashboardAdmin:", error);
    res.status(500).json({ message: "Error al obtener el resumen del administrador" });
  }
};

export const listarAlumnosAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT a.alumno_id, a.nombre, a.apellido, a.correo, a.progreso_m1, CASE WHEN EXISTS (SELECT 1 FROM CERTIFICADO c WHERE c.alumno_id = a.alumno_id) THEN 1 ELSE 0 END AS tiene_certificado FROM ALUMNO a ORDER BY a.alumno_id`);
    res.json(rows);
  } catch (error) {
    console.error("Error en listarAlumnosAdmin:", error);
    res.status(500).json({ message: "Error al obtener alumnos" });
  }
};

// ACTUALIZAR ALUMNO ADMIN - ACTUALIZADO CON FOREIGN_KEY_CHECKS PARA FK
export const actualizarAlumnoAdmin = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, correo } = req.body;

  console.log('📍 [ADMIN-ROUTE] Body:', { nombre, apellido, correo });

  // Validación básica
  if (!nombre || !apellido || !correo) {
    return res.status(400).json({ error: "Nombre, apellido y correo son obligatorios" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Obtener el correo actual antes de actualizar
    const [alumnoActual] = await connection.query(
      `SELECT correo FROM ALUMNO WHERE alumno_id =?`,
      [id]
    );

    if (alumnoActual.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    const correoAnterior = alumnoActual[0].correo;

    // 2. Verificar que el nuevo correo no lo tenga otro usuario
    const [existe] = await connection.query(
      `SELECT alumno_id FROM ALUMNO WHERE correo =? AND alumno_id!=?`,
      [correo, id]
    );

    if (existe.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: "Ese correo ya está en uso" });
    }

    // 3. DESACTIVAR FOREIGN KEY CHECKS TEMPORALMENTE
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // 4. Si cambió el correo, actualiza las tablas hijas primero
    if (correoAnterior !== correo) {
      console.log('🔄 [UPDATE] Actualizando correo en cascada:', correoAnterior, '->', correo);

      await connection.query(
        `UPDATE progreso_modulos SET correo =? WHERE correo =?`,
        [correo, correoAnterior]
      );

      // Agrega aquí más tablas si usan correo como FK
      // await connection.query(`UPDATE CERTIFICADO SET correo =? WHERE correo =?`, [correo, correoAnterior]);
    }

    // 5. Ahora actualiza ALUMNO
    await connection.query(
      `UPDATE ALUMNO SET nombre =?, apellido =?, correo =? WHERE alumno_id =?`,
      [nombre, apellido, correo, id]
    );

    // 6. REACTIVAR FOREIGN KEY CHECKS
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    await connection.commit();
    console.log('✅ [UPDATE] Alumno actualizado correctamente');

    res.json({ message: "Alumno actualizado correctamente" });

  } catch (error) {
    await connection.rollback();
    // Asegurarnos de reactivar los FK checks aunque falle
    await connection.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => { });
    console.error('Error en actualizarAlumnoAdmin:', error);
    res.status(500).json({ error: "Error al actualizar alumno" });
  } finally {
    connection.release();
  }
};

export const eliminarAlumnoAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM RESULTADO WHERE alumno_id =?", [id]);
    await pool.query("DELETE FROM CERTIFICADO WHERE alumno_id =?", [id]);
    await pool.query("DELETE FROM ALUMNO WHERE alumno_id =?", [id]);
    res.json({ message: "Alumno eliminado correctamente" });
  } catch (error) {
    console.error("Error en eliminarAlumnoAdmin:", error);
    res.status(500).json({ message: "Error al eliminar alumno" });
  }
};

export const listarDocentesAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT d.docente_id, d.nombre, d.apellido, d.correo, COUNT(r.reporte_id) AS total_reportes FROM DOCENTE d LEFT JOIN REPORTE r ON r.docente_id = d.docente_id GROUP BY d.docente_id, d.nombre, d.apellido, d.correo ORDER BY d.docente_id`);
    res.json(rows);
  } catch (error) {
    console.error("Error en listarDocentesAdmin:", error);
    res.status(500).json({ message: "Error al obtener docentes" });
  }
};

// ACTUALIZAR DOCENTE ADMIN - ACTUALIZADO CON FOREIGN_KEY_CHECKS PARA FK
export const actualizarDocenteAdmin = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, correo } = req.body;

  if (!nombre || !apellido || !correo) {
    return res.status(400).json({ message: "Nombre, apellido y correo son obligatorios" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Obtener el correo actual
    const [docenteActual] = await connection.query(
      `SELECT correo FROM DOCENTE WHERE docente_id =?`,
      [id]
    );

    if (docenteActual.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Docente no encontrado" });
    }

    const correoAnterior = docenteActual[0].correo;

    // 2. Verificar que el nuevo correo no lo tenga otro docente
    const [existe] = await connection.query(
      `SELECT docente_id FROM DOCENTE WHERE correo =? AND docente_id!=?`,
      [correo, id]
    );

    if (existe.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Ese correo ya está en uso" });
    }

    // 3. DESACTIVAR FOREIGN KEY CHECKS
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // 4. Si cambió el correo, actualiza tablas hijas
    if (correoAnterior !== correo) {
      console.log('🔄 [UPDATE DOCENTE] Actualizando correo en cascada:', correoAnterior, '->', correo);

      // Actualiza REPORTE si usa correo como FK
      await connection.query(
        `UPDATE REPORTE SET correo =? WHERE correo =?`,
        [correo, correoAnterior]
      ).catch(() => { }); // Por si la tabla no tiene columna correo

      // Actualiza EVALUACION si usa correo como FK
      await connection.query(
        `UPDATE EVALUACION SET correo =? WHERE correo =?`,
        [correo, correoAnterior]
      ).catch(() => { });

      // Agrega aquí más tablas que usen correo como FK
    }

    // 5. Actualiza DOCENTE
    await connection.query(
      "UPDATE DOCENTE SET nombre =?, apellido =?, correo =? WHERE docente_id =?",
      [nombre, apellido, correo, id]
    );

    // 6. REACTIVAR FOREIGN KEY CHECKS
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    await connection.commit();
    console.log('✅ [UPDATE DOCENTE] Docente actualizado correctamente');

    res.json({ message: "Docente actualizado correctamente" });

  } catch (error) {
    await connection.rollback();
    await connection.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => { });
    console.error("Error en actualizarDocenteAdmin:", error);
    res.status(500).json({ message: "Error al actualizar docente" });
  } finally {
    connection.release();
  }
};

export const eliminarDocenteAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM RESULTADO WHERE evaluacion_id IN (SELECT evaluacion_id FROM EVALUACION WHERE docente_id =?)", [id]);
    await pool.query("DELETE FROM REPORTE WHERE docente_id =?", [id]);
    await pool.query("DELETE FROM DOCENTE WHERE docente_id =?", [id]);
    res.json({ message: "Docente eliminado correctamente" });
  } catch (error) {
    console.error("Error en eliminarDocenteAdmin:", error);
    res.status(500).json({ message: "Error al eliminar docente" });
  }
};

export const listarModulosAdmin = async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT m.modulo_id, m.titulo, m.descripcion, COUNT(DISTINCT c.contenido_id) AS total_contenidos, COUNT(DISTINCT ev.evaluacion_id) AS total_evaluaciones, COUNT(DISTINCT res.alumno_id) AS total_alumnos, ROUND(AVG(CASE WHEN ev.puntaje IS NOT NULL AND ev.puntaje > 0 THEN (res.puntaje / ev.puntaje) * 100 ELSE NULL END), 1) AS progreso_promedio, COUNT(DISTINCT cert.certificado_id) AS total_certificados FROM MODULO m LEFT JOIN CONTENIDO c ON c.modulo_id = m.modulo_id LEFT JOIN EVALUACION ev ON ev.modulo_id = m.modulo_id LEFT JOIN RESULTADO res ON res.evaluacion_id = ev.evaluacion_id LEFT JOIN CERTIFICADO cert ON cert.modulo_id = m.modulo_id GROUP BY m.modulo_id, m.titulo, m.descripcion ORDER BY m.modulo_id`);
    const mapped = rows.map((r) => ({ ...r, progreso_promedio: Number(r.progreso_promedio || 0), total_contenidos: Number(r.total_contenidos || 0), total_evaluaciones: Number(r.total_evaluaciones || 0), total_alumnos: Number(r.total_alumnos || 0), total_certificados: Number(r.total_certificados || 0) }));
    res.json(mapped);
  } catch (error) {
    console.error("Error en listarModulosAdmin:", error);
    res.status(500).json({ message: "Error al obtener módulos" });
  }
};

export const actualizarModuloAdmin = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion } = req.body;
  if (!titulo || !descripcion) return res.status(400).json({ message: "Título y descripción son obligatorios" });
  try {
    await pool.query("UPDATE MODULO SET titulo =?, descripcion =? WHERE modulo_id =?", [titulo, descripcion, id]);
    res.json({ message: "Módulo actualizado correctamente" });
  } catch (error) {
    console.error("Error en actualizarModuloAdmin:", error);
    res.status(500).json({ message: "Error al actualizar módulo" });
  }
};