import { useEffect, useState } from "react";
import axios from "axios";
import "../Css/PerfilDocente.css";

export default function PerfilDocente() {
  const [docente, setDocente] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de modos
  const [modoEditar, setModoEditar] = useState(false);
  const [modoPassword, setModoPassword] = useState(false);

  // Estados de contraseña
  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  // Ver/Ocultar
  const [verPassActual, setVerPassActual] = useState(false);
  const [verPass, setVerPass] = useState(false);
  const [verPass2, setVerPass2] = useState(false);

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
    }, 3000);
  };

  // Config axios con token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  useEffect(() => {
    const correo = localStorage.getItem("correo");
    const token = localStorage.getItem("token");

    if (!correo || !token) {
      showToast("Sesión expirada. Inicia sesión de nuevo.", "error");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.post(
          "http://localhost:4000/api/docente/datos",
          { correo },
          getAuthHeaders()
        );
        setDocente(res.data.docente);
      } catch (err) {
        console.error("Error al cargar datos del docente:", err);
        if (err.response?.status === 401) {
          showToast("Sesión expirada. Inicia sesión de nuevo.", "error");
          localStorage.clear();
        } else {
          showToast(
            "No se pudo cargar tu perfil de docente. Intenta más tarde.",
            "error"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Mientras se cargan los datos
  if (loading) {
    return (
      <div className="perfil-docente-root">
        {toast.visible && (
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        )}
        <p style={{ textAlign: "center", marginTop: "2rem" }}>
          Cargando perfil...
        </p>
      </div>
    );
  }

  if (!docente) {
    return (
      <div className="perfil-docente-root">
        {toast.visible && (
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        )}
        <p style={{ textAlign: "center", marginTop: "2rem" }}>
          No se encontraron datos. Inicia sesión.
        </p>
      </div>
    );
  }

  // 🟦 Guardar edición
  const guardarDatos = async () => {
    if (!docente.nombre.trim() || !docente.apellido.trim() || !docente.correo.trim()) {
      showToast("Todos los campos son obligatorios", "error");
      return;
    }

    try {
      await axios.put(
        "http://localhost:4000/api/docente/actualizar",
        docente,
        getAuthHeaders()
      );
      localStorage.setItem("correo", docente.correo);
      showToast("Datos actualizados correctamente ✅", "success");
      setModoEditar(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        showToast("Sesión expirada. Inicia sesión de nuevo.", "error");
      } else {
        showToast(
          err.response?.data?.error || "Ocurrió un error al actualizar los datos.",
          "error"
        );
      }
    }
  };

  const cancelarEdicion = () => {
    setModoEditar(false);
    showToast("Edición cancelada. No se guardaron cambios.", "info");
  };

  // 🟥 Guardar nueva contraseña
  const guardarPassword = async () => {
    if (!passwordActual || !nuevaContrasena || !confirmarContrasena) {
      showToast("Completa todos los campos", "error");
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      showToast("Las contraseñas nuevas no coinciden", "error");
      return;
    }

    if (nuevaContrasena.length < 6) {
      showToast("La contraseña debe tener mínimo 6 caracteres", "error");
      return;
    }

    try {
      await axios.put(
        "http://localhost:4000/api/docente/password",
        {
          docente_id: docente.docente_id,
          password_actual: passwordActual,
          nueva_contrasena: nuevaContrasena,
        },
        getAuthHeaders()
      );

      showToast("Contraseña actualizada correctamente 🔐", "success");

      // Reset campos
      setPasswordActual("");
      setNuevaContrasena("");
      setConfirmarContrasena("");
      setModoPassword(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        showToast("La contraseña actual es incorrecta", "error");
      } else {
        showToast(
          err.response?.data?.error || "Ocurrió un error al cambiar la contraseña",
          "error"
        );
      }
    }
  };

  const cancelarPassword = () => {
    setPasswordActual("");
    setNuevaContrasena("");
    setConfirmarContrasena("");
    setModoPassword(false);
    showToast("Cambio de contraseña cancelado.", "info");
  };

  const cerrarSesion = () => {
    localStorage.clear();
    showToast("Sesión cerrada", "info");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };

  return (
    <div className="perfil-docente-root">
      {/* 🔔 TOAST GLOBAL PERFIL DOCENTE */}
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <div className="perfil-card">
        <h2>👨🏫 Perfil del Docente</h2>

        {/* 🟦 MODO VER DATOS */}
        {!modoEditar && !modoPassword && (
          <div className="perfil-info">
            <p>
              <strong>ID:</strong> {docente.docente_id}
            </p>
            <p>
              <strong>Nombre:</strong> {docente.nombre}
            </p>
            <p>
              <strong>Apellido:</strong> {docente.apellido}
            </p>
            <p>
              <strong>Correo:</strong> {docente.correo}
            </p>
          </div>
        )}

        {/* 🟦 MODO EDITAR DATOS */}
        {modoEditar && (
          <div className="perfil-form">
            <input
              value={docente.nombre}
              onChange={(e) =>
                setDocente({ ...docente, nombre: e.target.value })
              }
              placeholder="Nombre"
            />
            <input
              value={docente.apellido}
              onChange={(e) =>
                setDocente({ ...docente, apellido: e.target.value })
              }
              placeholder="Apellido"
            />
            <input
              value={docente.correo}
              onChange={(e) =>
                setDocente({ ...docente, correo: e.target.value })
              }
              placeholder="Correo"
              type="email"
            />
          </div>
        )}

        {/* 🟥 MODO CAMBIAR CONTRASEÑA */}
        {modoPassword && (
          <div className="password-box">
            {/* Contraseña actual */}
            <div className="input-password">
              <input
                type={verPassActual ? "text" : "password"}
                placeholder="Contraseña actual"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
              />
              <span className="ojo" onClick={() => setVerPassActual(!verPassActual)}>
                {verPassActual ? "🙈" : "👁"}
              </span>
            </div>

            {/* Nueva contraseña */}
            <div className="input-password">
              <input
                type={verPass ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
              />
              <span className="ojo" onClick={() => setVerPass(!verPass)}>
                {verPass ? "🙈" : "👁"}
              </span>
            </div>

            {/* Confirmar contraseña */}
            <div className="input-password">
              <input
                type={verPass2 ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
              />
              <span className="ojo" onClick={() => setVerPass2(!verPass2)}>
                {verPass2 ? "🙈" : "👁"}
              </span>
            </div>
          </div>
        )}

        {/* BOTONES PRINCIPALES */}
        {!modoEditar && !modoPassword && (
          <>
            <button
              onClick={() => setModoEditar(true)}
              className="btn-editar"
            >
              ✏ Editar datos
            </button>

            <button
              onClick={() => setModoPassword(true)}
              className="btn-password"
            >
              🔐 Cambiar contraseña
            </button>

            <button
              onClick={cerrarSesion}
              className="btn-logout"
              style={{ background: "#dc3545", marginTop: "10px" }}
            >
              🚪 Cerrar sesión
            </button>
          </>
        )}

        {/* BOTONES DE EDICIÓN */}
        {modoEditar && (
          <>
            <button onClick={guardarDatos} className="btn-guardar">
              💾 Guardar cambios
            </button>
            <button onClick={cancelarEdicion} className="btn-cancelar">
              ❌ Cancelar
            </button>
          </>
        )}

        {/* BOTONES DE CONTRASEÑA */}
        {modoPassword && (
          <>
            <button onClick={guardarPassword} className="btn-guardar-pass">
              💾 Guardar nueva contraseña
            </button>
            <button onClick={cancelarPassword} className="btn-cancelar">
              ❌ Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}