console.log('🔥 [AUTH.JS] ARCHIVO CARGANDO...');

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

import {
    loginDocente,
    getAdminData,
    updateAdminData,
    getAllUsers,
    deleteUser
} from "../controllers/authController.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

console.log('🔥 [AUTH ROUTES] Cargando rutas de auth...');

// ✅ RUTA DE PRUEBA - Para verificar que el router se monta
router.get('/test', (req, res) => {
    console.log('✅ GET /api/auth/test funciona');
    res.json({ msg: 'Auth routes funcionando' });
});

// ✅ REGISTRO - Guarda en la tabla correcta según el rol
router.post('/registrar', async (req, res) => {
    try {
        const { nombre, apellido, correo, contraseña, rol, telefono } = req.body;

        console.log('📝 [REGISTRO] Datos recibidos:', { correo, rol, telefono });

        if (!nombre || !apellido || !correo || !contraseña || !rol) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        // ✅ CORREGIDO: Tu tabla usuarios usa alumno_id, no id
        const [existeUsuario] = await pool.query('SELECT alumno_id FROM usuarios WHERE correo =?', [correo]);
        const [existeDocente] = await pool.query('SELECT docente_id FROM DOCENTE WHERE correo =?', [correo]);
        const [existeAlumno] = await pool.query('SELECT alumno_id FROM ALUMNO WHERE correo =?', [correo]);
        const [existeAdmin] = await pool.query('SELECT admin_id FROM ADMINISTRADOR WHERE usuario =?', [correo]);

        if (existeUsuario.length > 0 || existeDocente.length > 0 || existeAlumno.length > 0 || existeAdmin.length > 0) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        const hash = await bcrypt.hash(contraseña, 10);
        let result;

        // ✅ GUARDAR EN LA TABLA CORRECTA SEGÚN EL ROL
        if (rol === 'alumno') {
            [result] = await pool.query(
                'INSERT INTO ALUMNO (nombre, apellido, correo, contraseña, telefono) VALUES (?,?,?,?,?)',
                [nombre, apellido, correo, hash, telefono || '']
            );
            console.log('✅ [REGISTRO] Alumno guardado en tabla ALUMNO:', correo);
        }
        else if (rol === 'docente') {
            // ✅ AHORA SÍ INCLUYE telefono porque tu tabla ya lo tiene
            [result] = await pool.query(
                'INSERT INTO DOCENTE (nombre, apellido, correo, contraseña, telefono) VALUES (?,?,?,?,?)',
                [nombre, apellido, correo, hash, telefono || '']
            );
            console.log('✅ [REGISTRO] Docente guardado en tabla DOCENTE:', correo);
        }
        else if (rol === 'admin') {
            [result] = await pool.query(
                'INSERT INTO ADMINISTRADOR (nombre, apellido, usuario, contraseña) VALUES (?,?,?,?)',
                [nombre, apellido, correo, hash]
            );
            console.log('✅ [REGISTRO] Admin guardado en tabla ADMINISTRADOR:', correo);
        }
        else {
            return res.status(400).json({ message: 'Rol no válido' });
        }

        res.json({
            message: 'Usuario registrado exitosamente',
            id: result.insertId,
            rol: rol
        });
    } catch (error) {
        console.error('💥 [REGISTRO] Error completo:', error);
        console.error('💥 [REGISTRO] SQL Message:', error.sqlMessage);
        res.status(500).json({
            message: 'Error al registrar usuario',
            detail: error.sqlMessage
        });
    }
});

