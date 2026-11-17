import express from "express";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buffer } from "node:stream/consumers";
import { pool } from "../config/database.js";
import { verifyAlumno, verifyToken } from "../middleware/auth.js";
import { cargarAvance } from "../controllers/progresoController.js";
import { catalogo, idEnConflicto } from "../services/catalogo.js";
import { modulosAprobados } from "../services/acreditacion.js";
import { crearConstancia, VERSION_CONSTANCIA } from "../services/constanciaPdf.js";

const router = express.Router();
const directorio = fileURLToPath(new URL("../Certificados/", import.meta.url));
const archivoAgora = /^Constancia_AGORA_M\d+_(?:v\d+_)?[a-f0-9-]{36}\.pdf$/;

router.post("/generar", verifyToken, verifyAlumno, async (req, res) => {
  const moduloId = Number(req.body?.modulo_id);
  const definicion = catalogo.find(modulo => modulo.id === moduloId);
  if (!definicion) return res.status(400).json({ error: "Selecciona un módulo válido." });

  const db = await pool.getConnection();
  let archivoCreado;
  let confirmado = false;
  try {
    await db.beginTransaction();
    const [[alumno]] = await db.query(
      "SELECT alumno_id, nombre, apellido FROM ALUMNO WHERE correo = ? FOR UPDATE", [req.user.correo]
    );
    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado." });

    const [[modulo]] = await db.query("SELECT titulo, total_contenidos FROM MODULO WHERE modulo_id = ?", [moduloId]);
    if (!modulo || idEnConflicto(moduloId, modulo.titulo) || modulo.total_contenidos !== definicion.lecciones.length) {
      return res.status(409).json({ error: "El catálogo de MySQL requiere sincronización." });
    }

    const [[existente]] = await db.query(
      "SELECT certificado_id, fecha_emision, ruta_certificado FROM CERTIFICADO WHERE alumno_id = ? AND modulo_id = ?",
      [alumno.alumno_id, moduloId]
    );
    let archivo = existente?.ruta_certificado;
    let pdf;
    if (archivo) {
      pdf = await readFile(path.join(directorio, path.win32.basename(archivo))).catch(error => {
        if (error.code !== "ENOENT") throw error;
        return null;
      });
    }

    if (archivoAgora.test(archivo)) {
      if (!archivo.startsWith(`Constancia_AGORA_M${moduloId}_${VERSION_CONSTANCIA}_`)) pdf = null;
    } else {
      const avance = await cargarAvance(db, req.user.correo, moduloId, modulo.total_contenidos);
      const aprobados = await modulosAprobados(db, alumno.alumno_id);
      if (avance.size === modulo.total_contenidos && aprobados.has(moduloId)) {
        pdf = null;
      } else if (!pdf) {
        return res.status(403).json({ error: "Completa las lecciones y aprueba la evaluación del módulo para obtener tu constancia." });
      }
    }

    if (!pdf) {
      const folio = `AGORA-M${moduloId}-${alumno.alumno_id}`;
      const doc = crearConstancia({
        alumno, modulo: definicion, fecha: existente?.fecha_emision ?? new Date(), folio
      });
      const contenido = buffer(doc);
      doc.end();
      pdf = await contenido;
      archivo = `Constancia_AGORA_M${moduloId}_${VERSION_CONSTANCIA}_${randomUUID()}.pdf`;
      archivoCreado = path.join(directorio, archivo);
      await writeFile(archivoCreado, pdf, { flag: "wx" });
      await db.query(`
        INSERT INTO CERTIFICADO (alumno_id, modulo_id, ruta_certificado)
        VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE ruta_certificado = ?
      `, [alumno.alumno_id, moduloId, archivo, archivo]);
    }

    await db.commit();
    confirmado = true;
    return res.attachment(`Constancia_AGORA_Modulo_${moduloId}.pdf`).send(pdf);
  } finally {
    try {
      if (!confirmado) {
        await db.rollback();
        if (archivoCreado) {
          await unlink(archivoCreado).catch(error => {
            if (error.code !== "ENOENT") console.error("No se pudo retirar la constancia temporal:", error);
          });
        }
      }
    } finally {
      db.release();
    }
  }
});

router.get("/descargar/:nombre", (req, res) => {
  const { nombre } = req.params;
  if (nombre !== path.basename(nombre) || !nombre.endsWith(".pdf")) {
    return res.status(404).json({ error: "Constancia no encontrada." });
  }
  return res.download(nombre, { root: directorio }, error => {
    if (error && !res.headersSent) res.status(error.status === 404 ? 404 : 500).json({ error: "No se pudo abrir la constancia." });
  });
});

export default router;
