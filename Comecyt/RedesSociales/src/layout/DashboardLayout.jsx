// src/layout/DashboardLayout.jsx
import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../Css/DashboardLayout.css";

//const API_URL = 'http://localhost:4000';
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function DashboardLayout() {
  const navigate = useNavigate();
  const { id } = useParams();
  const correo = localStorage.getItem("correo") || "Usuario";
  const rol = localStorage.getItem("rol") || "alumno"; // ✅ AGREGADO: leer rol

  // Estado para validar el progreso en silencio (sin cambiar el diseño)
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    // ✅ AGREGADO: Si no hay sesión, regresa al login
    if (!localStorage.getItem("token") || correo === "Usuario") {
      navigate("/");
      return;
    }

    const obtenerProgreso = async () => {
      // Solo cargar progreso si es alumno
      if (rol === "alumno" && correo !== "Usuario") {
        try {
          const res = await axios.post(`${API_URL}/api/alumno/progreso`, { correo });
          // Buscamos el avance del Módulo 1
          const mod1 = res.data.modulos.find(m => m.modulo_id === 1);
          if (mod1) setProgreso(mod1.progreso_actual);
        } catch (err) {
          console.error("Error al sincronizar progreso");
        }
      }
    };
    obtenerProgreso();
  }, [correo, id, rol, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      {/* HEADER - Manteniendo tu estilo de ayuda WhatsApp */}
      <header className="dashboard-header">
        <a
          href="https://wa.me/527121265349"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-link"
        >
          📱 Ayuda WhatsApp
        </a>

        <div className="header-right">
          <span className="user-email">{correo} {rol === 'admin' && '(Admin)'}</span>
          <div className="user-avatar" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <img src="/default-avatar.png" alt="Usuario" />
          </div>
        </div>
      </header>

      <div className="dashboard-body">
        {/* SIDEBAR - Ahora muestra menú según rol */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            {/* ✅ MENÚ PARA ALUMNOS */}
            {rol === 'alumno' && (
              <>
                <Link to="/inicio" className="nav-item">
                  🏠 Inicio
                </Link>
                <Link to="/presentacion" className="nav-item">
                  📄 Presentación
                </Link>
                <Link to="/contenidos" className="nav-item">
                  📚 Contenidos
                </Link>
                <Link to="/perfil" className="nav-item">
                  👤 Perfil
                </Link>
              </>
            )}

            {/* ✅ MENÚ PARA DOCENTES */}
            {rol === 'docente' && (
              <>
                <Link to="/docente/dashboard" className="nav-item">
                  📊 Dashboard
                </Link>
                <Link to="/docente/alumnos" className="nav-item">
                  👥 Mis Alumnos
                </Link>
                <Link to="/perfil" className="nav-item">
                  👤 Perfil
                </Link>
              </>
            )}

            {/* ✅ MENÚ PARA ADMIN */}
            {rol === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="nav-item">
                  📊 Dashboard
                </Link>
                <Link to="/admin/alumnos" className="nav-item">
                  👥 Alumnos
                </Link>
                <Link to="/admin/docentes" className="nav-item">
                  👨‍🏫 Docentes
                </Link>
                <Link to="/admin/modulos" className="nav-item">
                  📚 Módulos
                </Link>
              </>
            )}
          </nav>

          <div className="sidebar-whatsapp">
            <a
              href="https://wa.me/527121265349"
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn"
            >
              📱 Ayuda WhatsApp<br />
              <small>+52 712 126 5349</small>
            </a>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="dashboard-content">
          <Outlet context={{ progreso, correo, rol }} />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
