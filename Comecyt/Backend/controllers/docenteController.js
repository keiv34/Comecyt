import { pool } from "../config/database.js";
import bcrypt from "bcryptjs";                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           

// 🔹 Obtener datos del docente
export const obtenerDatosDocente = async (req, res) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ error: "Correo requerido" });
    }

    const [rows] = await pool.query(
      "SELECT docente_id, nombre, apellido, correo FROM DOCENTE WHERE correo = ?",
      [correo]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Docente no encontrado" });

    res.json({ docente: rows[0] });
  } catch (err) {
    console.error("Error en obtenerDatosDocente:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// 🔹 Actualizar nombre / apellido / correo
export const actualizarDatosDocente = async (req, res) => {
  try {
    const { docente_id, nombre, apellido, correo } = req.body;

    if (!docente_id || !nombre || !apellido || !correo) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    await pool.query(
      "UPDATE DOCENTE SET nombre = ?, apellido = ?, correo = ? WHERE docente_id = ?",
      [nombre, apellido, correo, docente_id]
    );

    res.json({ mensaje: "Datos actualizados correctamente" });
  } catch (err) {
    console.error("Error en actualizarDatosDocente:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// 🔹 Cambiar contraseña del docente
export const cambiarPasswordDocente = async (req, res) => {
  try {
    const { docente_id, nueva_contrasena } = req.body;

    if (!docente_id || !nueva_contrasena) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const hashed = await bcrypt.hash(nueva_contrasena, 10);

    await pool.query(
      "UPDATE DOCENTE SET contraseña = ? WHERE docente_id = ?",
      [hashed, docente_id]
    );

    res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("Error en cambiarPasswordDocente:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};



// -------- DASHBOARD DOCENTE --------
// GET /api/docente/dashboard-resumen
export const obtenerDashboardResumen = async (req, res) => {
  try {
    // Total alumnos
    const [alumnosRows] = await pool.query(
      "SELECT COUNT(*) AS totalAlumnos FROM ALUMNO"
    );
    const totalAlumnos = alumnosRows[0]?.totalAlumnos || 0;

    // Total certificados
    const [certRows] = await pool.query(
      "SELECT COUNT(*) AS totalCertificados FROM CERTIFICADO"
    );
    const totalCertificados = certRows[0]?.totalCertificados || 0;

    // 🔹 Subconsulta: mejor puntaje por alumno/evaluación
    // (si el alumno hizo 2 o 3 intentos, tomamos el más alto)
    const [mejoresRows] = await pool.query(`
      SELECT 
        r.alumno_id,
        r.evaluacion_id,
        MAX(r.puntaje) AS mejor_puntaje
      FROM RESULTADO r
      GROUP BY r.alumno_id, r.evaluacion_id
    `);

    // Si no hay resultados aún, todo lo demás va vacío
    if (!mejoresRows.length) {
      return res.json({
        totalAlumnos,
        totalCertificados,
        promedioGeneral: null,
        top3Alumnos: [],
        progresoAlumnos: [],
      });
    }

    // 🔹 Promedio general (0–100) a partir de los mejores puntajes
    const [promRows] = await pool.query(`
      SELECT 
        AVG( (bp.mejor_puntaje / e.puntaje) * 100 ) AS promedioGeneral
      FROM (
        SELECT 
          alumno_id,
          evaluacion_id,
          MAX(puntaje) AS mejor_puntaje
        FROM RESULTADO
        GROUP BY alumno_id, evaluacion_id
      ) bp
      JOIN EVALUACION e ON e.evaluacion_id = bp.evaluacion_id
    `);
    const promedioGeneral = Number(promRows[0]?.promedioGeneral ?? 0);

    // 🔹 Top 3 alumnos por promedio (0–100)
    const [topRows] = await pool.query(`
      SELECT 
        a.alumno_id,
        a.nombre,
        a.apellido,
        AVG( (bp.mejor_puntaje / e.puntaje) * 100 ) AS promedio
      FROM (
        SELECT 
          alumno_id,
          evaluacion_id,
          MAX(puntaje) AS mejor_puntaje
        FROM RESULTADO
        GROUP BY alumno_id, evaluacion_id
      ) bp
      JOIN EVALUACION e ON e.evaluacion_id = bp.evaluacion_id
      JOIN ALUMNO a ON a.alumno_id = bp.alumno_id
      GROUP BY a.alumno_id, a.nombre, a.apellido
      ORDER BY promedio DESC
      LIMIT 3
    `);

    // 🔹 Progreso por alumno (Módulo 1) — progreso_m1 va de 0 a 29
    const [progRows] = await pool.query(`
      SELECT 
        alumno_id,
        nombre,
        apellido,
        progreso_m1 AS progreso
      FROM ALUMNO
    `);

    res.json({
      totalAlumnos,
      totalCertificados,
      promedioGeneral,
      top3Alumnos: topRows,
      progresoAlumnos: progRows,
    });
  } catch (error) {
    console.error("Error en obtenerDashboardResumen:", error);
    res
      .status(500)
      .json({ message: "Error al obtener el resumen del docente" });
  }
};

// -------- USUARIOS (ALUMNOS) --------
// GET /api/docente/usuarios
export const listarAlumnosDocente = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT alumno_id, nombre, apellido, correo, progreso_m1
       FROM ALUMNO`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error en listarAlumnosDocente:", error);
    res.status(500).json({ message: "Error al obtener alumnos" });
  }
};

// PUT /api/docente/usuarios/:id
export const actualizarAlumnoDocente = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, correo } = req.body;

  try {
    await pool.query(
      `UPDATE ALUMNO
       SET nombre = ?, apellido = ?, correo = ?
       WHERE alumno_id = ?`,
      [nombre, apellido, correo, id]
    );

    res.json({ message: "Alumno actualizado correctamente" });
  } catch (error) {
    console.error("Error en actualizarAlumnoDocente:", error);
    res.status(500).json({ message: "Error al actualizar alumno" });
  }
};

// -------- CALIFICACIONES --------
// GET /api/docente/calificaciones/top5
export const obtenerTop5Calificaciones = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         a.alumno_id,
         a.nombre,
         a.apellido,
         AVG(r.puntaje) AS promedio,
         SUM(r.puntaje) AS total_puntos
       FROM ALUMNO a
       JOIN RESULTADO r ON r.alumno_id = a.alumno_id
       GROUP BY a.alumno_id, a.nombre, a.apellido
       ORDER BY promedio DESC
       LIMIT 5`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error en obtenerTop5Calificaciones:", error);
    res.status(500).json({ message: "Error al obtener top 5" });
  }
};

// GET /api/docente/calificaciones
export const listarCalificaciones = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         r.resultado_id,
         a.alumno_id,
         a.nombre,
         a.apellido,
         e.evaluacion_id,
         e.titulo AS evaluacion,
         r.puntaje,
         r.fecha
       FROM RESULTADO r
       JOIN ALUMNO a ON a.alumno_id = r.alumno_id
       JOIN EVALUACION e ON e.evaluacion_id = r.evaluacion_id
       ORDER BY r.fecha DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Error en listarCalificaciones:", error);
    res.status(500).json({ message: "Error al obtener calificaciones" });
  }
};

// -------- CERTIFICADOS --------

// GET /api/docente/certificados
export const listarCertificados = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         c.certificado_id,
         a.alumno_id,
         a.nombre,
         a.apellido,
         c.modulo_id,
         c.fecha_emision,
         c.ruta_certificado
       FROM CERTIFICADO c
       JOIN ALUMNO a ON a.alumno_id = c.alumno_id
       ORDER BY c.fecha_emision DESC`
    );

    // Construimos la URL base en función del host actual
    const baseUrl = `${req.protocol}://${req.get("host")}/certificados`;

    const mapped = rows.map((r) => {
      let ruta_archivo = null;

      if (r.ruta_certificado) {
        const partes = r.ruta_certificado.split(/[/\\]/); // separa / y \
        const fileName = partes[partes.length - 1];
        ruta_archivo = `${baseUrl}/${fileName}`;
      }

      return {
        ...r,
        ruta_archivo, // 👈 esto es lo que usa el front
      };
    });

    res.json(mapped);
  } catch (error) {
    console.error("Error en listarCertificados:", error);
    res.status(500).json({
      message: "Error al obtener certificados",
      error: error.message,
    });
  }
};