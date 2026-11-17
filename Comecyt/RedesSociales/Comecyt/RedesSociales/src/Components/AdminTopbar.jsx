import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../Css/AdminTopbar.css";

function AdminTopbar({ nombre }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="admin-topbar">
      <div className="logo">Panel Administrador</div>

      <div className="user-info">
        <span>{nombre}</span>

        <div className="profile">
          <button type="button" className="admin-topbar__perfil" aria-label="Opciones de perfil" aria-expanded={menuVisible} onClick={() => setMenuVisible(!menuVisible)}>
            <img
            src="https://cdn-icons-png.flaticon.com/512/9385/9385289.png"
            alt=""
            className="user-icon"
            />
          </button>

          {menuVisible && (
            <div className="dropdown-menu">
              <Link to="/admin/adminPerfil" onClick={() => setMenuVisible(false)}>Mi perfil</Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
