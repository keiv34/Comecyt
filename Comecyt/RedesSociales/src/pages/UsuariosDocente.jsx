// src/pages/UsuariosDocente.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../Css/UsuariosDocente.css";

// URL del backend
const API_URL = import.meta.env.VITE_API_URL;

export default function UsuariosDocente() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(null); // id del alumno
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
  });

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

  const cargarAlumnos = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/docente/usuarios`
      );
      setAlumnos(data);
      setError("");
      showToast("Lista de alumnos cargada correctamente ✅", "success");
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los alumnos.");
      showToast(
        "No se pudieron cargar los alumnos. Intenta más tarde.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAlumnos();
  }, []);

  const abrirEdicion = (al) => {
    setEditing(al.alumno_id);
    setForm({
      nombre: al.nombre,
      apellido: al.apellido,
      correo: al.correo,
    });
  };

  const cerrarEdicion = () => {
    setEditing(null);
    setForm({ nombre: "", apellido: "", correo: "" });
    showToast("Edición cancelada. No se guardaron cambios.", "info");
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_URL}/api/docente/usuarios/${editing}`,
        form
      );

      // Actualizar lista en memoria
      setAlumnos((prev) =>
        prev.map((al) =>
          al.alumno_id === editing ? { ...al, ...form } : al
        )
      );

      setEditing(null);
      setForm({ nombre: "", apellido: "", correo: "" });
      showToast("Datos del alumno actualizados correctamente ✅", "success");
    } catch (err) {
      console.error(err);
      showToast(
        "Error al actualizar el alumno. Intenta nuevamente.",
        "error"
      );
    }
  };

  // 🔢 progreso_m1 va de 0 a 29 → lo convertimos a %
  const getPorcentaje = (al) => {
    const v = Number(al.progreso_m1 || 0); // 0–29
    const porcentaje = (v / 29) * 100;
    return Math.max(0, Math.min(100, porcentaje));
  };

  return (
    <div className="docente-page">
      {/* 🔔 TOAST GLOBAL DE USUARIOS DOCENTE */}
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="docente-header">
        <h1>Alumnos inscritos</h1>
        <p className="docente-sub">
          Consulta y edita los datos básicos de los alumnos.
        </p>
      </header>

      {loading ? (
        <p>Cargando alumnos...</p>
      ) : error ? (
        <p className="error-msg">{error}</p>
      ) : (
        <div className="tabla-wrapper">
          {/* 👉 solo esto tiene scroll */}
          <div className="tabla-scroll">
            <table className="tabla-alumnos">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Progreso módulo 1</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((al) => {
                  const percent = getPorcentaje(al);
                  return (
                    <tr key={al.alumno_id}>
                      <td>{al.alumno_id}</td>
                      <td>
                        {al.nombre} {al.apellido}
                      </td>
                      <td>{al.correo}</td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="progress-text">
                            {percent.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn-link"
                          type="button"
                          onClick={() => abrirEdicion(al)}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {alumnos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-msg">
                      No hay alumnos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🧾 Modal flotante para editar */}
      {editing && (
        <div className="edit-overlay">
          <div className="edit-modal">
            <h2>Editar alumno #{editing}</h2>
            <form onSubmit={guardarCambios} className="edit-form">
              <div className="form-row">
                <label>Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nombre: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-row">
                <label>Apellido</label>
                <input
                  type="text"
                  value={form.apellido}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, apellido: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-row">
                <label>Correo</label>
                <input
                  type="email"
                  value={form.correo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, correo: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="edit-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={cerrarEdicion}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
