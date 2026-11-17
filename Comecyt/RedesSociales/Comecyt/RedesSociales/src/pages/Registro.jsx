// src/pages/Registro.jsx
import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Registro() {
    const [searchParams] = useSearchParams();
    const rol = searchParams.get('rol') || 'alumno';

    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");
    const [confirmar, setConfirmar] = useState("");
    const [telefono, setTelefono] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [verPass, setVerPass] = useState(false);
    const [verConfirm, setVerConfirm] = useState(false);
    const navigate = useNavigate();

    const tituloRol = rol === 'docente' ? 'Docente' : rol === 'admin' ? 'Administrador' : 'Alumno';

    const handleRegistro = async (e) => {
        e.preventDefault();
        setError("");

        if (!nombre.trim() || !apellido.trim() || !correo.trim() || !password || !confirmar) {
            setError("Todos los campos son obligatorios");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            setError("Formato de correo inválido");
            return;
        }

        if (password !== confirmar) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (password.length < 6) {
            setError("La contraseña debe tener mínimo 6 caracteres");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: nombre.trim(),
                    apellido: apellido.trim(),
                    correo: correo.toLowerCase().trim(),
                    contraseña: password,
                    telefono: telefono.trim(),
                    rol: rol
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Error al registrar');
            }

            alert(`✅ Registro exitoso como ${tituloRol}. Ahora inicia sesión.`);
            navigate("/login");

        } catch (err) {
            console.error('❌ Error registro:', err);
            setError(err.message || "Error al registrar. Verifica que el servidor esté corriendo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a4d3c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Arial, sans-serif',
            padding: '20px'
        }}>
            <div style={{
                background: 'rgba(0,0,0,0.3)',
                border: '2px solid #00ff88',
                borderRadius: '20px',
                padding: '40px',
                width: '90%',
                maxWidth: '400px',
                boxShadow: '0 0 30px #00ff88'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'white',
                        margin: '0 auto 15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: '#0a4d3c'
                    }}>Á</div>
                    <h1 style={{ color: '#00ff88', margin: '0 0 10px 0', fontSize: '2rem' }}>ÁGORA</h1>
                    <p style={{ color: 'white', margin: 0 }}>Registro de {tituloRol}</p>
                </div>

                <form onSubmit={handleRegistro}>
                    <input
                        type="text"
                        placeholder="Nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        autoComplete="given-name"
                        required
                        style={{ width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '10px', border: 'none', fontSize: '16px', boxSizing: 'border-box' }}
                    />
                    <input
                        type="text"
                        placeholder="Apellido"
                        value={apellido}
                        onChange={(e) => setApellido(e.target.value)}
                        autoComplete="family-name"
                        required
                        style={{ width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '10px', border: 'none', fontSize: '16px', boxSizing: 'border-box' }}
                    />
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        autoComplete="email"
                        required
                        style={{ width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '10px', border: 'none', fontSize: '16px', boxSizing: 'border-box' }}
                    />

                    <input
                        type="text"
                        placeholder="Teléfono (opcional)"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        style={{ width: '100%', padding: '14px', marginBottom: '12px', borderRadius: '10px', border: 'none', fontSize: '16px', boxSizing: 'border-box' }}
                    />

                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                        <input
                            type={verPass ? "text" : "password"}
                            placeholder="Contraseña (mínimo 6 caracteres)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            required
                            style={{ width: '100%', padding: '14px 45px 14px 14px', borderRadius: '10px', border: 'none', fontSize: '16px', boxSizing: 'border-box' }}
                        />
                        <span
                            onClick={() => setVerPass(!verPass)}
                            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '18px', userSelect: 'none' }}
                        >
                            {verPass ? "🙈" : "👁"}
                        </span>
                    </div>

                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                        <input
                            type={verConfirm ? "text" : "password"}
                            placeholder="Confirmar contraseña"
                            value={confirmar}
                            onChange={(e) => setConfirmar(e.target.value)}
                            autoComplete="new-password"
                            required
                            style={{ width: '100%', padding: '14px 45px 14px 14px', borderRadius: '10px', border: 'none', fontSize: '16px', boxSizing: 'border-box' }}
                        />
                        <span
                            onClick={() => setVerConfirm(!verConfirm)}
                            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '18px', userSelect: 'none' }}
                        >
                            {verConfirm ? "🙈" : "👁"}
                        </span>
                    </div>

                    {error && (
                        <p style={{
                            color: '#ff6b6b',
                            textAlign: 'center',
                            background: 'rgba(255,107,107,0.1)',
                            padding: '10px',
                            borderRadius: '8px',
                            marginBottom: '12px',
                            fontSize: '14px'
                        }}>
                            ⚠️ {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            borderRadius: '10px',
                            border: 'none',
                            background: loading ? '#ccc' : '#00ff88',
                            color: '#000',
                            fontWeight: 'bold',
                            fontSize: '16px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        {loading ? "Creando cuenta..." : `Registrarme como ${tituloRol}`}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p style={{ color: 'white', margin: '0 0 10px 0', fontSize: '14px' }}>
                        ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#00ff88', textDecoration: 'none', fontWeight: 'bold' }}>Inicia sesión</Link>
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        style={{
                            background: 'transparent',
                            border: '1px solid #00ff88',
                            color: '#00ff88',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            width: '100%'
                        }}
                    >
                        ← Volver al inicio
                    </button>
                </div>
            </div>
        </div>
    );
}