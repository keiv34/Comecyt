import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import { pool } from "./config/database.js";
import { OpenAI } from "openai";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from "jsonwebtoken";

// ✅ RUTAS - CORREGIDOS LOS NOMBRES
import authRoutes from "./routes/authRoutes.js";
import alumnoRoutes from "./routes/alumnoRoutes.js";
import modulosRoutes from "./routes/modulosRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import docenteRoutes from "./routes/docenteRoutes.js";
import certificadosRoutes from "./routes/certificados.js";

dotenv.config();

const app = express();

// Variables de WhatsApp
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Configuración OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const allowedOrigins = [
  "https://comecyt-wb2i.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

// ⚡ Configuración CORS - ACEPTA CUALQUIER LOCALHOST:* AUTOMÁTICAMENTE
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log("✅ CORS permitido:", origin);
        return callback(null, true);
      }

      console.log("❌ CORS bloqueado:", origin);
      return callback(new Error("No permitido por CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use('/avatars', express.static('public/avatars'));
// ✅ Carpeta pública para PDFs de certificados
const CERTS_DIR = path.join(process.cwd(), 'Certificados');
if (!fs.existsSync(CERTS_DIR)) {
  fs.mkdirSync(CERTS_DIR, { recursive: true });
}
app.use('/certificados', express.static(CERTS_DIR));

// ===== CONFIGURACIÓN MULTER PARA AVATARS =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/avatars';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // ✅ CORREGIDO: 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo imágenes JPG, PNG, WEBP'));
    }
  }
});

// ===== MIDDLEWARE VERIFICAR TOKEN =====
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_POR_DEFECTO');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

// 📝 Middleware para log global de requests
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\n[${timestamp}] 🌐 ${req.method} ${req.originalUrl}`);
  if ((req.method === 'POST' || req.method === 'PUT') && !req.originalUrl.includes('/webhook')) {
    console.log(`[${timestamp}] 📦 Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

// FUNCIÓN PARA ENVIAR TEXTO
async function enviarMensajeTexto(to, body) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: body }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Respuesta enviada a ${to}`);
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error.response?.data || error.message);
  }
}

// FUNCIÓN PARA ENVIAR BOTONES
async function enviarMenuBotones(to) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: "Hola 👋 Soy el bot de COMECYT 🤖\n¿En qué te ayudo hoy?"
          },
          action: {
            buttons: [
              { type: "reply", reply: { id: "beca_info", title: "🎓 Info Becas" } },
              { type: "reply", reply: { id: "convocatorias", title: "📋 Convocatorias" } },
              { type: "reply", reply: { id: "contacto", title: "📞 Contacto" } }
            ]
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Menú con botones enviado a ${to}`);
  } catch (error) {
    console.error('❌ Error enviando botones:', error.response?.data || error.message);
  }
}

// 👈 ACTUALIZADO: Guarda TODO en dudas_whatsapp para el panel
async function guardarMensaje(telefono, mensaje, nombre = 'Usuario WhatsApp', modulo = '/whatsapp') {
  try {
    await pool.query(
      'INSERT INTO mensajes_whatsapp (telefono, mensaje, fecha) VALUES (?,?, NOW())',
      [telefono, mensaje]
    );

    await pool.query(
      `INSERT INTO dudas_whatsapp (telefono, pregunta, fecha, estatus, nombre, modulo)
       VALUES (?,?, NOW(), 'nueva',?,?)`,
      [telefono, mensaje, nombre, modulo]
    );
    console.log(`📥 Mensaje guardado en panel: ${mensaje}`);
  } catch (error) {
    console.error('❌ Error guardando en BD:', error.message);
  }
}

// 👈 NUEVA FUNCIÓN: Responder desde el panel al WhatsApp del usuario
async function responderDesdePanel(telefono, respuesta, idDuda) {
  try {
    await enviarMensajeTexto(telefono, `*Respuesta de COMECYT:*\n\n${respuesta}`);
    await pool.query(
      `UPDATE dudas_whatsapp
       SET respuesta =?, estatus = 'respondida', fecha_respuesta = NOW()
       WHERE id =?`,
      [respuesta, idDuda]
    );
    console.log(`✅ Respuesta enviada a ${telefono}`);
    return true;
  } catch (error) {
    console.error('❌ Error respondiendo desde panel:', error.message);
    return false;
  }
}

