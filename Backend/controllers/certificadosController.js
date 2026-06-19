import { pool } from "../config/database.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

// Usar ruta relativa dentro del proyecto para ser portable en servidores
const CERTS_DIR = path.join(process.cwd(), 'Certificados');
const LOGO_PATH = path.resolve("assets/logo.png");

export const generarCertificado = async (req, res) => {
  try {
    const { correo, modulo_id, nombreModulo } = req.body;

    if (!correo || !modulo_id) {
      return res.status(400).json({
        message: "correo y modulo_id son obligatorios",
      });
    }

    // 🔍 Alumno - Trae nombre y apellido completos
    const [alumnos] = await pool.query(
      "SELECT alumno_id, nombre, apellido FROM ALUMNO WHERE correo =?",
      [correo]
    );

    if (alumnos.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    const alumno = alumnos[0];

    // ✅ CONSTRUIR NOMBRE COMPLETO - Maneja nulos y espacios
    const nombreCompleto = `${alumno.nombre?.trim() || ''} ${alumno.apellido?.trim() || ''}`.trim();

    if (!nombreCompleto) {
      return res.status(400).json({ message: "El alumno no tiene nombre registrado" });
    }

    // 🔐 VALIDAR SI YA EXISTE
    const [certificadoExistente] = await pool.query(
      `SELECT ruta_certificado 
       FROM CERTIFICADO 
       WHERE alumno_id =? AND modulo_id =?`,
      [alumno.alumno_id, modulo_id]
    );

    if (certificadoExistente.length > 0) {
      return res.json({
        message: "El certificado ya existe",
        archivo: certificadoExistente[0].ruta_certificado,
        url: `/certificados/${certificadoExistente[0].ruta_certificado}`,
        yaExistia: true,
      });
    }

    // 📄 Nombre del archivo único con ID
    const nombreArchivo = `certificado_${alumno.alumno_id}_mod${modulo_id}_${Date.now()}.pdf`;
    const rutaPDF = path.join(CERTS_DIR, nombreArchivo);

    // 📐 Crear PDF
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const stream = fs.createWriteStream(rutaPDF);
    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // 🟨 Marco dorado
    doc
      .lineWidth(4)
      .strokeColor("#C9A24D")
      .rect(30, 30, pageWidth - 60, pageHeight - 60)
      .stroke();

    doc
      .lineWidth(1)
      .rect(40, 40, pageWidth - 80, pageHeight - 80)
      .stroke();

    // 🟢 Logo
    if (fs.existsSync(LOGO_PATH)) {
      doc.image(LOGO_PATH, pageWidth / 2 - 60, 60, { width: 120 });
    }

    // 🟨 Título
    doc
      .moveDown(9)
      .font("Helvetica-Bold")
      .fontSize(32)
      .fillColor("#C9A24D")
      .text("CERTIFICADO", { align: "center" });

    doc
      .fontSize(14)
      .fillColor("#444")
      .text("DE TÉRMINO", { align: "center" });

    // Texto introductorio
    doc.moveDown(2);
    doc
      .font("Helvetica")
      .fontSize(14)
      .fillColor("#2F5D3A")
      .text("TENEMOS EL HONOR DE EXTENDER ESTE CERTIFICADO A", { align: "center" });

    // 🟢 NOMBRE COMPLETO DEL ALUMNO - Aquí va Julieta Alcántara Monroy, María Guadalupe García González, etc
    doc.moveDown(1.5);
    doc
      .font("Times-BoldItalic")
      .fontSize(32) // Un poco más chico por si es nombre largo
      .fillColor("#2F5D3A")
      .text(nombreCompleto, {
        align: "center",
        width: pageWidth - 100
      });

    // Texto curso
    doc.moveDown(1.5);
    doc
      .font("Helvetica")
      .fontSize(14)
      .fillColor("#444")
      .text(
        `Por concluir satisfactoriamente el programa:\n\n"${nombreModulo || 'Curso de Redes Sociales y Ciberseguridad ÁGORA'}"`,
        { align: "center" }
      );

    // ✅ TEXTO DE AGRADECIMIENTO
    doc.moveDown(2);
    doc
      .font("Helvetica-Oblique")
      .fontSize(12)
      .fillColor("#666")
      .text(
        "Agradecemos profundamente su compromiso, dedicación y esfuerzo durante todo el programa. " +
        "Su perseverancia lo convierte en un miembro valioso de la comunidad ÁGORA. " +
        "Le exhortamos a seguir aplicando estos conocimientos para crear un entorno digital más seguro.",
        { align: "center", width: pageWidth - 200 }
      );

    // ✍️ Firma única centrada
    doc.moveDown(3);
    const yFirma = doc.y;

    doc
      .strokeColor("#999")
      .lineWidth(1)
      .moveTo(pageWidth / 2 - 100, yFirma)
      .lineTo(pageWidth / 2 + 100, yFirma)
      .stroke();

    doc
      .fontSize(12)
      .fillColor("#555")
      .text("FIRMA", pageWidth / 2 - 100, yFirma + 10, { width: 200, align: "center" });

    // Fecha y folio
    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor("#999")
      .text(`Fecha de emisión: ${new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, { align: "center" });

    doc.moveDown(0.5);
    doc
      .fontSize(9)
      .fillColor("#BBB")
      .text(`Folio: AGORA-${alumno.alumno_id}-${modulo_id}-${Date.now()}`, { align: "center" });

    doc.end();

    // 🔒 GUARDAR UNA SOLA VEZ
    stream.on("finish", async () => {
      try {
        await pool.query(
          `INSERT INTO CERTIFICADO 
           (alumno_id, modulo_id, ruta_certificado, fecha_emision)
           VALUES (?,?,?, NOW())`,
          [alumno.alumno_id, modulo_id, nombreArchivo]
        );

        res.json({
          message: "Certificado generado correctamente",
          archivo: nombreArchivo,
          url: `/certificados/${nombreArchivo}`,
          nombreCompleto: nombreCompleto, // ✅ Para debug
          yaExistia: false,
        });
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.json({
            message: "Certificado ya existía",
            archivo: nombreArchivo,
            yaExistia: true,
          });
        }
        throw err;
      }
    });

  } catch (error) {
    console.error("Error al generar certificado:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};