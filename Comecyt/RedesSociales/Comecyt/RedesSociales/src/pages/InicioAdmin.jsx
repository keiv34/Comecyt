// src/pages/InicioAdmin.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Css/InicioAdmin.css";

const API_URL = "http://localhost:4000";

export default function InicioAdmin() {
  const [resumen, setResumen] = useState(null);
  const [certificados, setCertificados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ NUEVO: Estado para cambiar entre vistas
  const [vista, setVista] = useState('dashboard'); // 'dashboard', 'alumnos', 'docentes'
  const [alumnos, setAlumnos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [alumnoDetalle, setAlumnoDetalle] = useState(null);
  const [progresoDetalle, setProgresoDetalle] = useState([]);

  // 🔔 Toast notificaciones
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info", // "success" | "error" | "info"
  });

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        if (vista === 'dashboard') {
          const [rDash, rCerts] = await Promise.all([
            axios.get(`${API_URL}/api/admin/dashboard-resumen`, config),
            axios.get(`${API_URL}/api/docente/certificados`, config),
          ]);

          setResumen(rDash.data || null);
          setCertificados(rCerts.data || []);
          setError("");

          if (!rDash.data) {
            showToast(
              "No se encontró información para el panel del administrador.",
              "info"
            );
          } else {
            showToast(
              "Información del panel del administrador cargada correctamente ✅",
              "success"
            );
          }
        } else if (vista === 'alumnos') {
          // ✅ NUEVO: Cargar alumnos con progreso
          const res = await axios.get(`${API_URL}/api/admin/alumnos-progreso`, config);
          setAlumnos(res.data || []);
        } else if (vista === 'docentes') {
          // ✅ NUEVO: Cargar docentes
          const res = await axios.get(`${API_URL}/api/admin/docentes`, config);
          setDocentes(res.data || []);
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el panel del administrador.");
        showToast(
          "Error al cargar la información del panel. Intenta más tarde.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vista]);

  // ✅ NUEVO: Ver detalle de progreso de alumno
  const verDetalleAlumno = async (alumno) => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const res = await axios.get(`${API_URL}/api/admin/alumno/${alumno.alumno_id}/progreso`, config);
      setProgresoDetalle(res.data);
      setAlumnoDetalle(alumno);
    } catch (error) {
      console.error('Error:', error);
      showToast("Error al cargar detalle del alumno", "error");
    }
  };

  // ✅ NUEVO: Eliminar docente
  const eliminarDocente = async (id) => {
    if (!confirm('¿Eliminar este docente?')) return;

    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.delete(`${API_URL}/api/admin/usuarios/${id}`, config);
      showToast("Docente eliminado correctamente", "success");
      setVista('docentes'); // Recarga
    } catch (error) {
      showToast("Error al eliminar docente", "error");
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        {toast.visible && (
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        )}
        Cargando información...
      </div>
    );
  }

  if (error && vista === 'dashboard') {
    return (
      <div className="admin-page error-msg">
        {toast.visible && (
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        )}
        {error}
      </div>
    );
  }

  const {
    totalAlumnos = 0,
    totalDocentes = 0,
    totalModulos = 0,
    totalCertificados = 0,
    resumenContenidos = [],
  } = resumen || {};

  const ultimosCertificados = certificados.slice(0, 8);

  return (
    <div className="admin-page admin-dashboard">
      {/* 🔔 TOAST GLOBAL */}
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      {/* ✅ NUEVO: NAVBAR DE PESTAÑAS */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        borderBottom: '2px solid #00ffaa',
        paddingBottom: '10px'
      }}>
        <button
          onClick={() => setVista('dashboard')}
          style={{
            padding: '10px 20px',
            background: vista === 'dashboard' ? '#00ffaa' : 'transparent',
            color: vista === 'dashboard' ? '#0a3d2e' : '#00ffaa',
            border: '2px solid #00ffaa',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setVista('alumnos')}
          style={{
            padding: '10px 20px',
            background: vista === 'alumnos' ? '#00ffaa' : 'transparent',
            color: vista === 'alumnos' ? '#0a3d2e' : '#00ffaa',
            border: '2px solid #00ffaa',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          👤 Alumnos
        </button>
        <button
          onClick={() => setVista('docentes')}
          style={{
            padding: '10px 20px',
            background: vista === 'docentes' ? '#00ffaa' : 'transparent',
            color: vista === 'docentes' ? '#0a3d2e' : '#00ffaa',
            border: '2px solid #00ffaa',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📋 Docentes
        </button>
      </div>

      {/* ✅ VISTA DASHBOARD - TU CÓDIGO ORIGINAL */}
      {vista === 'dashboard' && (
        <>
          <header className="admin-header">
            <h1>Panel del administrador</h1>
            <p className="admin-sub">
              Vista general de alumnos, docentes, módulos y certificados.
            </p>
          </header>

          {/* Tarjetas de resumen */}
          <section className="admin-cards-grid">
            <article className="admin-card stat-card">
              <p className="stat-label">Alumnos registrados</p>
              <p className="stat-value">{totalAlumnos}</p>
              <button
                type="button"
                className="admin-card-btn"
                onClick={() => setVista("alumnos")}
              >
                👀 Ver alumnos
              </button>
            </article>

            <article className="admin-card stat-card">
              <p className="stat-label">Docentes registrados</p>
              <p className="stat-value">{totalDocentes}</p>
              <button
                type="button"
                className="admin-card-btn"
                onClick={() => setVista("docentes")}
              >
                👀 Ver docentes
              </button>
            </article>

            <article className="admin-card stat-card">
              <p className="stat-label">Módulos creados</p>
              <p className="stat-value">{totalModulos}</p>
              <button
                type="button"
                className="admin-card-btn"
                onClick={() => navigate("/admin/modulos")}
              >
                👀 Ver módulos
              </button>
            </article>

            <article className="admin-card stat-card">
              <p className="stat-label">Certificados emitidos</p>
              <p className="stat-value">{totalCertificados}</p>
            </article>
          </section>

          <div className="admin-main-grid">
            <section className="admin-card table-card">
              <h2 className="section-title">Últimos certificados emitidos</h2>
              {ultimosCertificados.length === 0 ? (
                <p className="empty-msg">Aún no hay certificados emitidos.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>Módulo</th>
                      <th>Fecha de emisión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimosCertificados.map((c) => (
                      <tr key={c.certificado_id}>
                        <td>
                          {c.nombre} {c.apellido}
                        </td>
                        <td>{`Módulo ${c.modulo_id}`}</td>
                        <td>
                          {c.fecha_emision
                            ? new Date(c.fecha_emision).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section className="admin-card table-card">
              <h2 className="section-title">Resumen de contenidos por módulo</h2>
              {resumenContenidos.length === 0 ? (
                <p className="empty-msg">Aún no hay contenidos registrados.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Módulo</th>
                      <th>Contenidos</th>
                      <th>Evaluaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumenContenidos.map((row) => (
                      <tr key={row.modulo_id}>
                        <td>{row.titulo_modulo}</td>
                        <td>{row.total_contenidos}</td>
                        <td>{row.total_evaluaciones}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        </>
      )}

      {/* ✅ NUEVO: VISTA ALUMNOS */}
      {vista === 'alumnos' && (
        <div>
          <header className="admin-header">
            <h1>Gestión de Alumnos</h1>
            <p className="admin-sub">
              Lista de alumnos registrados y su progreso en los módulos.
            </p>
          </header>

          <section className="admin-card table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th style={{ textAlign: 'center' }}>Progreso General</th>
                  <th style={{ textAlign: 'center' }}>Módulos</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      No hay alumnos registrados
                    </td>
                  </tr>
                ) : alumnos.map((a) => (
                  <tr key={a.alumno_id}>
                    <td>{a.nombre} {a.apellido}</td>
                    <td>{a.correo}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        background: '#00ffaa',
                        color: '#0a3d2e',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontWeight: 'bold'
                      }}>
                        {a.progreso_general || 0}%
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {a.modulos_completados || 0}/{a.modulos_totales || 5}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => verDetalleAlumno(a)}
                        className="admin-card-btn"
                        style={{ padding: '8px 16px' }}
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {/* ✅ NUEVO: VISTA DOCENTES */}
      {vista === 'docentes' && (
        <div>
          <header className="admin-header">
            <h1>Gestión de Docentes</h1>
            <p className="admin-sub">
              Lista de docentes registrados en la plataforma.
            </p>
          </header>

          <section className="admin-card table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docentes.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                      No hay docentes registrados
                    </td>
                  </tr>
                ) : docentes.map((d) => (
                  <tr key={d.docente_id}>
                    <td>{d.nombre} {d.apellido}</td>
                    <td>{d.correo}</td>
                    <td>{d.telefono || 'N/A'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => showToast('Función editar pendiente', 'info')}
                        style={{
                          padding: '6px 12px',
                          background: '#00aaff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          marginRight: '8px'
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarDocente(d.docente_id)}
                        style={{
                          padding: '6px 12px',
                          background: '#ff4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {/* ✅ NUEVO: Modal Detalle Alumno */}
      {alumnoDetalle && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setAlumnoDetalle(null)}>
          <div
            className="admin-card"
            style={{
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: '#00ffaa', marginBottom: '20px' }}>
              Progreso de {alumnoDetalle.nombre} {alumnoDetalle.apellido}
            </h2>
            {progresoDetalle.length === 0 ? (
              <p style={{ color: '#00ffaa' }}>Este alumno no tiene progreso registrado</p>
            ) : progresoDetalle.map((p) => (
              <div key={p.modulo_id} style={{
                marginBottom: '15px',
                padding: '15px',
                background: '#0a3d2e',
                borderRadius: '8px',
                border: '1px solid #00ffaa50'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: 'white' }}>{p.modulo_nombre}</span>
                  <span style={{ color: '#00ffaa', fontWeight: 'bold' }}>{p.porcentaje}%</span>
                </div>
                <div style={{
                  background: '#0f5742',
                  height: '10px',
                  borderRadius: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${p.porcentaje}%`,
                    height: '100%',
                    background: p.completado ? '#00ffaa' : '#00aaff',
                    transition: 'width 0.3s'
                  }}></div>
                </div>
                {p.completado ? (
                  <p style={{ color: '#00ffaa', marginTop: '8px', fontSize: '14px' }}>
                    ✓ Certificado emitido {p.fecha_completado ? new Date(p.fecha_completado).toLocaleDateString() : ''}
                  </p>
                ) : null}
              </div>
            ))}
            <button
              onClick={() => setAlumnoDetalle(null)}
              className="admin-card-btn"
              style={{ width: '100%', marginTop: '10px' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}