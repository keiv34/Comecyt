import express from "express";
import {
  obtenerDatosAdmin,
  actualizarDatosAdmin,
  cambiarPasswordAdmin,
  obtenerDashboardAdmin,
  listarAlumnosAdmin,
  actualizarAlumnoAdmin,
  eliminarAlumnoAdmin,
  crearAlumnoAdmin,
  listarDocentesAdmin,
  actualizarDocenteAdmin,
  eliminarDocenteAdmin,
  crearDocenteAdmin,
  listarModulosAdmin,
  actualizarModuloAdmin,
  crearAdminRegistro,
} from "../controllers/adminController.js";
import { pool as db } from "../config/database.js";

const router = express.Router();

// ==========================
// MIDDLEWARE DE LOG
// ==========================
router.use((req, res, next) => {
  console.log(`\n📍 [ADMIN-ROUTE] ${req.method} ${req.originalUrl}`);
  next();
});

// ==========================
// RUTAS ADMIN - PERFIL Y CONFIG
// ==========================

// ✅ ARREGLADO: POST /api/admin/datos - Usa 'usuario' en vez de 'correo'
router.post("/datos", async (req, res) => {
  try {
    const { correo } = req.body; // El frontend sigue mandando 'correo'

    if (!correo) {
      return res.status(400).json({ error: 'Correo requerido' });
    }

    const [admin] = await db.query(`
      SELECT
        admin_id,
        nombre,
        apellido,
        usuario as correo,
        DATE_FORMAT(fecha_registro, '%d/%m/%Y') as fecha_registro
      FROM ADMINISTRADOR
      WHERE usuario =?
    `, [correo]);

    if (admin.length === 0) {
      return res.status(404).json({ error: 'Admin no encontrado' });
    }

    res.json(admin[0]);
  } catch (error) {
    console.error('💥 Error datos admin:', error);
    res.status(500).json({ error: 'Error al cargar datos del admin' });
  }
});

// ✅ ARREGLADO: PUT /api/admin/actualizar - Usa 'usuario'
router.put("/actualizar", async (req, res) => {
  try {
    const { admin_id, nombre, apellido, correo, avatar } = req.body;

    await db.query(`
      UPDATE ADMINISTRADOR
      SET nombre =?, apellido =?, usuario =?
      WHERE admin_id =?
    `, [nombre, apellido, correo, admin_id]);

    const [updated] = await db.query(`
      SELECT admin_id, nombre, apellido, usuario as correo
      FROM ADMINISTRADOR WHERE admin_id =?
    `, [admin_id]);

    res.json({ user: updated[0], mensaje: 'Datos actualizados' });
  } catch (error) {
    console.error('💥 Error actualizar admin:', error);
    res.status(500).json({ error: 'Error al actualizar datos' });
  }
});

router.put("/password", cambiarPasswordAdmin);
router.get("/dashboard", obtenerDashboardAdmin);

// ✅ Dashboard resumen con contadores - TABLAS EN MAYÚSCULAS
router.get('/dashboard-resumen', async (req, res) => {
  try {
    console.log('📊 [DASHBOARD] Obteniendo resumen...');

    const [alumnos] = await db.query('SELECT COUNT(*) as total FROM ALUMNO');
    const [docentes] = await db.query('SELECT COUNT(*) as total FROM DOCENTE');
    const [modulos] = await db.query('SELECT COUNT(*) as total FROM MODULO');
    const [admins] = await db.query('SELECT COUNT(*) as total FROM ADMINISTRADOR');

    res.json({
      alumnos: alumnos[0].total,
      docentes: docentes[0].total,
      modulos: modulos[0].total,
      admins: admins[0].total,
      total_usuarios: alumnos[0].total + docentes[0].total + admins[0].total
    });
  } catch (err) {
    console.error('💥 [DASHBOARD] Error:', err);
    res.status(500).json({
      error: 'Error al obtener resumen del dashboard',
      message: err.message
    });
  }
});

