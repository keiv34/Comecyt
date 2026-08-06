import express from "express";
import path from "path";
import fs from "fs";
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CERTS_DIR = path.join(__dirname, '../Certificados');
const LOGO_PATH = path.join(__dirname, '../assets/logo.png');

if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true });
    console.log(`📁 Carpeta creada: ${CERTS_DIR}`);
}

// 🌸 Dibuja un adorno tipo "flor de puntos" en una esquina
function dibujarAdornoEsquina(doc, cx, cy, color, escalaX = 1, escalaY = 1) {
    doc.save();
    doc.fillColor(color);

    const anillos = [
        { radio: 60, puntos: 10, tam: 5, opacidad: 0.10 },
        { radio: 42, puntos: 8, tam: 6, opacidad: 0.16 },
        { radio: 24, puntos: 6, tam: 7, opacidad: 0.22 },
    ];

    anillos.forEach(anillo => {
        doc.opacity(anillo.opacidad);
        for (let i = 0; i < anillo.puntos; i++) {
            const angulo = (Math.PI / 2) * (i / (anillo.puntos - 1));
            const px = cx + Math.cos(angulo) * anillo.radio * escalaX;
            const py = cy + Math.sin(angulo) * anillo.radio * escalaY;
            doc.circle(px, py, anillo.tam).fill();
        }
    });

    doc.opacity(1);
    doc.restore();
}

router.post("/generar", async (req, res) => {
    const { alumno_id, modulo_id, nombre, apellido } = req.body;

    try {
        const nombreCompleto = `${nombre} ${apellido}`;

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

        const doc = new PDFDocument({
            size: 'A4',
            layout: 'landscape',
            margin: 0
        });

        const stream = fs.createWriteStream(rutaCompleta);
        doc.pipe(stream);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        const DORADO = '#C9A24D';
        const GUINDA = '#4a1525';
        const GRIS_TEXTO = '#444444';
        const GRIS_CLARO = '#888888';

        // Fondo base
        doc.rect(0, 0, pageWidth, pageHeight).fill('#fffdf8');

        // 🌸 Adornos decorativos en las 4 esquinas (dentro del marco)
        dibujarAdornoEsquina(doc, 55, 55, DORADO, 1, 1);
        dibujarAdornoEsquina(doc, pageWidth - 55, 55, DORADO, -1, 1);
        dibujarAdornoEsquina(doc, 55, pageHeight - 55, DORADO, 1, -1);
        dibujarAdornoEsquina(doc, pageWidth - 55, pageHeight - 55, DORADO, -1, -1);

        // 🖼️ Marca de agua muy tenue del logo detrás del contenido
        if (fs.existsSync(LOGO_PATH)) {
            doc.save();
            doc.opacity(0.06);
            const wmSize = 260;
            doc.image(LOGO_PATH, pageWidth / 2 - wmSize / 2, pageHeight / 2 - wmSize / 2, { width: wmSize });
            doc.opacity(1);
            doc.restore();
        }

        // 🟨 Marco doble
        doc.lineWidth(3).strokeColor(DORADO)
            .rect(25, 25, pageWidth - 50, pageHeight - 50).stroke();
        doc.lineWidth(1).strokeColor(DORADO)
            .rect(35, 35, pageWidth - 70, pageHeight - 70).stroke();

        // 🟢 Logo superior (normal, no marca de agua)
        if (fs.existsSync(LOGO_PATH)) {
            doc.image(LOGO_PATH, pageWidth / 2 - 45, 55, { width: 90 });
        }

        // ===== A PARTIR DE AQUÍ: todo texto de ancho completo usa x = 0 explícito =====

        doc.font('Helvetica-Bold').fontSize(38).fillColor(GUINDA)
            .text('CERTIFICADO', 0, fs.existsSync(LOGO_PATH) ? 155 : 90, {
                width: pageWidth,
                align: 'center'
            });

        doc.font('Helvetica').fontSize(14).fillColor(GRIS_TEXTO)
            .text('DE FINALIZACIÓN', 0, doc.y + 2, {
                width: pageWidth,
                align: 'center',
                characterSpacing: 2
            });

        doc.moveDown(1.5);
        doc.font('Helvetica').fontSize(14).fillColor(GRIS_TEXTO)
            .text('Se otorga el presente a:', 0, doc.y, {
                width: pageWidth,
                align: 'center'
            });

        doc.moveDown(0.8);
        doc.font('Times-BoldItalic').fontSize(34).fillColor(GUINDA)
            .text(nombreCompleto, 0, doc.y, {
                width: pageWidth,
                align: 'center'
            });

        doc.moveDown(1);
        doc.font('Helvetica').fontSize(15).fillColor(GRIS_TEXTO)
            .text('Por haber completado satisfactoriamente el curso', 0, doc.y, {
                width: pageWidth,
                align: 'center'
            });

        doc.moveDown(0.3);
        doc.font('Helvetica-Bold').fontSize(18).fillColor(GUINDA)
            .text('"Redes Sociales para Emprendedores"', 0, doc.y, {
                width: pageWidth,
                align: 'center'
            });

        // ✍️ Firma centrada
        const yFirma = pageHeight - 130;
        doc.strokeColor(GRIS_CLARO).lineWidth(1)
            .moveTo(pageWidth / 2 - 110, yFirma)
            .lineTo(pageWidth / 2 + 110, yFirma)
            .stroke();

        doc.font('Helvetica').fontSize(11).fillColor(GRIS_TEXTO)
            .text('FIRMA', pageWidth / 2 - 110, yFirma + 8, {
                width: 220,
                align: 'center'
            });

        // Fecha y folio
        doc.font('Helvetica').fontSize(11).fillColor(GRIS_CLARO)
            .text(`Fecha de emisión: ${new Date().toLocaleDateString('es-MX', {
                year: 'numeric', month: 'long', day: 'numeric'
            })}`, 0, pageHeight - 70, {
                width: pageWidth,
                align: 'center'
            });

        doc.fontSize(9).fillColor('#bbbbbb')
            .text(`Folio: AGORA-${alumno_id || 'X'}-${modulo_id || 'X'}-${Date.now()}`, 0, doc.y + 4, {
                width: pageWidth,
                align: 'center'
            });

        doc.end();

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
