// routes/alumno.routes.js
import express from "express";
import {
  obtenerDatosAlumno,
  obtenerCertificadosAlumno,
  actualizarDatosAlumno,
  cambiarPasswordAlumno,
  registrarAlumno,
  obtenerIntentosEvaluacion,
  guardarResultadoEvaluacion,
  reiniciarEvaluacionModulo,
  obtenerContenidosCompletados
} from "../controllers/alumnoController.js";
import { verifyToken } from "../middleware/auth.js";
import { consultarProgreso, guardarAvance, obtenerLeccion } from "../controllers/progresoController.js";

import { consultarEvaluacionGuiada, enviarEvaluacionGuiada } from "../controllers/evaluacionGuiadaController.js";

const router = express.Router();

// --- RUTA DE REGISTRO - NUEVOS ALUMNOS ---
router.post("/registrar", registrarAlumno);

// --- RUTAS DE CONSULTA ---
router.post("/progreso", verifyToken, consultarProgreso);
router.get("/progreso", verifyToken, consultarProgreso);
router.get(
  "/progreso/contenidos-completados/:correo",
  verifyToken,
  obtenerContenidosCompletados
);
router.post("/datos", obtenerDatosAlumno);
router.post("/certificados", obtenerCertificadosAlumno);

// ✅ RUTA: Validar y obtener contenido con bloqueo secuencial
router.get("/modulo/:modulo_id/contenido/:numero", verifyToken, obtenerLeccion);

// --- RUTAS DE ACTUALIZACIÓN ---
router.post("/actualizar", actualizarDatosAlumno);
router.post("/password", cambiarPasswordAlumno);

// --- RUTA DE PROGRESO ---
router.post("/progreso/actualizar", verifyToken, guardarAvance);

// --- RUTAS DE EVALUACIÓN ---
router.get("/modulo/:modulo_id/evaluacion", verifyToken, consultarEvaluacionGuiada);
router.post("/modulo/:modulo_id/evaluacion", verifyToken, enviarEvaluacionGuiada);
router.post("/evaluacion/intentos", verifyToken, obtenerIntentosEvaluacion);
router.post(["/evaluacion/resultado", "/evaluacion/guardar"], verifyToken, guardarResultadoEvaluacion);
router.post("/evaluacion/reiniciar", verifyToken, reiniciarEvaluacionModulo);

export default router;
