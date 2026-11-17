import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function DudasWhatsApp() {
    const [dudas, setDudas] = useState([]);
    const [stats, setStats] = useState({ total: 0, nuevas: 0, respondidas: 0, cerradas: 0 });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

    const cargarDudas = async () => {
        try {
            const token = localStorage.getItem('token'); // ✅ AGREGUÉ ESTA LÍNEA
            const response = await axios.get(`${API_URL}/api/dudas`, { // ✅ AGREGUÉ HEADERS
                headers: { Authorization: `Bearer ${token}` }
            });
            setDudas(response.data.dudas || []);
            setStats(response.data.stats || {});
        } catch (err) {
            setError('Error: ' + err.message);
            if (err.response?.status === 401) { // ✅ AGREGUÉ ESTO
                logout();
                navigate('/login');
            }
        } finally { setCargando(false); }
    };

    const actualizarEstado = async (id, nuevoEstado) => {
        try {
            const token = localStorage.getItem('token'); // ✅ AGREGUÉ ESTA LÍNEA
            await axios.put(`${API_URL}/api/dudas/${id}`, { estado: nuevoEstado }, { // ✅ AGREGUÉ HEADERS
                headers: { Authorization: `Bearer ${token}` }
            });
            cargarDudas(); // recarga
        } catch (err) {
            console.error(err);
            alert('No se pudo actualizar: ' + err.message);
            if (err.response?.status === 401) { // ✅ AGREGUÉ ESTO
                logout();
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        cargarDudas();
        const intervalo = setInterval(cargarDudas, 5000);
        return () => clearInterval(intervalo);
    }, []);

    const formatearFecha = (fecha) => new Date(fecha).toLocaleString('es-MX');
    const getColorEstado = (estado) => ({ nueva: '#ff4444', respondida: '#ffaa00', cerrada: '#00C851' }[estado] || '#666');

    if (cargando) return <div style={{ padding: '40px', textAlign: 'center' }}><h2>🔄 Cargando...</h2></div>;
    if (error) return <div style={{ padding: '40px' }}><div style={{ background: '#ff4444', color: 'white', padding: '20px', borderRadius: '8px' }}>❌ {error}</div></div>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1>📱 Panel Dudas WhatsApp</h1>
                <button onClick={() => { logout(); navigate('/login'); }} style={{ background: '#ff4444', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cerrar Sesión</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '15px', marginBottom: '30px' }}>
                <div style={{ background: '#2196F3', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.total}</div>
                    <div>Total</div>
                </div>
                <div style={{ background: '#ff4444', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.nuevas}</div>
                    <div>Nuevas</div>
                </div>
                <div style={{ background: '#ffaa00', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.respondidas}</div>
                    <div>Respondidas</div>
                </div>
                <div style={{ background: '#00C851', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px' }}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.cerradas}</div>
                    <div>Cerradas</div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Mensajes Recientes</h2>
                <button onClick={cargarDudas} style={{ background: '#2196F3', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>🔄 Actualizar</button>
            </div>

            <table style={{ width: '100%', background: 'white', borderCollapse: 'collapse', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <thead>
                    <tr style={{ background: '#2E7D32', color: 'white' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Fecha</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Teléfono</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Nombre</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Mensaje</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Estado</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {dudas.map(d => (
                        <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px' }}>{formatearFecha(d.fecha)}</td>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{d.telefono}</td>
                            <td style={{ padding: '12px' }}>{d.nombre}</td>
                            <td style={{ padding: '12px', maxWidth: '300px' }}>{d.mensaje}</td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                <span style={{ background: getColorEstado(d.estado), color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', textTransform: 'uppercase' }}>
                                    {d.estado}
                                </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                {d.estado === 'nueva' && (
                                    <button onClick={() => actualizarEstado(d.id, 'respondida')} style={{ background: '#ffaa00', color: 'white', padding: '6px 12px', margin: '2px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Responder
                                    </button>
                                )}
                                {d.estado !== 'cerrada' && (
                                    <button onClick={() => actualizarEstado(d.id, 'cerrada')} style={{ background: '#00C851', color: 'white', padding: '6px 12px', margin: '2px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Cerrar
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {dudas.length === 0 && !cargando && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No hay dudas registradas</div>
            )}
        </div>
    );
}

export default DudasWhatsApp;