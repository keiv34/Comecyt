// src/layout/DashboardLayout.jsx
import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { House, FileText, BookOpen, UserRound, ChartNoAxesColumn, Users, Presentation, MessageCircle, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../Css/DashboardLayout.css";

const API_URL = 'http://localhost:4000';

function DashboardLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
        } catch {
          console.error("Error al sincronizar progreso");
        }
      }
    };
    obtenerProgreso();
  }, [correo, id, rol, navigate]);

  const handleLogout = () => {
    logout();
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
          <MessageCircle size={18} aria-hidden="true" /> Ayuda WhatsApp
        </a>

        <div className="header-right">
          <span className="user-email">{correo} {rol === 'admin' && '(Admin)'}</span>
          <button type="button" className="dashboard-logout" onClick={handleLogout} aria-label="Cerrar sesión"><LogOut size={20} aria-hidden="true" /></button>
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
                  <House size={18} aria-hidden="true" /> Inicio
                </Link>
                <Link to="/presentacion" className="nav-item">
                  <FileText size={18} aria-hidden="true" /> Presentación
                </Link>
                <Link to="/contenidos" className="nav-item">
                  <BookOpen size={18} aria-hidden="true" /> Contenidos
                </Link>
                <Link to="/perfil" className="nav-item">
                  <UserRound size={18} aria-hidden="true" /> Mi perfil
                </Link>
              </>
            )}

            {/* ✅ MENÚ PARA DOCENTES */}
            {rol === 'docente' && (
              <>
                <Link to="/docente/dashboard" className="nav-item">
                  <ChartNoAxesColumn size={18} aria-hidden="true" /> Dashboard
                </Link>
                <Link to="/docente/alumnos" className="nav-item">
                  <Users size={18} aria-hidden="true" /> Mis Alumnos
                </Link>
                <Link to="/perfil" className="nav-item">
                  <UserRound size={18} aria-hidden="true" /> Mi perfil
                </Link>
              </>
            )}

            {/* ✅ MENÚ PARA ADMIN */}
            {rol === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="nav-item">
                  <ChartNoAxesColumn size={18} aria-hidden="true" /> Dashboard
                </Link>
                <Link to="/admin/alumnos" className="nav-item">
                  <Users size={18} aria-hidden="true" /> Alumnos
                </Link>
                <Link to="/admin/docentes" className="nav-item">
                  <Presentation size={18} aria-hidden="true" /> Docentes
                </Link>
                <Link to="/admin/modulos" className="nav-item">
                  <BookOpen size={18} aria-hidden="true" /> Módulos
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
              <MessageCircle size={18} aria-hidden="true" /> Ayuda WhatsApp<br />
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