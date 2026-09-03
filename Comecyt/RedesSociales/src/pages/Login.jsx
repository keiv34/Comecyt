// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Login() {
    const [correo, setCorreo] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rolSeleccionado, setRolSeleccionado] = useState(null);
    const [modo, setModo] = useState('login');
    const [verPassword, setVerPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    // Estados para el formulario de registro
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');

    // Limpia token viejo/expirado al entrar al login
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp * 1000 < Date.now()) {
                    localStorage.clear();
                    console.log("🗑 Token expirado eliminado");
                }
            } catch {
                localStorage.clear();
                console.log("🗑 Token corrupto eliminado");
            }
        }
    }, []);

    const seleccionarRol = (rol) => {
        setRolSeleccionado(rol);
        setError('');
        setModo('login');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!rolSeleccionado) {
            setError('Selecciona un tipo de usuario');
            setLoading(false);
            return;
        }

        try {
            console.log("🔐 Intentando login con:", correo, "Rol:", rolSeleccionado);

            const result = await login(correo, contraseña);

            if (result.success) {
                console.log("✅ Login exitoso:", result);

                let redirectPath = '';
                if (result.role === 'alumno') {
                    redirectPath = '/inicio';
                } else if (result.role === 'docente') {
                    redirectPath = '/docente/inicio';
                } else if (result.role === 'admin') {
                    redirectPath = '/admin/inicio';
                }

                navigate(redirectPath);
            } else {
                setError(result.error || 'Correo o contraseña incorrectos');
            }

        } catch (error) {
            console.error("💥 Error en login:", error);
            setError('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleRegistro = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!nombre || !apellido || !correo || !contraseña) {
            setError('Todos los campos son obligatorios');
            setLoading(false);
            return;
        }

        try {
            console.log("📝 Registrando usuario:", correo, "Rol:", rolSeleccionado);

            const res = await axios.post(
                `${API_URL}/api/auth/registrar`, {
                nombre,
                apellido,
                correo,
                contraseña,
                telefono,
                rol: rolSeleccionado
            });

            console.log("✅ Registro exitoso:", res.data);
            alert('Registro exitoso como ' + rolSeleccionado + '. Ahora inicia sesión.');

            setNombre('');
            setApellido('');
            setTelefono('');
            setContraseña('');
            setModo('login');
            setError('');

        } catch (error) {
            console.error("💥 Error en registro:", error);
            setError(error.response?.data?.message || 'Error al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

    // ✅ BOTÓN PARA IR DIRECTO AL PANEL WHATSAPP SI YA ESTÁ LOGUEADO
    const handleWhatsappClick = () => {
        const token = localStorage.getItem('token');
        const rol = localStorage.getItem('rol');

        if (token && rol === 'admin') {
            navigate('/whatsapp-panel');
        } else {
            setError('Debes iniciar sesión como administrador primero');
        }
    };

    if (!rolSeleccionado) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a3d2e'
            }}>
                <div style={{
                    padding: '40px',
                    maxWidth: '400px',
                    width: '100%',
                    background: '#0f5742',
                    boxShadow: '0 0 30px rgba(0,255,170,0.3)',
                    borderRadius: '20px',
                    border: '2px solid #00ffaa'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'white',
                            borderRadius: '50%',
                            margin: '0 auto 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '40px',
                            color: '#0a3d2e'
                        }}>
                            Á
                        </div>
                        <h1 style={{ color: '#00ffaa', margin: '0', fontSize: '48px' }}>ÁGORA PRUEBA </h1>
                        <h2 style={{ color: 'white', margin: '10px 0' }}>Bienvenido</h2>
                        <p style={{ color: '#00ffaa' }}>¿Cómo deseas ingresar?</p>
                    </div>

                    <button
                        onClick={() => seleccionarRol('alumno')}
                        style={{
                            width: '100%',
                            padding: '15px',
                            marginBottom: '15px',
                            background: '#d0d0d0',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '18px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        👤 Alumno
                    </button>

                    <button
                        onClick={() => seleccionarRol('docente')}
                        style={{
                            width: '100%',
                            padding: '15px',
                            marginBottom: '15px',
                            background: '#d0d0d0',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '18px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        📋 Docente
                    </button>

                    <button
                        onClick={() => seleccionarRol('admin')}
                        style={{
                            width: '100%',
                            padding: '15px',
                            marginBottom: '15px',
                            background: '#d0d0d0',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '18px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        ⚙ Administrador
                    </button>

                    <button
                        onClick={handleWhatsappClick}
                        style={{
                            width: '100%',
                            padding: '15px',
                            background: '#25D366',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '18px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            fontWeight: 'bold'
                        }}
                    >
                        📱 Panel Dudas WhatsApp
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a3d2e'
        }}>
            <div style={{
                padding: '40px',
                maxWidth: '400px',
                width: '100%',
                background: '#0f5742',
                boxShadow: '0 0 30px rgba(0,255,170,0.3)',
                borderRadius: '20px',
                border: '2px solid #00ffaa'
            }}>
                <button
                    onClick={() => setRolSeleccionado(null)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#00ffaa',
                        cursor: 'pointer',
                        marginBottom: '20px',
                        fontSize: '16px'
                    }}
                >
                    ← Cambiar rol
                </button>

                <h2 style={{ textAlign: 'center', marginBottom: '10px', color: 'white' }}>
                    {modo === 'login' ? 'Iniciar Sesión' : 'Registro'} - {rolSeleccionado === 'alumno' ? 'Alumno' : rolSeleccionado === 'docente' ? 'Docente' : 'Administrador'}
                </h2>

                <div style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
                    <button
                        onClick={() => setModo('login')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: modo === 'login' ? '#00ffaa' : 'transparent',
                            color: modo === 'login' ? '#0a3d2e' : '#00ffaa',
                            border: '2px solid #00ffaa',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={() => setModo('registro')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: modo === 'registro' ? '#00ffaa' : 'transparent',
                            color: modo === 'registro' ? '#0a3d2e' : '#00ffaa',
                            border: '2px solid #00ffaa',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Registrarse
                    </button>
                </div>

                {modo === 'login' ? (
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ color: '#00ffaa' }}>Correo:</label>
                            <input
                                type="email"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                placeholder="correo@ejemplo.com"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    marginTop: '5px',
                                    border: '2px solid #00ffaa',
                                    borderRadius: '8px',
                                    background: '#0a3d2e',
                                    color: 'white',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ color: '#00ffaa' }}>Contraseña:</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={verPassword ? "text" : "password"}
                                    value={contraseña}
                                    onChange={(e) => setContraseña(e.target.value)}
                                    placeholder="••••••"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        marginTop: '5px',
                                        border: '2px solid #00ffaa',
                                        borderRadius: '8px',
                                        background: '#0a3d2e',
                                        color: 'white',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                <span
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '18px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setVerPassword(!verPassword)}
                                >
                                    {verPassword ? '🙈' : '👁'}
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div style={{
                                color: '#ff6b6b',
                                marginBottom: '15px',
                                padding: '10px',
                                background: '#5a1a1a',
                                borderRadius: '4px',
                                border: '1px solid #ff6b6b'
                            }}>
                                ❌ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '15px',
                                background: loading ? '#666' : '#00ffaa',
                                color: '#0a3d2e',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '18px',
                                fontWeight: 'bold'
                            }}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegistro}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ color: '#00ffaa' }}>Nombre:</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Juan"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    marginTop: '5px',
                                    border: '2px solid #00ffaa',
                                    borderRadius: '8px',
                                    background: '#0a3d2e',
                                    color: 'white',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ color: '#00ffaa' }}>Apellido:</label>
                            <input
                                type="text"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                placeholder="Pérez"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    marginTop: '5px',
                                    border: '2px solid #00ffaa',
                                    borderRadius: '8px',
                                    background: '#0a3d2e',
                                    color: 'white',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ color: '#00ffaa' }}>Correo:</label>
                            <input
                                type="email"
                                value={correo}
                                onChange={(e) => setCorreo(e.target.value)}
                                placeholder="correo@ejemplo.com"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    marginTop: '5px',
                                    border: '2px solid #00ffaa',
                                    borderRadius: '8px',
                                    background: '#0a3d2e',
                                    color: 'white',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ color: '#00ffaa' }}>Contraseña:</label>
                            <input
                                type="password"
                                value={contraseña}
                                onChange={(e) => setContraseña(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                required
                                minLength={6}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    marginTop: '5px',
                                    border: '2px solid #00ffaa',
                                    borderRadius: '8px',
                                    background: '#0a3d2e',
                                    color: 'white',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ color: '#00ffaa' }}>Teléfono (opcional):</label>
                            <input
                                type="text"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                placeholder="55 1234 5678"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    marginTop: '5px',
                                    border: '2px solid #00ffaa',
                                    borderRadius: '8px',
                                    background: '#0a3d2e',
                                    color: 'white',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {error && (
                            <div style={{
                                color: '#ff6b6b',
                                marginBottom: '15px',
                                padding: '10px',
                                background: '#5a1a1a',
                                borderRadius: '4px',
                                border: '1px solid #ff6b6b'
                            }}>
                                ❌ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '15px',
                                background: loading ? '#666' : '#00ffaa',
                                color: '#0a3d2e',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '18px',
                                fontWeight: 'bold'
                            }}
                        >
                            {loading ? 'Registrando...' : `Registrar como ${rolSeleccionado}`}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default Login;
