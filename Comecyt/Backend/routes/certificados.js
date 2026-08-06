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

// ===== Config de textos =====
const INSTITUCION = 'Tecnológico de Estudios Superiores de San Felipe del Progreso';
const NOMBRE_CURSO = 'Alfabetización Digital en Redes Sociales';
const MODULOS_ACREDITADOS = [
    'Correo Electrónico',
    'Facebook',
    'WhatsApp Business',
    'Instagram',
    'Retos Educaplay'
];

// 🔷 Dibuja el clúster de "esquirlas" diagonales azules en una esquina.
function dibujarEsquinaGeometrica(doc, origin, dir) {
    const { x: ox, y: oy } = origin;

    doc.save();
    doc.translate(ox, oy);
    doc.scale(dir.x, dir.y);

    const franja = (w, h, angleDeg, color, opacity = 1) => {
        doc.save();
        doc.rotate(angleDeg);
        doc.opacity(opacity);
        doc.rect(0, -h / 2, w, h).fill(color);
        doc.opacity(1);
        doc.restore();
    };

    // Ajuste de colores para que coincida más con la imagen de referencia (tonos azules vibrantes)
    doc.opacity(1);
    doc.polygon([0, 0], [340, 0], [0, 250]).fill('#051d59'); // Azul muy oscuro de base

    franja(300, 55, -34, '#0a369d', 0.95);
    franja(260, 34, -34, '#0056e0', 0.9);
    franja(210, 18, -34, '#00a3ff', 0.85);
    franja(150, 8, -20, '#ffffff', 0.35);
    franja(120, 6, -46, '#00a3ff', 0.6);

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

        const pageWidth = doc.page.width;   // ~842
        const pageHeight = doc.page.height; // ~595

        const AZUL_CONSTANCIA = '#103b87';
        const GRIS_TEXTO = '#555555';
        const GRIS_CLARO = '#888888';

        // 1) Fondo general
        doc.rect(0, 0, pageWidth, pageHeight).fill('#f4f6f9');

        // 2) Esquinas geométricas (detrás de la tarjeta blanca)
        dibujarEsquinaGeometrica(doc, { x: pageWidth, y: 0 }, { x: -1, y: 1 });   // arriba-derecha
        dibujarEsquinaGeometrica(doc, { x: 0, y: pageHeight }, { x: 1, y: -1 });  // abajo-izquierda

        // 3) Tarjeta blanca central con sombra simulada
        const cardX = 60, cardY = 50;
        const cardW = pageWidth - cardX * 2;
        const cardH = pageHeight - cardY * 2;
        
        // Sombra sutil
        doc.rect(cardX + 5, cardY + 5, cardW, cardH).fill('#e0e4eb');
        // Tarjeta principal
        doc.rect(cardX, cardY, cardW, cardH).fill('#ffffff');

        // ===== Contenido =====
        
        let cursorY = cardY + 50;

        // Institución (Top, Itálica)
        doc.font('Helvetica-Oblique').fontSize(14).fillColor(GRIS_TEXTO)
            .text(INSTITUCION, cardX, cursorY, { width: cardW, align: 'center' });

        // Título CONSTANCIA
        cursorY = doc.y + 25;
        doc.font('Helvetica-Bold').fontSize(52).fillColor(AZUL_CONSTANCIA)
            .text('CONSTANCIA', cardX, cursorY, {
                width: cardW,
                align: 'center',
                characterSpacing: 14 // Letras separadas como en la imagen
            });

        // Párrafo descriptivo
        cursorY = doc.y + 20;
        doc.font('Helvetica').fontSize(14).fillColor(GRIS_TEXTO)
            .text(`Por haber concluido satisfactoriamente el curso de `, cardX + 70, cursorY, { width: cardW - 140, align: 'center', continued: true, lineGap: 4 })
            .font('Helvetica-Bold')
            .text(`${NOMBRE_CURSO}, `, { continued: true })
            .font('Helvetica')
            .text(`demostrando compromiso, participación activa y la adquisición de competencias digitales esenciales para el entorno actual.`);

        // Nombre del Alumno
        cursorY = doc.y + 40;
        doc.font('Helvetica-Bold').fontSize(24).fillColor('#222222')
            .text(nombreCompleto, cardX, cursorY, { width: cardW, align: 'center' });

        // Línea debajo del nombre
        const yFirma = doc.y + 8;
        doc.strokeColor(GRIS_TEXTO).lineWidth(1.5)
            .moveTo(pageWidth / 2 - 220, yFirma)
            .lineTo(pageWidth / 2 + 220, yFirma)
            .stroke();

        // Módulos Acreditados
        cursorY = yFirma + 30;
        doc.font('Helvetica-Bold').fontSize(12).fillColor(GRIS_TEXTO)
            .text('MÓDULOS ACREDITADOS', cardX, cursorY, {
                width: cardW,
                align: 'center',
                characterSpacing: 4
            });

        // Lista de Módulos
        cursorY = doc.y + 6;
        doc.font('Helvetica').fontSize(13).fillColor(GRIS_TEXTO)
            .text(MODULOS_ACREDITADOS.join('   '), cardX, cursorY, {
                width: cardW,
                align: 'center'
            });

        // Fecha de emisión y Folio (Abajo)
        const fechaTexto = new Date().toLocaleDateString('es-MX', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        
        doc.font('Helvetica-Oblique').fontSize(11).fillColor(GRIS_CLARO)
            .text(`Fecha de expedición: ${fechaTexto}`, cardX, cardY + cardH - 45, {
                width: cardW,
                align: 'center'
            });

        doc.font('Helvetica').fontSize(9).fillColor('#d3d3d3')
            .text(`Folio: AGORA-${alumno_id || 'X'}-${modulo_id || 'X'}-${Date.now()}`, cardX, doc.y + 5, {
                width: cardW,
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
