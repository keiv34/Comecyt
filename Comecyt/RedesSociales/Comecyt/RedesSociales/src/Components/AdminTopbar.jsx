import { useState } from "react";
import "../Css/AdminTopbar.css";

function AdminTopbar({ nombre }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const irPerfil = () => {
    window.location.href = "/admin/adminPerfil";
  };

  return (
    <header className="admin-topbar">
      <div className="logo">Panel Administrador</div>

      <div className="user-info">
        <span>{nombre}</span>

        <div
          className="profile"
          onClick={() => setMenuVisible(!menuVisible)}
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/9385/9385289.png"
            alt="Admin"
            className="user-icon"
          />

          {menuVisible && (
            <div className="dropdown-menu">
              <button onClick={irPerfil}>Mi Perfil</button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/";
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
