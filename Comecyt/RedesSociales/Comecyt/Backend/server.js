import express from 'express';
import cors from 'cors';
import { pool as db } from './config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

// ✅ RUTAS DE ALUMNO
import alumnoRoutes from './routes/alumno.routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// ===== MIDDLEWARES =====
const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:5177', 
  'http://localhost:5176',
  'https://comecyt.vercel.app',       // <--- Agregada
  'https://comecyt-wb2i.vercel.app'   // <--- Agregada (por si acaso)
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origen (como herramientas de API o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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

// LOG GLOBAL
app.use((req, res, next) => { console.log('🌐', req.method, req.url); next(); });

// Servir archivos estáticos
app.use('/certificados', express.static('public/certificados'));
app.use('/avatars', express.static('public/avatars'));

// ===== MONTAR RUTAS DE ALUMNO - UNA SOLA VEZ =====
app.use('/api/alumno', alumnoRoutes);

// ===== CONEXIÓN MYSQL =====
const conectarDB = async () => {
  console.log('✅ Conectado a PostgreSQL mediante config/database.js');
};

// ===== WEBHOOK WHATSAPP - VERIFICACIÓN GET =====
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ Webhook verificado');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verificación falló');
    res.sendStatus(403);
  }
});

// ===== WEBHOOK WHATSAPP - RECIBIR MENSAJES POST =====
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  try {
    const body = req.body;
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    const contacts = value?.contacts;

    if (messages && messages[0]) {
      const mensaje = messages[0];
      const telefono = mensaje.from;
      const texto = mensaje.text?.body || '';
      const nombre = contacts?.[0]?.profile?.name || 'Sin nombre';

      console.log('📱 Mensaje WhatsApp recibido:', telefono, texto);

      await db.execute(
        'INSERT INTO dudas_whatsapp (telefono, mensaje, fecha, estado, nombre, modulo) VALUES (?,?, NOW(),?,?,?)',
        [telefono, texto, 'nueva', nombre, '/whatsapp']
      );

      const respuesta = 'Gracias por tu mensaje. Un asesor de ÁGORA COMECYT te atenderá pronto. Para atención inmediata: 712 126 5349';
      await enviarWhatsApp(telefono, respuesta);
    }
  } catch (error) {
    console.error('❌ Error en webhook:', error.message);
  }
});

// ===== FUNCIÓN ENVIAR WHATSAPP =====
const enviarWhatsApp = async (telefono, mensaje) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: telefono,
          type: 'text',
          text: { body: mensaje }
        })
      }
    );
    const data = await response.json();
    console.log('✅ WhatsApp enviado:', data);
    return data;
  } catch (error) {
    console.error('❌ Error enviando mensaje:', error);
    throw error;
  }
};

// ===== API DUDAS WHATSAPP =====
app.get('/api/dudas', verificarToken, async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM dudas_whatsapp ORDER BY fecha DESC LIMIT 100');
    const stats = {
      total: rows.length,
      nuevas: rows.filter(r => r.estado === 'nueva').length,
      respondidas: rows.filter(r => r.estado === 'respondida').length,
      cerradas: rows.filter(r => r.estado === 'cerrada').length
    };
    console.log('📊 GET /api/dudas ->', rows.length);
    res.json({ dudas: rows, stats });
  } catch (error) {
    console.error('❌ Error GET:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/dudas/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, respuesta } = req.body;
    console.log('➡️ LLEGÓ PUT /api/dudas/' + id, 'estado=', estado);
    await db.execute(
      'UPDATE dudas_whatsapp SET estado =?, respuesta =?, fecha_respuesta = NOW() WHERE id =?',
      [estado, respuesta || null, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error PUT:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===== REGISTRO =====
app.post('/api/registro', async (req, res) => {
  const { nombre, apellido, correo, contraseña, rol } = req.body;

  if (!correo || !contraseña || !rol || !nombre) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (contraseña.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres' });
  }

  try {
    const [existe] = await db.execute('SELECT * FROM usuarios WHERE correo =?', [correo]);
    if (existe.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(contraseña, 10);

    const [result] = await db.execute(
      'INSERT INTO usuarios (nombre, apellido, correo, contraseña, rol) VALUES (?,?,?,?,?)',
      [nombre, apellido, correo, hash, rol]
    );

    const alumno_id = result.insertId;

    if (rol === 'alumno') {
      await db.execute(
        'INSERT INTO ALUMNO (correo, password, nombre, apellido) VALUES (?,?,?,?)',
        [correo, hash, nombre, apellido]
      );
      await db.execute(
        'INSERT INTO progreso_modulos (correo, modulo_id, progreso_actual) VALUES (?, 1, 0)',
        [correo]
      );
    } else if (rol === 'docente') {
      await db.execute(
        'INSERT INTO DOCENTE (correo, password, nombre, apellido) VALUES (?,?,?,?)',
        [correo, hash, nombre, apellido]
      );
    } else if (rol === 'administrador') {
      await db.execute(
        'INSERT INTO ADMINISTRADOR (correo, password, nombre, apellido) VALUES (?,?,?,?)',
        [correo, hash, nombre, apellido]
      );
    }

    console.log('✅ Usuario registrado:', correo, '- Rol:', rol);

    const token = jwt.sign(
      { id: alumno_id, rol, correo },
      process.env.JWT_SECRET || 'SECRET_POR_DEFECTO',
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      role: rol,
      alumno_id,
      nombre,
      correo
    });

  } catch (err) {
    console.error('💥 Error registro:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== LOGIN =====
app.post('/api/login', async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Correo y contraseña obligatorios' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE correo =?', [correo]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(contraseña, user.contraseña);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.rol) {
      return res.status(403).json({ error: 'Usuario sin rol asignado' });
    }

    console.log('✅ Login:', user.correo, '- Rol:', user.rol);

    const token = jwt.sign(
      { id: user.alumno_id, rol: user.rol, correo: user.correo },
      process.env.JWT_SECRET || 'SECRET_POR_DEFECTO',
      { expiresIn: '8h' }
    );

    res.json({
      token,
      role: user.rol,
      alumno_id: user.alumno_id,
      nombre: user.nombre,
      correo: user.correo
    });

  } catch (err) {
    console.error('💥 Error login:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== RUTA DE PRUEBA =====
app.get('/', (req, res) => {
  res.json({
    status: 'Backend COMECYT funcionando',
    database: process.env.DB_NAME,
    endpoints: [
      'GET /webhook',
      'POST /webhook',
      'GET /api/dudas',
      'PUT /api/dudas/:id',
      'POST /api/registro',
      'POST /api/login',
      'POST /api/alumno/registrar',
      'POST /api/alumno/progreso',
      'POST /api/alumno/progreso/actualizar',
      'POST /api/alumno/datos',
      'POST /api/alumno/certificados',
      'POST /api/alumno/actualizar',
      'POST /api/alumno/password',
      'POST /api/alumno/evaluacion/intentos',
      'POST /api/alumno/evaluacion/resultado',
      'POST /api/alumno/evaluacion/reiniciar'
    ]
  });
});

// ===== INICIAR SERVIDOR =====
conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📡 Webhook: http://localhost:${PORT}/webhook`);
    console.log(`📊 API Dudas: http://localhost:${PORT}/api/dudas`);
    console.log(`✅ API Registro: http://localhost:${PORT}/api/registro`);
    console.log(`📈 API Progreso: http://localhost:${PORT}/api/alumno/progreso\n`);
  });
});
