import { useEffect, useState } from 'react';
import axios from 'axios';

function PanelWhatsApp() {
    const [dudas, setDudas] = useState([]);
    const [stats, setStats] = useState(null);
    const [filtro, setFiltro] = useState('todas');
    const [loading, setLoading] = useState(true);

    // States para formulario manual
    const [mostrarForm, setMostrarForm] = useState(false);
    const [nuevaDuda, setNuevaDuda] = useState({
        nombre: '',
        telefono: '',
        mensaje: '',
        modulo: '/'
    });

    // ✅ NÚMERO NUEVO DEL BOT
    const BOT_WHATSAPP = '527121265349';
    const BOT_DISPLAY = '+52 712 126 5349';

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const statsRes = await axios.get('http://localhost:4000/api/admin/whatsapp/stats');
            setStats(statsRes.data);

            const url = filtro === 'todas'
                ? 'http://localhost:4000/api/admin/whatsapp/dudas'
                : `http://localhost:4000/api/admin/whatsapp/dudas/estado/${filtro}`;

            const dudasRes = await axios.get(url);
            setDudas(dudasRes.data);
        } catch (err) {
            console.error('💥 Error cargando datos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [filtro]);

    const registrarDudaManual = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:4000/api/admin/whatsapp/registrar-duda', nuevaDuda);
            setMostrarForm(false);
            setNuevaDuda({ nombre: '', telefono: '', mensaje: '', modulo: '/' });
            cargarDatos();
        } catch (err) {
            console.error('💥 Error:', err);
            alert('Error al registrar duda');
        }
    };

    const cambiarEstado = async (id, nuevoEstado) => {
        try {
            await axios.put(`http://localhost:4000/api/admin/whatsapp/dudas/${id}`, {
                estado: nuevoEstado
            });
            cargarDatos();
        } catch (err) {
            console.error('💥 Error actualizando:', err);
        }
    };

    const eliminarDuda = async (id) => {
        if (!confirm('¿Seguro que quieres eliminar esta duda?')) return;
        try {
            await axios.delete(`http://localhost:4000/api/admin/whatsapp/dudas/${id}`);
            cargarDatos();
        } catch (err) {
            console.error('💥 Error eliminando:', err);
        }
    };

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'nueva': return '#ff4444';
            case 'respondida': return '#ffaa00';
            case 'cerrada': return '#00C851';
            default: return '#666';
        }
    };

    if (loading) return <div>Cargando dudas...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>📱 Panel de Dudas WhatsApp</h1>

                {/* ✅ BOTÓN CON NÚMERO NUEVO 7121265349 */}
                <a
                    href={`https://wa.me/${BOT_WHATSAPP}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        background: '#25D366',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 'bold'
                    }}
                >
                    📱 Abrir Bot: {BOT_DISPLAY}
                </a>
            </div>

            {/* STATS */}
            {stats && (
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '8px' }}>
                        <h3>Total</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.total}</p>
                    </div>
                    <div style={{ background: '#ffe6e6', padding: '15px', borderRadius: '8px' }}>
                        <h3>Nuevas</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4444' }}>{stats.nuevas}</p>
                    </div>
                    <div style={{ background: '#fff4e6', padding: '15px', borderRadius: '8px' }}>
                        <h3>Respondidas</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffaa00' }}>{stats.respondidas}</p>
                    </div>
                    <div style={{ background: '#e6ffe6', padding: '15px', borderRadius: '8px' }}>
                        <h3>Cerradas</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#00C851' }}>{stats.cerradas}</p>
                    </div>
                </div>
            )}

            {/* Botón Nueva Duda Manual */}
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => setMostrarForm(!mostrarForm)}
                    style={{
                        background: '#00ffcc',
                        color: '#000',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    + Nueva Duda Manual
                </button>
            </div>

            {/* Formulario de nueva duda */}
            {mostrarForm && (
                <form onSubmit={registrarDudaManual} style={{
                    background: '#2a2a2a',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Nombre"
                            value={nuevaDuda.nombre}
                            onChange={(e) => setNuevaDuda({ ...nuevaDuda, nombre: e.target.value })}
                            required
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444' }}
                        />
                        <input
                            type="text"
                            placeholder="Teléfono: 525512345678"
                            value={nuevaDuda.telefono}
                            onChange={(e) => setNuevaDuda({ ...nuevaDuda, telefono: e.target.value })}
                            required
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #444' }}
                        />
                    </div>
                    <textarea
                        placeholder="Mensaje de WhatsApp"
                        value={nuevaDuda.mensaje}
                        onChange={(e) => setNuevaDuda({ ...nuevaDuda, mensaje: e.target.value })}
                        required
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', marginTop: '10px', minHeight: '80px' }}
                    />
                    <input
                        type="text"
                        placeholder="Módulo (opcional)"
                        value={nuevaDuda.modulo}
                        onChange={(e) => setNuevaDuda({ ...nuevaDuda, modulo: e.target.value })}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', marginTop: '10px' }}
                    />
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{
                            background: '#00C851',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>
                            Guardar Duda
                        </button>
                        <button type="button" onClick={() => setMostrarForm(false)} style={{
                            background: '#666',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* FILTROS */}
            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setFiltro('todas')} style={{ marginRight: '10px', background: filtro === 'todas' ? '#007bff' : '#e0e0e0', color: filtro === 'todas' ? 'white' : 'black', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Todas</button>
                <button onClick={() => setFiltro('nueva')} style={{ marginRight: '10px', background: filtro === 'nueva' ? '#ff4444' : '#e0e0e0', color: filtro === 'nueva' ? 'white' : 'black', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Nuevas</button>
                <button onClick={() => setFiltro('respondida')} style={{ marginRight: '10px', background: filtro === 'respondida' ? '#ffaa00' : '#e0e0e0', color: filtro === 'respondida' ? 'white' : 'black', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Respondidas</button>
                <button onClick={() => setFiltro('cerrada')} style={{ background: filtro === 'cerrada' ? '#00C851' : '#e0e0e0', color: filtro === 'cerrada' ? 'white' : 'black', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cerradas</button>
            </div>

            {/* TABLA DE DUDAS */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f0f0f0' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Teléfono</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Mensaje</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Módulo</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {dudas.length === 0 ? (
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                No hay dudas {filtro !== 'todas' && `con estado "${filtro}"`}
                            </td>
                        </tr>
                    ) : (
                        dudas.map((duda) => (
                            <tr key={duda.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                <td style={{ padding: '10px' }}>{new Date(duda.fecha).toLocaleString('es-MX')}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{duda.nombre}</td>
                                <td style={{ padding: '10px' }}>
                                    <a href={`https://wa.me/${duda.telefono}`} target="_blank" rel="noopener noreferrer">
                                        {duda.telefono}
                                    </a>
                                </td>
                                <td style={{ padding: '10px', maxWidth: '300px' }}>{duda.mensaje}</td>
                                <td style={{ padding: '10px' }}>{duda.modulo}</td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{ background: getEstadoColor(duda.estado), color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                                        {duda.estado.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '10px' }}>
                                    {duda.estado === 'nueva' && (
                                        <button onClick={() => cambiarEstado(duda.id, 'respondida')} style={{ marginRight: '5px', background: '#ffaa00', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                            Marcar Respondida
                                        </button>
                                    )}
                                    {duda.estado === 'respondida' && (
                                        <button onClick={() => cambiarEstado(duda.id, 'cerrada')} style={{ marginRight: '5px', background: '#00C851', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                            Cerrar
                                        </button>
                                    )}
                                    <button onClick={() => eliminarDuda(duda.id)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default PanelWhatsApp;