import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

function DocenteLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuPerfilOpen, setMenuPerfilOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuPerfilOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ✅ MENÚ NUEVO: Inicio, Alumnos, Calificaciones, Certificados
  const menuItems = [
    { path: "/docente/inicio", label: "Inicio", icon: "📊" },
    { path: "/docente/alumnos", label: "Alumnos", icon: "👥" },
    { path: "/docente/calificaciones", label: "Calificaciones", icon: "📝" },
    { path: "/docente/certificados", label: "Certificados", icon: "🎓" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a3d2e" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: sidebarOpen ? "260px" : "80px",
          background: "#0f5742",
          borderRight: "2px solid #00ffaa",
          transition: "width 0.3s ease",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          height: "100vh",
          zIndex: 100,
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #00ffaa",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "space-between" : "center",
          }}
        >
          {sidebarOpen && (
            <div style={{ color: "#00ffaa", fontWeight: "bold", fontSize: "20px" }}>
              Panel Docente
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: "#00ffaa",
              cursor: "pointer",
              fontSize: "20px",
            }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <nav style={{ flex: 1, padding: "20px 0" }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 20px",
                color: isActive(item.path) ? "#0a3d2e" : "white",
                background: isActive(item.path) ? "#00ffaa" : "transparent",
                textDecoration: "none",
                transition: "all 0.2s",
                fontWeight: isActive(item.path) ? "bold" : "normal",
                borderLeft: isActive(item.path) ? "4px solid #00ffaa" : "4px solid transparent",
              }}
            >
              <span style={{ fontSize: "20px" }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {sidebarOpen && (
          <div style={{ padding: "0 20px 10px" }}>
            <a
              href="https://wa.me/527121265349"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px",
                background: "#25D366",
                color: "white",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "14px",
                justifyContent: "center",
              }}
            >
              <span>📱</span>
              <span>Ayuda WhatsApp</span>
            </a>
          </div>
        )}

        <div style={{ padding: "20px", borderTop: "1px solid #00ffaa" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "12px",
              background: "#ff6b6b",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span>🚪</span>
            {sidebarOpen && "Cerrar Sesión"}
          </button>
        </div>
      </aside>

      <div
        style={{
          marginLeft: sidebarOpen ? "260px" : "80px",
          flex: 1,
          transition: "margin-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
          background: "#0a3d2e",
        }}
      >
        <header style={{
          background: "#0f5742",
          padding: "15px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #00ffaa",
        }}>
          <div>
            <span style={{ color: "#00ffaa", fontWeight: "bold" }}>
              Panel del Docente
            </span>
          </div>

          <div style={{ position: "relative" }} ref={menuRef}>
            <div
              onClick={() => setMenuPerfilOpen(!menuPerfilOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                cursor: "pointer"
              }}
            >
              <span style={{ color: "white", fontSize: "14px" }}>{user?.correo}</span>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#00ffaa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "#0a3d2e",
              }}>
                👤
              </div>
            </div>

            {menuPerfilOpen && (
              <div style={{
                position: "absolute",
                top: "55px",
                right: 0,
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                minWidth: "180px",
                zIndex: 1000,
              }}>
                <Link
                  to="/docente/perfil"
                  onClick={() => setMenuPerfilOpen(false)}
                  style={{
                    display: "block",
                    padding: "12px 20px",
                    color: "#333",
                    textDecoration: "none",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  Mi Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    background: "transparent",
                    border: "none",
                    color: "#333",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </header>

        <main style={{ padding: "20px", flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DocenteLayout;