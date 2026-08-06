import express from "express";
import path from "path";
import fs from "fs";
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';

const router = express.Router();

// ✅ Ruta que funciona en Mac, Windows y Linux
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CERTS_DIR = path.join(__dirname, '../Certificados');

// Logo opcional — si no existe el archivo, simplemente no se dibuja
const LOGO_PATH = path.join(__dirname, '../assets/logo.png');

// Crear carpeta si no existe
if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true });
    console.log(`📁 Carpeta creada: ${CERTS_DIR}`);
}

// ✅ Generar certificado - POST
router.post("/generar", async (req, res) => {
    const { alumno_id, modulo_id, nombre, apellido } = req.body;

    try {
        const nombreCompleto = `${nombre} ${apellido}`;

        // Limpiamos el nombre para evitar problemas de codificación en las URLs
        const nombreLimpio = nombreCompleto
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, '_');

        const nombreArchivo = `Certificado_AGORA_${nombreLimpio}.pdf`;
        const rutaCompleta = path.join(CERTS_DIR, nombreArchivo);

        console.log(`📍 Guardando en: ${rutaCompleta}`);

        if (fs.existsSync(rutaCompleta)) {
            fs.unlinkSync(rutaCompleta);
            console.log('🗑️ Archivo viejo eliminado');
        }

        // Crear PDF con PDFKit
        const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margin: 0
        });

        const stream = fs.createWriteStream(rutaCompleta);
        doc.pipe(stream);

        const pageWidth = doc.page.width;   // ~842
        const pageHeight = doc.page.height; // ~595

        // 🎨 Paleta
        const DORADO = '#C9A24D';
        const GUINDA = '#4a1525';
        const GRIS_TEXTO = '#444444';
        const GRIS_CLARO = '#888888';

        // 🟨 Fondo con marco doble decorativo
        doc.rect(0, 0, pageWidth, pageHeight).fill('#fffdf8');

        doc
            .lineWidth(3)
            .strokeColor(DORADO)
            .rect(25, 25, pageWidth - 50, pageHeight - 50)
            .stroke();

        doc
            .lineWidth(1)
            .strokeColor(DORADO)
            .rect(35, 35, pageWidth - 70, pageHeight - 70)
            .stroke();

        // 🟢 Logo (si existe)
        if (fs.existsSync(LOGO_PATH)) {
            doc.image(LOGO_PATH, pageWidth / 2 - 45, 55, { width: 90 });
        }

        // 🟨 Título
        doc
            .font('Helvetica-Bold')
            .fontSize(38)
            .fillColor(GUINDA)
            .text('CERTIFICADO', 0, fs.existsSync(LOGO_PATH) ? 155 : 90, {
                width: pageWidth,
                align: 'center'
            });

        doc
            .font('Helvetica')
            .fontSize(14)
            .fillColor(GRIS_TEXTO)
            .text('DE FINALIZACIÓN', 0, doc.y + 2, {
                width: pageWidth,
                align: 'center',
                characterSpacing: 2
            });

        // Texto introductorio
        doc
            .moveDown(1.5)
            .font('Helvetica')
            .fontSize(14)
            .fillColor(GRIS_TEXTO)
            .text('Se otorga el presente a:', {
                width: pageWidth,
                align: 'center'
            });

        // 🟢 Nombre del alumno
        doc
            .moveDown(0.8)
            .font('Times-BoldItalic')
            .fontSize(34)
            .fillColor(GUINDA)
            .text(nombreCompleto, 60, doc.y, {
                width: pageWidth - 120,
                align: 'center'
            });

        // Texto del curso
        doc
            .moveDown(1)
            .font('Helvetica')
            .fontSize(15)
            .fillColor(GRIS_TEXTO)
            .text('Por haber completado satisfactoriamente el curso', {
                width: pageWidth,
                align: 'center'
            });

        doc
            .moveDown(0.3)
            .font('Helvetica-Bold')
            .fontSize(18)
            .fillColor(GUINDA)
            .text('"Redes Sociales para Emprendedores"', {
                width: pageWidth,
                align: 'center'
            });

        // ✍️ Firma centrada
        const yFirma = pageHeight - 130;
        doc
            .strokeColor(GRIS_CLARO)
            .lineWidth(1)
            .moveTo(pageWidth / 2 - 110, yFirma)
            .lineTo(pageWidth / 2 + 110, yFirma)
            .stroke();

        doc
            .font('Helvetica')
            .fontSize(11)
            .fillColor(GRIS_TEXTO)
            .text('FIRMA', pageWidth / 2 - 110, yFirma + 8, {
                width: 220,
                align: 'center'
            });

        // Fecha y folio
        doc
            .font('Helvetica')
            .fontSize(11)
            .fillColor(GRIS_CLARO)
            .text(`Fecha de emisión: ${new Date().toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}`, 0, pageHeight - 70, {
                width: pageWidth,
                align: 'center'
            });

        doc
            .fontSize(9)
            .fillColor('#bbbbbb')
            .text(`Folio: AGORA-${alumno_id || 'X'}-${modulo_id || 'X'}-${Date.now()}`, 0, doc.y + 4, {
                width: pageWidth,
                align: 'center'
            });

        doc.end();

        // Esperar a que termine
        await new Promise((resolve, reject) => {
            stream.on('finish', () => {
                console.log(`✅ PDF generado correctamente`);
                resolve();
            });
            stream.on('error', (err) => {
                console.error("❌ Error en stream:", err);
                reject(err);
            });
        });

        // Verificar que el archivo tenga contenido
        const stats = fs.statSync(rutaCompleta);
        console.log(`📦 Tamaño del archivo: ${stats.size} bytes`);

        res.json({
            success: true,
            archivo: `/api/certificados/descargar/${nombreArchivo}`,
            mensaje: "Certificado generado correctamente"
        });

    } catch (error) {
        console.error("❌ Error generando certificado:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Listar certificados de un alumno - GET
router.get("/alumno/:alumno_id", (req, res) => {
    try {
        const archivos = fs.readdirSync(CERTS_DIR)
            .filter(file => file.endsWith('.pdf'))
            .map(file => ({
                nombre: file,
                url: `/certificados/${file}`
            }));

        res.json({ certificados: archivos });
    } catch (error) {
        res.status(500).json({ error: "No se pudieron listar los certificados" });
    }
});

// ✅ Descargar certificado específico - GET
router.get("/descargar/:nombre", (req, res) => {
    const { nombre } = req.params;
    const ruta = path.join(CERTS_DIR, nombre);

    if (fs.existsSync(ruta)) {
        res.download(ruta);
    } else {
        res.status(404).json({ error: "Certificado no encontrado" });
    }
});

export default router;
