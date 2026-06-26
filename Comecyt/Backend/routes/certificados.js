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
        const nombreArchivo = `Certificado_AGORA_${nombreCompleto}.pdf`;
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
            margin: 50
        });

        const stream = fs.createWriteStream(rutaCompleta);
        doc.pipe(stream);

        // ✅ COORDENADAS EXACTAS en lugar de align center
        doc.fontSize(40).text('CERTIFICADO COMECYT', 50, 100, {
            width: 740,
            align: 'center'
        });

        doc.fontSize(20).text('Se otorga el presente a:', 50, 200, {
            width: 740,
            align: 'center'
        });

        doc.fontSize(35).text(nombreCompleto, 50, 260, {
            width: 740,
            align: 'center'
        });

        doc.fontSize(16).text('Por haber completado satisfactoriamente el curso', 50, 330, {
            width: 740,
            align: 'center'
        });

        doc.fontSize(18).text('"Redes Sociales para Emprendedores"', 50, 360, {
            width: 740,
            align: 'center'
        });

        doc.fontSize(14).text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 50, 420, {
            width: 740,
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
            archivo: `/certificados/${nombreArchivo}`,
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