// Resumen del catálogo y la actividad registrada en MySQL.
router.get('/dashboard/modulos', async (req, res) => {
  const [modulos] = await db.query(`
    SELECT m.modulo_id, m.titulo AS nombre, m.total_contenidos AS contenidos,
      (SELECT COUNT(*) FROM EVALUACION e WHERE e.modulo_id = m.modulo_id) AS evaluaciones,
      (SELECT COUNT(*) FROM CERTIFICADO c WHERE c.modulo_id = m.modulo_id) AS certificados,
      COALESCE(p.alumnos, 0) AS alumnos,
      COALESCE(ROUND(100 * p.promedio / NULLIF(m.total_contenidos, 0)), 0) AS progreso_promedio
    FROM MODULO m
    LEFT JOIN (
      SELECT modulo_id, COUNT(*) AS alumnos, AVG(completadas) AS promedio
      FROM (
        SELECT c.modulo_id, c.correo, COUNT(*) AS completadas
        FROM contenidos_completados c
        JOIN MODULO m ON m.modulo_id = c.modulo_id
        WHERE c.contenido_id BETWEEN 1 AND m.total_contenidos
        GROUP BY c.modulo_id, c.correo
        UNION ALL
        SELECT p.modulo_id, p.correo,
          CASE
            WHEN p.progreso_actual > m.total_contenidos
              THEN ROUND(LEAST(p.progreso_actual, 100) * m.total_contenidos / 100)
            ELSE p.progreso_actual
          END AS completadas
        FROM progreso_modulos p
        JOIN MODULO m ON m.modulo_id = p.modulo_id
        WHERE p.progreso_actual > 0 AND NOT EXISTS (
          SELECT 1 FROM contenidos_completados c
          WHERE c.modulo_id = p.modulo_id AND c.correo = p.correo
            AND c.contenido_id BETWEEN 1 AND m.total_contenidos
        )
      ) por_alumno
      WHERE completadas > 0
      GROUP BY modulo_id
    ) p ON p.modulo_id = m.modulo_id
    ORDER BY m.modulo_id
  `);
  res.json(modulos.map(modulo => ({ ...modulo, progreso_promedio: Number(modulo.progreso_promedio) })));
});

// ==========================
// ALUMNOS - CONTROLLERS
// ==========================
router.get("/alumnos", listarAlumnosAdmin);
router.post("/alumnos", crearAlumnoAdmin);
router.put("/alumnos/:id", actualizarAlumnoAdmin);
router.delete("/alumnos/:id", eliminarAlumnoAdmin);

// ==========================
// DOCENTES - CONTROLLERS
// ==========================
router.get("/docentes", listarDocentesAdmin);
router.post("/docentes", crearDocenteAdmin);
router.put("/docentes/:id", actualizarDocenteAdmin);
router.delete("/docentes/:id", eliminarDocenteAdmin);

// ==========================
// MÓDULOS - CONTROLLERS
// ==========================
router.get("/modulos", listarModulosAdmin);
router.put("/modulos/:id", actualizarModuloAdmin);

// ==========================
// REGISTRO ADMIN
// ==========================
router.post("/registrar", crearAdminRegistro);

// ==========================
// PANEL DUDAS WHATSAPP - COMECYT
// ==========================
router.post('/whatsapp/registrar-duda', async (req, res) => {
  try {
    const { nombre, telefono, mensaje, modulo = '/whatsapp' } = req.body;
    if (!nombre || !telefono || !mensaje) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, telefono, mensaje' });
    }
    const [result] = await db.query(
      `INSERT INTO dudas_whatsapp (nombre, telefono, pregunta, modulo, estatus) VALUES (?,?,?,?, 'nueva')`,
      [nombre, telefono, mensaje, modulo]
    );
    res.status(201).json({ ok: true, id: result.insertId, mensaje: 'Duda registrada correctamente' });
  } catch (err) {
    console.error('💥 [WHATSAPP] Error al guardar duda:', err);
    res.status(500).json({ error: 'Error al guardar la duda en la base de datos' });
  }
});

router.get('/whatsapp/dudas', async (req, res) => {
  try {
    const [dudas] = await db.query(`
      SELECT id, nombre, telefono, pregunta AS mensaje, modulo, estatus AS estado, fecha, respuesta, fecha_respuesta
      FROM dudas_whatsapp
      ORDER BY CASE estatus WHEN 'nueva' THEN 1 WHEN 'respondida' THEN 2 WHEN 'cerrada' THEN 3 END, fecha DESC
    `);
    res.json(dudas);
  } catch (err) {
    console.error('💥 [WHATSAPP] Error al obtener dudas:', err);
    res.status(500).json({ error: 'Error al obtener las dudas' });
  }
});

