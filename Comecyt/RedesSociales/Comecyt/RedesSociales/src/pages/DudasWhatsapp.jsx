import { useState, useEffect } from 'react';
import axios from 'axios';

const DudasWhatsapp = () => {
    const [dudas, setDudas] = useState([]);
    const [stats, setStats] = useState({ total: 0, nuevas: 0, respondidas: 0, cerradas: 0 });
    const [filtro, setFiltro] = useState('todas');
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    const API_URL = 'http://localhost:4000/api/dudas';

    const cargarDudas = async () => {
        try {
            setError('');
            const { data } = await axios.get(API_URL);

            // Tu API regresa {dudas: [...], stats: {...}}
            setDudas(data.dudas || []);
            setStats(data.stats || { total: 0, nuevas: 0, respondidas: 0, cerradas: 0 });

            console.log('✅ Dudas:', data.dudas);
        } catch (error) {
            console.error('Error:', error);
            setError('No se pudo conectar al servidor');
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDudas();
        const interval = setInterval(cargarDudas, 10000);
        return () => clearInterval(interval);
    }, []);

    const cambiarEstado = async (id, nuevoEstado) => {
        try {
            await axios.put(`${API_URL}/${id}`, { estado: nuevoEstado });
            cargarDudas();
        } catch (error) {
            console.error('Error actualizando:', error);
            alert('Error al actualizar el estado');
        }
    };

    const dudasFiltradas = dudas.filter(d => {
        if (filtro === 'todas') return true;
        if (filtro === 'nuevas') return d.estado === 'nueva';
        if (filtro === 'respondidas') return d.estado === 'respondida';
        if (filtro === 'cerradas') return d.estado === 'cerrada';
        return true;
    });

    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (cargando) return <div style={{ padding: '40px', textAlign: 'center' }}><h2>Cargando dudas...</h2></div>;
    if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}><h2>❌ {error}</h2></div>;

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0 }}>📱 Dudas WhatsApp - COMECYT</h1>
                <button
                    onClick={cargarDudas}
                    style={{
                        padding: '10px 20px',
                        background: '#00ffcc',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    🔄 Actualizar
                </button>
            </div>

            {/* Contadores usando stats del backend */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', borderTop: '4px solid #ff9800', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff9800' }}>{stats.nuevas}</div>
                    <div style={{ color: '#666', marginTop: '5px' }}>Nuevas</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', borderTop: '4px solid #4caf50', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4caf50' }}>{stats.respondidas}</div>
                    <div style={{ color: '#666', marginTop: '5px' }}>Respondidas</div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', borderTop: '4px solid #2196f3', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2196f3' }}>{stats.cerradas}</div>
                    <div style={{ color: '#666', marginTop: '5px' }}>Cerradas</div>
                </div>
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {[
                    { key: 'todas', label: 'Todas', count: stats.total },
                    { key: 'nuevas', label: 'Nuevas', count: stats.nuevas },
                    { key: 'respondidas', label: 'Respondidas', count: stats.respondidas },
                    { key: 'cerradas', label: 'Cerradas', count: stats.cerradas }
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFiltro(f.key)}
                        style={{
                            padding: '10px 20px',
                            border: '2px solid',
                            borderColor: filtro === f.key ? '#00ffcc' : '#ddd',
                            borderRadius: '6px',
                            background: filtro === f.key ? '#00ffcc' : 'white',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        {f.label} ({f.count})
                    </button>
                ))}
            </div>

            {/* Tabla */}
            <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#1a4d2e', color: 'white' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Fecha</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Usuario</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Teléfono</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Módulo</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Duda</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Estado</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dudasFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                                    No hay dudas registradas
                                </td>
                            </tr>
                        ) : (
                            dudasFiltradas.map((duda, index) => (
                                <tr
                                    key={duda.id}
                                    style={{
                                        borderBottom: '1px solid #eee',
                                        background: index % 2 === 0 ? '#fafafa' : 'white'
                                    }}
                                >
                                    <td style={{ padding: '15px', fontSize: '14px' }}>
                                        {formatearFecha(duda.fecha)}
                                    </td>
                                    <td style={{ padding: '15px', fontWeight: '500' }}>
                                        {duda.nombre || 'Sin nombre'}
                                    </td>
                                    <td style={{ padding: '15px', fontFamily: 'monospace' }}>
                                        +{duda.telefono}
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            background: '#e3f2fd',
                                            borderRadius: '4px',
                                            fontSize: '12px'
                                        }}>
                                            {duda.modulo}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px', maxWidth: '300px' }}>
                                        <div style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }} title={duda.mensaje}>
                                            {duda.mensaje}
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            background: duda.estado === 'nueva' ? '#fff3e0' :
                                                duda.estado === 'respondida' ? '#e8f5e9' : '#e3f2fd',
                                            color: duda.estado === 'nueva' ? '#f57c00' :
                                                duda.estado === 'respondida' ? '#388e3c' : '#1976d2',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {duda.estado.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <select
                                            value={duda.estado}
                                            onChange={(e) => cambiarEstado(duda.id, e.target.value)}
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid #ddd',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <option value="nueva">Nueva</option>
                                            <option value="respondida">Respondida</option>
                                            <option value="cerrada">Cerrada</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DudasWhatsapp;