// FUNCIÓN PARA CONSULTAR BECAS DE BD
async function obtenerBecasActivas() {
  try {
    const [rows] = await pool.query(
      "SELECT nombre, fecha_inicio, requisitos FROM becas WHERE estatus = 'activa'"
    );

    if (rows.length === 0) {
      return 'Por el momento no hay becas activas. Te aviso cuando abran las de 2026 ✅';
    }

    let respuesta = '🎓 *Becas Activas COMECYT 2026:*\n\n';
    rows.forEach(beca => {
      const fecha = new Date(beca.fecha_inicio).toLocaleDateString('es-MX');
      respuesta += `*${beca.nombre}*\n📅 Inicio: ${fecha}\n📋 Requisitos: ${beca.requisitos}\n\n`;
    });
    return respuesta;
  } catch (error) {
    console.error('❌ Error consultando BD:', error.message);
    return 'Error consultando becas. Intenta más tarde o visita comecyt.edomex.gob.mx';
  }
}

// 👈 ACTUALIZADO: IA ahora responde CUALQUIER COSA
async function respuestaIA(preguntaUsuario, telefono) {
  try {
    const prompt = `Eres el asistente oficial de COMECYT Estado de México 🤖

    REGLAS:
    1. Si te preguntan de becas, convocatorias, ciencia o tecnología del Edomex: responde con info oficial y menciona COMECYT.
    2. Si te preguntan de cultura general, historia, matemáticas, etc: responde normal como asistente útil.
    3. Sé breve, amable y en español. Máximo 4 líneas.
    4. Si te preguntan algo que requiere datos en tiempo real que no tienes, di: "No tengo esa info actualizada, revisa en internet o comecyt.edomex.gob.mx"

    Usuario pregunta: ${preguntaUsuario}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('❌ Error con IA:', error.message);
    return 'No pude procesar tu pregunta por un error técnico 😅\n\nUn asesor de COMECYT te contactará pronto.\n\nEscribe "menu" para ver opciones.';
  }
}

// ✅ Ruta principal de prueba
app.get("/", (req, res) => {
  res.send("Servidor Node.js funcionando correctamente 🌱");
});

// ✅ Ruta de health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// WEBHOOK DE WHATSAPP - VERIFICACIÓN GET
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    console.log('✅ WEBHOOK DE WHATSAPP VERIFICADO');
    res.status(200).send(challenge);
  } else {
    console.log('❌ VERIFY_TOKEN incorrecto');
    res.sendStatus(403);
  }
});

// WEBHOOK DE WHATSAPP - RECIBIR MENSAJES POST - ACTUALIZADO
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'whatsapp_business_account') {
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const contact = body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];

    if (message) {
      const from = message.from;
      const msgBody = message.text?.body;
      const buttonReply = message.interactive?.button_reply?.id;
      const nombreUsuario = contact?.profile?.name || 'Usuario WhatsApp';

      console.log(`📩 Mensaje de WhatsApp ${from} (${nombreUsuario}): ${msgBody || buttonReply}`);

      await guardarMensaje(from, msgBody || buttonReply || 'interacción', nombreUsuario);

      if (message.type === 'interactive' && buttonReply) {
        if (buttonReply === 'beca_info') {
          const infoBecas = await obtenerBecasActivas();
          await enviarMensajeTexto(from, infoBecas);
        } else if (buttonReply === 'convocatorias') {
          await enviarMensajeTexto(from, '📋 *Convocatorias COMECYT:*\n\n1. Beca Ciencia Edomex\n2. Posgrado Nacional\n3. Estancias de Investigación\n\nMás info: comecyt.edomex.gob.mx');
        } else if (buttonReply === 'contacto') {
          await enviarMensajeTexto(from, '📞 *Contacto COMECYT:*\n\nTel: 722 319 00 11\nEmail: contacto@comecyt.edomex.gob.mx\nHorario: Lun-Vie 9:00-18:00');
        }
      }
      else if (msgBody) {
        const texto = msgBody.toLowerCase();

        if (texto.includes('hola') || texto.includes('menu') || texto.includes('inicio')) {
          await enviarMenuBotones(from);
        }
        else if (texto.includes('beca')) {
          const infoBecas = await obtenerBecasActivas();
          await enviarMensajeTexto(from, infoBecas);
        }
        else {
          const respuesta = await respuestaIA(msgBody, from);
          await enviarMensajeTexto(from, respuesta);
        }
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// 👈 NUEVOS ENDPOINTS PARA EL PANEL DE DUDAS
app.get('/api/dudas', async (req, res) => {
  try {
    const [dudas] = await pool.query(`
      SELECT id, telefono, pregunta as mensaje, fecha, estatus as estado,
             nombre, modulo, respuesta, fecha_respuesta
      FROM dudas_whatsapp
      ORDER BY fecha DESC
    `);

    const [totales] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN estatus = 'nueva' THEN 1 ELSE 0 END) as nuevas,
        SUM(CASE WHEN estatus = 'respondida' THEN 1 ELSE 0 END) as respondidas,
        SUM(CASE WHEN estatus = 'cerrada' THEN 1 ELSE 0 END) as cerradas
      FROM dudas_whatsapp
    `);

    res.json({
      dudas,
      stats: totales[0]
    });
  } catch (error) {
    console.error('❌ Error obteniendo dudas:', error.message);
    res.status(500).json({ error: 'Error obteniendo dudas' });
  }
});