router.get('/whatsapp/dudas/estado/:estado', async (req, res) => {
  try {
    const { estado } = req.params;
    const estadosValidos = ['nueva', 'respondida', 'cerrada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }
    const [dudas] = await db.query(`
      SELECT id, nombre, telefono, pregunta AS mensaje, modulo, estatus AS estado, fecha, respuesta, fecha_respuesta
      FROM dudas_whatsapp WHERE estatus =? ORDER BY fecha DESC
    `, [estado]);
    res.json(dudas);
  } catch (err) {
    console.error('💥 [WHATSAPP] Error al obtener dudas por estado:', err);
    res.status(500).json({ error: 'Error al filtrar dudas' });
  }
});

router.put('/whatsapp/dudas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, respuesta } = req.body;
    const estadosValidos = ['nueva', 'respondida', 'cerrada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido. Debe ser: nueva, respondida o cerrada' });
    }
    const [dudaExiste] = await db.query('SELECT id FROM dudas_whatsapp WHERE id =?', [id]);
    if (dudaExiste.length === 0) {
      return res.status(404).json({ error: 'Duda no encontrada' });
    }
    await db.query('UPDATE dudas_whatsapp SET estatus =?, respuesta =?, fecha_respuesta = NOW() WHERE id =?', [estado, respuesta || null, id]);
    res.json({ ok: true, mensaje: `Duda marcada como ${estado}` });
  } catch (err) {
    console.error('💥 [WHATSAPP] Error al actualizar duda:', err);
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
});

router.delete('/whatsapp/dudas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM dudas_whatsapp WHERE id =?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Duda no encontrada' });
    }
    res.json({ ok: true, mensaje: 'Duda eliminada correctamente' });
  } catch (err) {
    console.error('💥 [WHATSAPP] Error al eliminar duda:', err);
    res.status(500).json({ error: 'Error al eliminar la duda' });
  }
});

