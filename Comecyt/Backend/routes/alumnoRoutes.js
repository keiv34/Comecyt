// routes/alumno.routes.js
import express from "express";
import {
  obtenerProgresoAlumno,
  obtenerDatosAlumno,
  obtenerCertificadosAlumno,
  actualizarDatosAlumno,
  cambiarPasswordAlumno,
  registrarAlumno,
  actualizarProgresoContenido,
  obtenerIntentosEvaluacion,
  guardarResultadoEvaluacion,
  reiniciarEvaluacionModulo,
  obtenerContenido,
  obtenerContenidosCompletados
} from "../controllers/alumnoController.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware para log de todas las peticiones a /api/alumno
router.use((req, res, next) => {
  console.log(`📍 [ALUMNO] ${req.method} ${req.path}`, req.body);
  next();
});

// Middleware para verificar token JWT
const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1]; // Bearer TOKEN

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_secreto_jwt');
    req.user = decoded; // Guarda {id, correo, role, iat, exp}
    next();
  } catch (error) {
    console.error('❌ Token inválido:', error.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// --- RUTA DE REGISTRO - NUEVOS ALUMNOS ---
router.post("/registrar", registrarAlumno);

// --- RUTAS DE CONSULTA ---
router.post("/progreso", obtenerProgresoAlumno);
router.get("/progreso", verificarToken, obtenerProgresoAlumno);
router.get(
  "/progreso/contenidos-completados/:correo",
  verificarToken,
  obtenerContenidosCompletados
);
router.post("/datos", obtenerDatosAlumno);
router.post("/certificados", obtenerCertificadosAlumno);

// ✅ RUTA: Validar y obtener contenido con bloqueo secuencial
router.get("/modulo/:modulo_id/contenido/:numero", verificarToken, obtenerContenido);

// --- RUTAS DE ACTUALIZACIÓN ---
router.post("/actualizar", actualizarDatosAlumno);
router.post("/password", cambiarPasswordAlumno);

// --- RUTA DE PROGRESO ---
router.post("/progreso/actualizar", actualizarProgresoContenido);

// --- RUTAS DE EVALUACIÓN ---
router.post("/evaluacion/intentos", obtenerIntentosEvaluacion);
router.post("/evaluacion/resultado", guardarResultadoEvaluacion);
router.post("/evaluacion/reiniciar", reiniciarEvaluacionModulo);

export default router;
