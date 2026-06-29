// src/pages/ModulosAdmin.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../Css/ModulosAdmin.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function ModulosAdmin() {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(null); // id módulo
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
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

  const cargarModulos = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/admin/modulos`
      );
      setModulos(data || []);
      setError("");

      if (!data || data.length === 0) {
        showToast("Aún no hay módulos registrados.", "info");
      } else {
        showToast("Módulos cargados correctamente ✅", "success");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los módulos.");
      showToast("Error al cargar los módulos. Intenta más tarde.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarModulos();
  }, []);

  const abrirEdicion = (m) => {
    setEditing(m.modulo_id);
    setForm({
      titulo: m.titulo,
      descripcion: m.descripcion,
    });
  };

  const cerrarEdicion = () => {
    setEditing(null);
    setForm({ titulo: "", descripcion: "" });
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_URL}/api/admin/modulos/${editing}`,
        form
      );

      setModulos((prev) =>
        prev.map((m) =>
          m.modulo_id === editing ? { ...m, ...form } : m
        )
      );
      cerrarEdicion();
      showToast("Módulo actualizado correctamente ✅", "success");
    } catch (err) {
      console.error(err);
      showToast("Error al actualizar el módulo.", "error");
    }
  };

  return (
    <div className="admin-page">
      {/* 🔔 TOAST GLOBAL */}
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="admin-header">
        <div>
          <h1>Módulos de formación</h1>
          <p className="admin-sub">
            Revisa el progreso promedio por módulo y el resumen de contenidos,
            evaluaciones y certificados emitidos.
          </p>
        </div>
      </header>

      {loading ? (
        <p>Cargando módulos...</p>
      ) : error ? (
        <p className="error-msg">{error}</p>
      ) : (
        <div className="modulos-grid">
          {modulos.map((m) => {
            const progreso = Math.max(
              0,
              Math.min(100, Number(m.progreso_promedio || 0))
            );

            return (
              <article className="mod-card" key={m.modulo_id}>
                <header className="mod-card-header">
                  <div>
                    <span className="mod-chip">Módulo {m.modulo_id}</span>
                    <h2>{m.titulo}</h2>
                  </div>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => abrirEdicion(m)}
                  >
                    Editar
                  </button>
                </header>

                <p className="mod-desc">{m.descripcion}</p>

                <div className="mod-progress-row">
                  <span>Progreso promedio</span>
                  <span className="mod-progress-value">
                    {progreso.toFixed(1)}%
                  </span>
                </div>
                <div className="mod-progress-bar">
                  <div
                    className="mod-progress-fill"
                    style={{ width: `${progreso}%` }}
                  />
                </div>

                <div className="mod-stats">
                  <div className="mod-stat">
                    <span className="mod-stat-label">Alumnos</span>
                    <span className="mod-stat-number">
                      {m.total_alumnos}
                    </span>
                  </div>
                  <div className="mod-stat">
                    <span className="mod-stat-label">Contenidos</span>
                    <span className="mod-stat-number">
                      {m.total_contenidos}
                    </span>
                  </div>
                  <div className="mod-stat">
                    <span className="mod-stat-label">Evaluaciones</span>
                    <span className="mod-stat-number">
                      {m.total_evaluaciones}
                    </span>
                  </div>
                  <div className="mod-stat">
                    <span className="mod-stat-label">Certificados</span>
                    <span className="mod-stat-number">
                      {m.total_certificados}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}

          {modulos.length === 0 && !error && (
            <p className="empty-msg">
              Aún no hay módulos registrados en el sistema.
            </p>
          )}
        </div>
      )}

      {/* Modal de edición de módulo */}
      {editing && (
        <div className="edit-overlay">
          <div className="edit-modal">
            <h2>Editar módulo #{editing}</h2>
            <form onSubmit={guardarCambios} className="edit-form">
              <div className="form-row">
                <label>Título del módulo</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, titulo: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-row">
                <label>Descripción</label>
                <textarea
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      descripcion: e.target.value,
                    }))
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
