// src/pages/Inicio.jsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "../Css/Inicio.css";

const API_URL = "http://localhost:4000";

export default function Inicio() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [progresoData, setProgresoData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ CONFIGURACIÓN: Módulo 5 ahora termina en 16
  const MODULOS = [
    {
      id: 1,
      moduloId: 1,
      nombre: "Correo Electrónico",
      icono: "📧",
      inicio: 1,
      fin: 8,
      descripcion: "Fundamentos de correo electrónico y comunicación digital"
    },
    {
      id: 2,
      moduloId: 2,
      nombre: "Facebook & Marketplace",
      icono: "📘",
      inicio: 1,
      fin: 6,
      descripcion: "Perfiles, páginas, grupos, eventos, Marketplace y examen",
      destacado: true
    },
    {
      id: 3,
      moduloId: 3,
      nombre: "WhatsApp Business",
      icono: "💬",
      inicio: 1,
      fin: 7,
      descripcion: "Catálogos, mensajes automáticos y ventas"
    },
    {
      id: 4,
      moduloId: 4,
      nombre: "Instagram",
      icono: "📸",
      inicio: 1,
      fin: 8,
      descripcion: "Historias, Reels, posts y estrategias"
    },
    {
      id: 5,
      moduloId: 5,
      nombre: "Retos Finales",
      icono: "🏆",
      inicio: 1,
      fin: 4,
      descripcion: "Casos prácticos y evaluación final"
    }
  ];

  const TOTAL_CONTENIDOS = MODULOS.reduce((acc, m) => acc + (m.fin - m.inicio + 1), 0);

  const getProgresoModulo = (moduloId) => {
    if (!progresoData?.modulos) return 0;
    const mod = progresoData.modulos.find(m => m.modulo_id === moduloId);
    return mod?.progreso_actual || 0;
  };

  const calcularPorcentaje = (modulo) => {
    const { inicio, fin, moduloId } = modulo;
    const total = fin - inicio + 1;
    const progreso_actual = getProgresoModulo(moduloId);

    if (progreso_actual < inicio) return 0;
    if (progreso_actual >= fin) return 100;

    const completados = progreso_actual - inicio + 1;
    return Math.round((completados / total) * 100);
  };

  const estaDesbloqueado = (modulo) => {
    if (modulo.id === 1) return true;
    const moduloAnterior = MODULOS.find(m => m.id === modulo.id - 1);
    if (!moduloAnterior) return false;

    const progresoAnterior = getProgresoModulo(moduloAnterior.moduloId);
    return progresoAnterior >= moduloAnterior.fin;
  };

  const obtenerDestinoClick = (modulo) => {
    const { inicio, fin, moduloId } = modulo;
    const progreso_actual = getProgresoModulo(moduloId);
    const porcentaje = calcularPorcentaje(modulo);

    if (porcentaje === 100) {
      return inicio;
    }
    if (progreso_actual < inicio) return inicio;
    return progreso_actual + 1;
  };

  const getEstadoBoton = (modulo) => {
    const porcentaje = calcularPorcentaje(modulo);
    const desbloqueado = estaDesbloqueado(modulo);

    if (!desbloqueado) {
      return { texto: 'Bloqueado 🔒', disabled: true, clase: 'btn-bloqueado' };
    }
    if (porcentaje === 100) {
      return { texto: '✅ Completado', disabled: false, clase: 'btn-completado' };
    }
    const progreso_actual = getProgresoModulo(modulo.moduloId);
    if (progreso_actual >= modulo.inicio) {
      return { texto: 'Continuar →', disabled: false, clase: 'btn-continuar' };
    }
    return { texto: 'Empezar →', disabled: false, clase: 'btn-empezar' };
  };

  useEffect(() => {
    const fetchProgreso = async () => {
      try {
        const correo = localStorage.getItem("correo");
        const token = localStorage.getItem("token");

        if (!correo || !token) {
          navigate("/login");
          return;
        }

        const resp = await axios.post(
          `${API_URL}/api/alumno/progreso`,
          { correo },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProgresoData(resp.data);
      } catch (err) {
        console.error("Error obteniendo progreso:", err);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProgreso();
  }, [navigate]);

  const irAModulo = (modulo) => {
    if (!progresoData) return;

    if (!estaDesbloqueado(modulo)) {
      alert('🔒 Debes completar el módulo anterior primero');
      return;
    }

    const destino = obtenerDestinoClick(modulo);
    navigate(`/modulo/${modulo.moduloId}/contenido/${destino}`);
  };

  if (loading) {
    return (
      <div className="inicio-container">
        <div className="loading">Cargando tu progreso...</div>
      </div>
    );
  }

  if (!progresoData) {
    return (
      <div className="inicio-container">
        <div className="error">Error al cargar tu progreso</div>
      </div>
    );
  }

  // --- Nombre completo ---
  const nombreCompleto =
    (user?.nombre ? `${user.nombre} ${user.apellido || ''}`.trim() : null) ||
    (progresoData.alumno?.nombre ? `${progresoData.alumno.nombre} ${progresoData.alumno.apellido || ''}`.trim() : null) ||
    localStorage.getItem('alumno_nombre') ||
    'Alumno';

  // --- Datos para gráficas ---
  const datosModulos = MODULOS.map(m => ({
    name: `M${m.id}`,
    progreso: calcularPorcentaje(m)
  }));

  const completados = datosModulos.filter(d => d.progreso === 100).length;
  const progresoGlobal = Math.round(datosModulos.reduce((a, b) => a + b.progreso, 0) / MODULOS.length);
  const contenidosVistos = MODULOS.reduce((acc, m) => {
    const p = getProgresoModulo(m.moduloId);
    return acc + Math.max(0, Math.min(p, m.fin) - m.inicio + 1);
  }, 0);

  const pieData = [
    { name: 'Completado', value: progresoGlobal },
    { name: 'Restante', value: 100 - progresoGlobal }
  ];
  const COLORS = ['#16a34a', '#e5e7eb'];

  return (
    <div className="inicio-container">
      <header className="inicio-header">
        <div>
          <h1>Bienvenido, {nombreCompleto}</h1>
          <p>Continúa con tu aprendizaje de redes sociales</p>
        </div>
        <div className="header-badge">
          {completados}/{MODULOS.length} módulos
        </div>
      </header>

      {/* DASHBOARD */}
      <section className="dashboard-stats">
        <div className="stat-card stat-chart">
          <h3>Avance general</h3>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={70} dataKey="value" startAngle={90} endAngle={-270}>
                  {pieData.map((entry, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-center">{progresoGlobal}%</div>
          </div>
        </div>

        <div className="stat-card stat-chart wide">
          <h3>Progreso por módulo</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={datosModulos}>
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="progreso" radius={[6, 6, 0, 0]} fill="#166534" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card stat-kpi">
          <span className="kpi-value">{contenidosVistos}/{TOTAL_CONTENIDOS}</span>
          <span className="kpi-label">Contenidos vistos</span>
        </div>
      </section>

      <main className="modulos-grid">
        {MODULOS.map((modulo) => {
          const porcentaje = calcularPorcentaje(modulo);
          const desbloqueado = estaDesbloqueado(modulo);
          const estadoBoton = getEstadoBoton(modulo);

          return (
            <article
              key={modulo.id}
              className={`modulo-card ${modulo.destacado ? 'destacado' : ''} ${!desbloqueado ? 'bloqueado' : ''}`}
            >
              <div className="modulo-header">
                <h2>Módulo {modulo.id}: {modulo.nombre}</h2>
                <span className="modulo-icon">{modulo.icono}</span>
              </div>

              <div className="modulo-body">
                <p>{modulo.descripcion}</p>

                <div className="progreso-bar">
                  <div
                    className="progreso-fill"
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                </div>

                <p className="progreso-texto">
                  {porcentaje}% completado
                </p>

                <small style={{ color: '#666', fontSize: '0.85rem' }}>
                  Contenidos {modulo.inicio} al {modulo.fin}
                </small>
              </div>

              <button
                className={`btn-modulo ${estadoBoton.clase}`}
                onClick={() => irAModulo(modulo)}
                disabled={estadoBoton.disabled}
              >
                {estadoBoton.texto}
              </button>
            </article>
          );
        })}
      </main>
    </div>
  );
}