// ✅ LOGIN PRINCIPAL - Busca en usuarios, DOCENTE, ADMINISTRADOR y ALUMNO
router.post("/login", async (req, res) => {
    console.log("📦 Body:", req.body);
    const { correo, contraseña } = req.body;

    try {
        let user = null;

        // ✅ CORREGIDO: Usa alumno_id como id porque así está tu tabla usuarios
        let [users] = await pool.query("SELECT alumno_id as id, nombre, apellido, correo, contraseña, rol, 'usuario' as tabla FROM usuarios WHERE correo =?", [correo]);

        if (users.length > 0) {
            user = users[0];
            console.log("✅ Usuario encontrado en usuarios:", user.correo, "Rol:", user.rol);
        }

        // 2. Si no está, buscar en DOCENTE
        if (!user) {
            [users] = await pool.query(
                "SELECT docente_id as id, nombre, apellido, correo, contraseña, 'docente' as rol, 'DOCENTE' as tabla FROM DOCENTE WHERE correo =?",
                [correo]
            );
            if (users.length > 0) {
                user = users[0];
                console.log("✅ Usuario encontrado en DOCENTE:", user.correo, "Rol:", user.rol);
            }
        }

        // 3. Si no está, buscar en ADMINISTRADOR
        if (!user) {
            [users] = await pool.query(
                "SELECT admin_id as id, nombre, apellido, usuario as correo, contraseña, 'admin' as rol, 'ADMINISTRADOR' as tabla FROM ADMINISTRADOR WHERE usuario =?",
                [correo]
            );
            if (users.length > 0) {
                user = users[0];
                console.log("✅ Usuario encontrado en ADMINISTRADOR:", user.correo, "Rol:", user.rol);
            }
        }

        // 4. Si no está, buscar en ALUMNO
        if (!user) {
            [users] = await pool.query(
                "SELECT alumno_id as id, nombre, apellido, correo, contraseña, 'alumno' as rol, 'ALUMNO' as tabla FROM ALUMNO WHERE correo =?",
                [correo]
            );
            if (users.length > 0) {
                user = users[0];
                console.log("✅ Usuario encontrado en ALUMNO:", user.correo, "Rol:", user.rol);
            }
        }

        if (!user) {
            console.log("❌ Usuario no encontrado en ninguna tabla:", correo);
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const validPassword = await bcrypt.compare(contraseña, user.contraseña);
        if (!validPassword) {
            console.log("❌ Contraseña incorrecta para:", correo);
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const token = jwt.sign(
            { id: user.id, rol: user.rol, correo: user.correo },
            process.env.JWT_SECRET || "secreto_temporal",
            { expiresIn: "24h" }
        );

        console.log("✅ Login exitoso para:", user.correo, "Rol:", user.rol, "Tabla:", user.tabla);
        res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                correo: user.correo,
                rol: user.rol
            },
            role: user.rol,
            success: true
        });

    } catch (error) {
        console.error("💥 Error en login:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
});

// ✅ LOGIN UNIVERSAL - Para miles de usuarios sin expiración
router.post('/login-universal', async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        const [users] = await pool.query(
            'SELECT * FROM usuarios WHERE correo =? AND activo = 1',
            [correo]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(contraseña, user.contraseña);
        if (!validPassword) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                rol: user.rol,
                correo: user.correo,
                nombre: user.nombre
            },
            process.env.JWT_SECRET
        );

        res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                correo: user.correo,
                rol: user.rol
            },
            role: user.rol
        });
    } catch (error) {
        console.error('Error login universal:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// TUS RUTAS ORIGINALES - NO LAS QUITÉ
router.post('/login/docente', loginDocente);

console.log('🔥 [AUTH ROUTES] POST /login/docente registrado');

// RUTAS PROTEGIDAS DE ADMIN
router.get('/admin/datos', verifyToken, verifyAdmin, getAdminData);
router.put('/admin/actualizar', verifyToken, verifyAdmin, updateAdminData);
router.get('/admin/usuarios', verifyToken, verifyAdmin, getAllUsers);
router.delete('/admin/usuarios/:id', verifyToken, verifyAdmin, deleteUser);

// RUTAS TEMPORALES
router.get('/fix-docente', async (req, res) => {
    try {
        const nuevoHash = await bcrypt.hash('123456', 10);
        const [result] = await pool.query(
            `UPDATE DOCENTE SET contraseña =? WHERE correo = 'saulmartinez@ejemplo.com'`,
            [nuevoHash]
        );
        const check = await bcrypt.compare('123456', nuevoHash);
        console.log('🔧 [FIX-DOCENTE] Filas afectadas:', result.affectedRows);
        res.json({ msg: 'Contraseña actualizada', password: '123456', test: check, filas_afectadas: result.affectedRows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/fix-admin', async (req, res) => {
    try {
        const nuevoHash = await bcrypt.hash('admin123', 10);
        const [result] = await pool.query(`UPDATE usuarios SET contraseña =? WHERE correo = 'saul@gmail.com'`, [nuevoHash]);
        const check = await bcrypt.compare('admin123', nuevoHash);
        res.json({ msg: 'Hash regenerado', test: check, filas_afectadas: result.affectedRows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/fix-saul', async (req, res) => {
    try {
        const nuevoHash = await bcrypt.hash('123456', 10);
        const [result] = await pool.query(`UPDATE usuarios SET contraseña =? WHERE correo = 'saul@gmail.com' AND rol = 'alumno'`, [nuevoHash]);
        if (result.affectedRows === 0) return res.status(404).json({ msg: 'No se encontró saul@gmail.com' });
        res.json({ msg: 'Arreglado solo saul@gmail.com', correo: 'saul@gmail.com', password: '123456' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

console.log('🔥 [AUTH ROUTES] Todas las rutas cargadas');

export default router;