app.post('/api/dudas/responder', async (req, res) => {
  const { id, telefono, respuesta } = req.body;

  if (!id || !telefono || !respuesta) {
    return res.status(400).json({ error: 'Faltan datos: id, telefono, respuesta' });
  }

  const ok = await responderDesdePanel(telefono, respuesta, id);

  if (ok) {
    res.json({ success: true, message: 'Respuesta enviada por WhatsApp' });
  } else {
    res.status(500).json({ error: 'Error enviando respuesta' });
  }
});

app.put('/api/dudas/cerrar/:id', async (req, res) => {
  try {
    await pool.query(
      `UPDATE dudas_whatsapp SET estatus = 'cerrada' WHERE id =?`,
      [req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error cerrando duda' });
  }
});

app.delete('/api/dudas/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM dudas_whatsapp WHERE id =?`, [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando duda' });
  }
});

// ===== PROGRESO DEL ALUMNO - VERSIÓN FINAL CON MODULO EN MAYÚSCULAS =====
app.post('/api/alumno/progreso', verificarToken, async (req, res) => {
  const { correo } = req.body;
  console.log(`🔍 [PROGRESO] Consultando para: ${correo}`);

  try {
    // 1. Obtener módulos con progreso real - TABLA MODULO EN MAYÚSCULAS
    const [modulos] = await pool.query(`
      SELECT
        m.modulo_id,
        m.titulo,
        m.descripcion,
        COALESCE(p.progreso_actual, 0) as progreso_actual,
        m.total_contenidos
      FROM MODULO m
      LEFT JOIN progreso_modulos p ON m.modulo_id = p.modulo_id AND p.correo =?
      ORDER BY m.modulo_id ASC
    `, [correo]);

    console.log(`📊 [PROGRESO] Módulos encontrados:`, modulos);

    // 2. Obtener contenidos completados
    const [completados] = await pool.query(`
      SELECT modulo_id, contenido_id
      FROM contenidos_completados
      WHERE correo =?
    `, [correo]);

    // 3. Calcular estadísticas
    const modulosCompletados = modulos.filter(m => m.progreso_actual >= 100).length;
    const totalContenidos = modulos.reduce((acc, m) => acc + m.total_contenidos, 0);
    const contenidosCompletados = completados.length;
    const porcentajeGeneral = totalContenidos > 0
      ? Math.round((contenidosCompletados / totalContenidos) * 100)
      : 0;

    const respuesta = {
      modulos,
      contenidosCompletados: completados,
      estadisticas: {
        modulos_completados: modulosCompletados,
        total_modulos: modulos.length,
        contenidos_completados: contenidosCompletados,
        total_contenidos: totalContenidos,
        porcentaje_general: porcentajeGeneral
      }
    };

    console.log(`✅ [PROGRESO] Enviando:`, respuesta);
    res.json(respuesta);
  } catch (err) {
    console.error('❌ Error en /api/alumno/progreso:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== ACTUALIZAR PROGRESO - YA FUNCIONAL ===== ✅
app.post('/api/alumno/progreso/actualizar', verificarToken, async (req, res) => {
  const { correo, modulo_id, contenido_id } = req.body;

  try {
    // 1. Marcar contenido como completado
    await pool.query(
      'INSERT IGNORE INTO contenidos_completados (correo, modulo_id, contenido_id, fecha_completado) VALUES (?,?,?, NOW())',
      [correo, modulo_id, contenido_id]
    );

    // 2. Calcular nuevo progreso del módulo
    const [total] = await pool.query(
      'SELECT total_contenidos FROM MODULO WHERE modulo_id =?',
      [modulo_id]
    );

    const [completados] = await pool.query(
      'SELECT COUNT(*) as count FROM contenidos_completados WHERE correo =? AND modulo_id =?',
      [correo, modulo_id]
    );

    const totalContenidos = total[0].total_contenidos;
    const contenidosCompletados = completados[0].count;
    const nuevoProgreso = Math.round((contenidosCompletados / totalContenidos) * 100);

    // 3. Actualizar o insertar progreso
    await pool.query(`
      INSERT INTO progreso_modulos (correo, modulo_id, progreso_actual)
      VALUES (?,?,?)
      ON DUPLICATE KEY UPDATE progreso_actual =?
    `, [correo, modulo_id, nuevoProgreso, nuevoProgreso]);

    console.log(`✅ Progreso actualizado: ${correo} - Módulo ${modulo_id}: ${nuevoProgreso}%`);
    res.json({ success: true, progreso: nuevoProgreso });
  } catch (err) {
    console.error('❌ Error actualizando progreso:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/alumno/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const { alumno_id } = req.body;
    const avatarUrl = `/avatars/${req.file.filename}`;

    const [rows] = await pool.query('SELECT avatar FROM usuarios WHERE alumno_id =?', [alumno_id]);
    if (rows[0]?.avatar && rows[0].avatar.startsWith('/avatars/')) {
      const oldPath = path.join('public', rows[0].avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await pool.query('UPDATE usuarios SET avatar =? WHERE alumno_id =?', [avatarUrl, alumno_id]);

    console.log(`✅ Avatar actualizado para alumno_id: ${alumno_id}`);
    res.json({ success: true, avatar: avatarUrl });
  } catch (err) {
    console.error('Error /api/alumno/avatar:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/alumno/estadisticas', (req, res) => {
  console.log('✅ Backend SÍ tiene /estadisticas');
  res.json({
    modulos_completados: 3,
    total_modulos: 5,
    contenidos_completados: 15,
    total_contenidos: 29,
    examenes_aprobados: 2,
    total_examenes: 4,
    porcentaje_general: 58
  });
});

// ✅ Rutas de API - CORREGIDO EL PREFIJO
console.log('🔥 [SERVER] Montando /api/auth...');
app.use("/api/auth", authRoutes);

console.log('🔥 [SERVER] Montando /api/alumno...');
app.use("/api/alumno", alumnoRoutes);
app.use("/api/modulo", modulosRoutes);
app.use("/api/docente", docenteRoutes);
app.use("/api/admin", adminRoutes);
// ✅ AGREGADO: Ruta de certificados
app.use("/api/certificados", certificadosRoutes);

// ===== LISTAR TODAS LAS RUTAS REGISTRADAS - VERSIÓN SEGURA =====
function printRoutes() {
  if (!app._router) {
    console.log('⚠️ No hay rutas registradas aún');
    return;
  }

  console.log('\n=== RUTAS REGISTRADAS EN EXPRESS ===');
  const printStack = (stack, basePath = '') => {
    stack.forEach(r => {
      if (r.route) {
        const methods = Object.keys(r.route.methods).join(',').toUpperCase();
        console.log('🔍 RUTA:', methods, basePath + r.route.path);
      } else if (r.name === 'router' && r.handle.stack) {
        const match = r.regexp.toString().match(/^\/\^\\\/([^\\\/]*)/);
        const newBase = match ? basePath + '/' + match[1] : basePath;
        printStack(r.handle.stack, newBase);
      }
    });
  };
  printStack(app._router.stack);
  console.log('=====================================\n');
}

// 🚫 Middleware para rutas no encontradas
app.use((req, res) => {
  console.log(`❌ [404] Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
    method: req.method
  });
});

// 💥 Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('💥 [ERROR GLOBAL]:', err);
  console.error('💥 [ERROR GLOBAL] Stack:', err.stack);
  res.status(500).json({
    error: "Error interno del servidor",
    message: err.message
  });
});

const PORT = process.env.PORT || 4000;

// 🚀 Iniciar servidor con manejo de errores
const server = app.listen(PORT, () => {
  printRoutes(); // Ahora sí existe el router
  console.log(`\n========================================`);
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄 Base de datos: ${process.env.DB_NAME || 'bd_comecyt'}`);
  console.log(`🌐 CORS: Acepta cualquier localhost:*`);
  console.log(`📱 Webhook WhatsApp: http://localhost:${PORT}/webhook`);
  console.log(`🤖 Bot con Botones + BD + IA Libre + Panel de Dudas activado`);
  console.log(`📈 API Progreso: http://localhost:${PORT}/api/alumno/progreso`);
  console.log(`========================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ ERROR: El puerto ${PORT} ya está en uso`);
    console.error(`👉 Ejecuta: lsof -ti:${PORT} | xargs kill -9`);
  } else {
    console.error('❌ ERROR al iniciar servidor:', err);
  }
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👋 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    process.exit(0);
  });
});
