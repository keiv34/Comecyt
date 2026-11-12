import seguridad from "../assets/lecciones-guiadas/seguridad.jpg";
import drive from "../assets/lecciones-guiadas/drive.jpg";
import linkedin from "../assets/lecciones-guiadas/linkedin.jpg";
import transporte from "../assets/lecciones-guiadas/transporte.jpg";
import ia from "../assets/lecciones-guiadas/ia.jpg";

const ilustraciones = {
  7: {
    url: seguridad,
    columnas: 3,
    descripciones: [
      "Computadora con una cuenta protegida y documentos privados",
      "Teléfono con un aviso sospechoso",
      "Verificación de un pago antes de entregar un pedido",
      "Segundo factor de autenticación con un teléfono",
      "Router doméstico junto a una computadora protegida",
      "Persona que contacta al banco y reúne evidencia"
    ]
  },
  8: {
    url: drive,
    columnas: 2,
    descripciones: [
      "Vista ilustrativa de carpetas organizadas en Google Drive",
      "Documento colaborativo con comentarios y participantes",
      "Videollamada de equipo con una presentación compartida"
    ]
  },
  9: {
    url: linkedin,
    columnas: 2,
    descripciones: [
      "Vista ilustrativa de un perfil profesional con experiencia y aptitudes",
      "Vista ilustrativa de contactos e invitaciones profesionales",
      "Búsqueda de empleo con filtros y una lista de vacantes"
    ]
  },
  10: {
    url: transporte,
    columnas: 2,
    descripciones: [
      "Pasajera que compara los datos del viaje con la placa del vehículo",
      "Pasajero con cinturón que consulta el trayecto en la aplicación",
      "Repartidor que entrega un pedido de comida"
    ]
  },
  11: {
    url: ia,
    columnas: 2,
    descripciones: [
      "Dos asistentes de inteligencia artificial abiertos en una computadora",
      "Vista ilustrativa de una instrucción y una respuesta en un asistente",
      "Persona que contrasta información en dos fuentes"
    ]
  }
};

export function imagenLeccion(moduloId, numero) {
  const { url, columnas, descripciones } = ilustraciones[moduloId];
  return {
    url,
    columnas,
    columna: (numero - 1) % columnas,
    fila: Math.floor((numero - 1) / columnas),
    descripcion: descripciones[numero - 1]
  };
}
