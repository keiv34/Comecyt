import PDFDocument from "pdfkit";
import { fileURLToPath } from "node:url";

const logoTecnm = fileURLToPath(new URL("../assets/logo-tecnm-transparente.png", import.meta.url));
const logoTessfp = fileURLToPath(new URL("../assets/logo-tessfp-transparente.png", import.meta.url));
export const VERSION_CONSTANCIA = "v2";

const verde = "#143D32";
const verdeClaro = "#D8EDB4";
const tinta = "#253B32";

export function crearConstancia({ alumno, modulo, fecha, folio }) {
  const doc = new PDFDocument({
    size: "A4", layout: "landscape", margin: 0,
    info: { Title: `Constancia · ${modulo.titulo}`, Author: "ÁGORA COMECYT" }
  });
  const { width, height } = doc.page;
  const nombre = [alumno.nombre, alumno.apellido].filter(Boolean).join(" ").trim();
  const centrado = { width: width - 150, align: "center" };

  doc.rect(0, 0, width, height).fill(verde);
  doc.polygon([0, height], [0, height - 112], [205, height]).fill("#21654E");
  doc.polygon([width, 0], [width - 190, 0], [width, 104]).fill("#21654E");
  doc.rect(26, 26, width - 52, height - 52).fill("#FAFCF8");
  doc.rect(35, 35, width - 70, height - 70).lineWidth(1).stroke("#B8CDBE");
  doc.image(logoTecnm, 55, 51, { fit: [112, 76], align: "left", valign: "center" });
  doc.image(logoTessfp, width - 167, 51, { fit: [112, 76], align: "right", valign: "center" });

  doc.font("Helvetica-Bold").fontSize(20).fillColor(verde)
    .text("ÁGORA · COMECYT", 75, 67, centrado);
  doc.font("Helvetica").fontSize(11).fillColor(tinta)
    .text("Tecnológico de Estudios Superiores de San Felipe del Progreso", 75, 98, centrado);
  doc.moveTo(80, 137).lineTo(width - 80, 137).strokeColor("#B8CDBE").stroke();

  doc.font("Helvetica-Bold").fontSize(42).fillColor(verde)
    .text("Constancia de acreditación", 75, 168, centrado);
  doc.font("Helvetica").fontSize(14).fillColor(tinta)
    .text("Se otorga a", 75, 232, centrado);

  let tamanoNombre = 33;
  doc.font("Helvetica-Bold").fontSize(tamanoNombre).fillColor(verde);
  while (doc.heightOfString(nombre, centrado) > 88 && tamanoNombre > 12) {
    doc.fontSize(--tamanoNombre);
  }
  doc.text(nombre, 75, 262, centrado);
  const bajoNombre = Math.max(doc.y + 15, 316);
  doc.roundedRect(width / 2 - 52, bajoNombre, 104, 4, 2).fill(verdeClaro);
  doc.font("Helvetica").fontSize(15).fillColor(tinta)
    .text("Por haber concluido satisfactoriamente el módulo", 75, bajoNombre + 25, centrado);
  doc.font("Helvetica-Bold").fontSize(27).fillColor(verde)
    .text(modulo.titulo, 75, bajoNombre + 54, centrado);

  const fechaTexto = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long", timeZone: "America/Mexico_City"
  }).format(fecha);
  doc.moveTo(80, 492).lineTo(width - 80, 492).strokeColor("#B8CDBE").stroke();
  doc.font("Helvetica-Bold").fontSize(10).fillColor(verde).text("FECHA DE EMISIÓN", 80, 507);
  doc.text("FOLIO", width - 270, 507, { width: 190, align: "right" });
  doc.font("Helvetica").fontSize(12).fillColor(tinta).text(fechaTexto, 80, 525);
  doc.text(folio, width - 270, 525, { width: 190, align: "right" });
  return doc;
}