router.get('/whatsapp/stats', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN estatus = 'nueva' THEN 1 ELSE 0 END) as nuevas,
        SUM(CASE WHEN estatus = 'respondida' THEN 1 ELSE 0 END) as respondidas,
        SUM(CASE WHEN estatus = 'cerrada' THEN 1 ELSE 0 END) as cerradas
      FROM dudas_whatsapp
    `);
    res.json(stats[0]);
  } catch (err) {
    console.error('💥 [WHATSAPP] Error al obtener estadísticas:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

router.get('/whatsapp/panel', async (req, res) => {
  try {
    console.log('📊 [WHATSAPP-PANEL] Cargando datos completos...');
    const [dudas] = await db.query(`
      SELECT id, DATE_FORMAT(fecha, '%Y-%m-%d %H:%i') as fecha, nombre as usuario, telefono, modulo, pregunta as duda, estatus as estado, respuesta, DATE_FORMAT(fecha_respuesta, '%Y-%m-%d %H:%i') as fecha_respuesta
      FROM dudas_whatsapp
      ORDER BY CASE estatus WHEN 'nueva' THEN 1 WHEN 'respondida' THEN 2 WHEN 'cerrada' THEN 3 END, fecha DESC
    `);
    const nuevas = dudas.filter(d => d.estado === 'nueva').length;
    const respondidas = dudas.filter(d => d.estado === 'respondida').length;
    const cerradas = dudas.filter(d => d.estado === 'cerrada').length;
    console.log(`✅ [WHATSAPP-PANEL] ${dudas.length} dudas: ${nuevas} nuevas, ${respondidas} respondidas, ${cerradas} cerradas`);
    res.json({ nuevas, respondidas, cerradas, total: dudas.length, lista: dudas });
  } catch (err) {
    console.error('💥 [WHATSAPP-PANEL] Error:', err);
    res.status(500).json({ error: 'Error al cargar panel de dudas', message: err.message });
  }
});

// ==========================
// RUTAS DIRECTAS - BYPASS CONTROLLERS ROTOS
// ==========================

// GET /api/admin/stats - Contadores directos del dashboard
router.get('/stats', async (req, res) => {
  try {
    const [alumnos] = await db.query('SELECT COUNT(*) as total FROM ALUMNO');
    const [docentes] = await db.query('SELECT COUNT(*) as total FROM DOCENTE');
    const [modulos] = await db.query('SELECT COUNT(*) as total FROM MODULO');
    const [certificados] = await db.query('SELECT COUNT(*) as total FROM CERTIFICADO');
    res.json({
      alumnos: alumnos[0].total,
      docentes: docentes[0].total,
      modulos: modulos[0].total,
      certificados: certificados[0].total
    });
  } catch (error) {
    console.error('💥 Error stats:', error);
    res.status(500).json({ error: 'Error al cargar stats' });
  }
});

// GET /api/admin/alumnos-direct - Lista de alumnos SIN controller
router.get('/alumnos-direct', async (req, res) => {
  try {
    const [alumnos] = await db.query(`
      SELECT
        alumno_id,
        nombre,
        apellido,
        correo,
        CONCAT(nombre, ' ', apellido) as nombre_completo,
        DATE_FORMAT(fecha_registro, '%d/%m/%Y') as fecha_registro,
        0 as progreso_general,
        'N/A' as modulo_actual
      FROM ALUMNO
      ORDER BY fecha_registro DESC
    `);
    res.json(alumnos);
  } catch (error) {
    console.error('💥 Error alumnos-direct:', error);
    res.status(500).json({ error: 'Error al cargar alumnos' });
  }
});

// GET /api/admin/docentes-direct - Lista docentes con teléfono
router.get('/docentes-direct', async (req, res) => {
  try {
    const [docentes] = await db.query(`
      SELECT
        docente_id,
        nombre,
        apellido,
        correo,
        IFNULL(telefono, 'Sin teléfono') as telefono,
        CONCAT(nombre, ' ', apellido) as nombre_completo,
        DATE_FORMAT(fecha_registro, '%d/%m/%Y') as fecha_registro
      FROM DOCENTE
      ORDER BY fecha_registro DESC
    `);
    res.json(docentes);
  } catch (error) {
    console.error('💥 Error docentes-direct:', error);
    res.status(500).json({ error: 'Error al cargar docentes' });
  }
});

// GET /api/admin/usuarios-direct - Lista TODOS: alumnos + docentes
router.get('/usuarios-direct', async (req, res) => {
  try {
    const [alumnos] = await db.query(`
      SELECT
        alumno_id as id,
        CONCAT(nombre, ' ', apellido) as nombre_completo,
        correo,
        'Alumno' as rol,
        DATE_FORMAT(fecha_registro, '%d/%m/%Y') as fecha_registro,
        'Sin teléfono' as telefono
      FROM ALUMNO
    `);

    const [docentes] = await db.query(`
      SELECT
        docente_id as id,
        CONCAT(nombre, ' ', apellido) as nombre_completo,
        correo,
        'Docente' as rol,
        DATE_FORMAT(fecha_registro, '%d/%m/%Y') as fecha_registro,
        IFNULL(telefono, 'Sin teléfono') as telefono
      FROM DOCENTE
    `);

    const todosUsuarios = [...alumnos, ...docentes].sort((a, b) =>
      b.id - a.id
    );

    res.json(todosUsuarios);
  } catch (error) {
    console.error('💥 Error usuarios-direct:', error);
    res.status(500).json({ error: 'Error al cargar usuarios' });
  }
});

// GET /api/admin/alumnos-progreso - Ruta agregada para el frontend
router.get('/alumnos-progreso', async (req, res) => {
  try {
    console.log('📊 [ADMIN] Solicitando progreso de alumnos...');
    
    // Aquí usamos una consulta similar a tu 'alumnos-direct' 
    // Asegúrate de ajustarla si tienes una tabla real de progreso general
    const [alumnos] = await db.query(`
      SELECT 
        alumno_id,
        nombre,
        apellido,
        correo,
        CONCAT(nombre, ' ', apellido) as nombre_completo,
        DATE_FORMAT(fecha_registro, '%d/%m/%Y') as fecha_registro,
        0 as progreso_general,  
        'N/A' as modulo_actual
      FROM ALUMNO
      ORDER BY fecha_registro DESC
    `);
    
    res.json(alumnos);
  } catch (error) {
    console.error('💥 Error en alumnos-progreso:', error);
    res.status(500).json({ error: 'Error al cargar el progreso de los alumnos' });
  }
});

export default router;
