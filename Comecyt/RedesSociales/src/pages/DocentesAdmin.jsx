// src/pages/DocentesAdmin.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../Css/DocentesAdmin.css";

//se le agrego la url
const API_URL = import.meta.env.VITE_API_URL;

export default function DocentesAdmin() {
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(null); // id del docente en edición
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
  });

  const [confirmDelete, setConfirmDelete] = useState(null); // docente a borrar

  // 🔹 estado para CREAR docente
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
    confirm: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

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

  const cargarDocentes = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/admin/docentes`
      );
      setDocentes(data || []);
      setError("");

      if (!data || data.length === 0) {
        showToast("No hay docentes registrados todavía.", "info");
      } else {
        showToast("Lista de docentes cargada correctamente ✅", "success");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los docentes.");
      showToast(
        "Error al cargar los docentes. Intenta nuevamente más tarde.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDocentes();
  }, []);

  const abrirEdicion = (d) => {
    setEditing(d.docente_id);
    setForm({
      nombre: d.nombre,
      apellido: d.apellido,
      correo: d.correo,
    });
  };

  const cerrarEdicion = () => {
    setEditing(null);
    setForm({ nombre: "", apellido: "", correo: "" });
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${API_URL}/api/admin/docentes/${editing}`,
        form
      );

      setDocentes((prev) =>
        prev.map((d) =>
          d.docente_id === editing ? { ...d, ...form } : d
        )
      );
      cerrarEdicion();
      showToast("Datos del docente actualizados correctamente ✅", "success");
    } catch (err) {
      console.error(err);
      showToast("Error al actualizar el docente.", "error");
    }
  };

  const abrirConfirmacion = (d) => {
    setConfirmDelete(d);
  };

  const cerrarConfirmacion = () => {
    setConfirmDelete(null);
  };

  const eliminarDocente = async () => {
    if (!confirmDelete) return;
    try {
      await axios.delete(
        `${API_URL}/api/admin/docentes/${confirmDelete.docente_id}`
      );

      setDocentes((prev) =>
        prev.filter((d) => d.docente_id !== confirmDelete.docente_id)
      );
      showToast("Docente eliminado correctamente.", "success");
      cerrarConfirmacion();
    } catch (err) {
      console.error(err);
      showToast("Error al eliminar el docente.", "error");
    }
  };

  // ===== CREAR DOCENTE =====
  const abrirCrear = () => {
    setShowCreate(true);
    setCreateForm({
      nombre: "",
      apellido: "",
      correo: "",
      password: "",
      confirm: "",
    });
    setShowPass(false);
    setShowConfirmPass(false);
  };

  const cerrarCrear = () => {
    setShowCreate(false);
  };

  const crearDocente = async (e) => {
    e.preventDefault();

    if (createForm.password !== createForm.confirm) {
      showToast("Las contraseñas no coinciden.", "error");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/admin/docentes`, {
      nombre: createForm.nombre,
        apellido: createForm.apellido,
        correo: createForm.correo,
        contraseña: createForm.password,
      });

      await cargarDocentes();
      cerrarCrear();
      showToast("Docente creado correctamente ✅", "success");
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message ||
          "Error al crear el docente. Verifica los datos.",
        "error"
      );
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
          <h1>Docentes registrados</h1>
          <p className="admin-sub">
            Consulta, crea, edita o elimina los docentes registrados y revisa
            cuántos reportes han generado.
          </p>
        </div>
        <button className="btn-primary btn-create" onClick={abrirCrear}>
          + Crear docente
        </button>
      </header>

      {loading ? (
        <p>Cargando docentes...</p>
      ) : error ? (
        <p className="error-msg">{error}</p>
      ) : (
        <div className="tabla-wrapper">
          <div className="tabla-scroll">
            <table className="tabla-docentes">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Reportes generados</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docentes.map((d) => {
                  const total = Number(d.total_reportes || 0);
                  const many = total > 0;
                  return (
                    <tr key={d.docente_id}>
                      <td>{d.docente_id}</td>
                      <td>
                        {d.nombre} {d.apellido}
                      </td>
                      <td>{d.correo}</td>
                      <td>
                        <span
                          className={
                            many
                              ? "report-pill report-pill-positive"
                              : "report-pill report-pill-zero"
                          }
                        >
                          {total} {total === 1 ? "reporte" : "reportes"}
                        </span>
                      </td>
                      <td className="acciones-cell">
                        <button
                          className="btn-link"
                          type="button"
                          onClick={() => abrirEdicion(d)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-danger"
                          type="button"
                          onClick={() => abrirConfirmacion(d)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {docentes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-msg">
                      No hay docentes registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal CREAR docente */}
      {showCreate && (
        <div className="edit-overlay">
          <div className="edit-modal">
            <h2>Crear nuevo docente</h2>
            <form onSubmit={crearDocente} className="edit-form">
              <div className="form-row">
                <label>Nombre</label>
                <input
                  type="text"
                  value={createForm.nombre}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, nombre: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-row">
                <label>Apellido</label>
                <input
                  type="text"
                  value={createForm.apellido}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, apellido: e.target.value }))
                  }
                  required
                />
              </div>

              <div className="form-row">
                <label>Correo</label>
                <input
                  type="email"
                  value={createForm.correo}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, correo: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Contraseña */}
              <div className="form-row pass-row">
                <label>Contraseña</label>
                <div className="pass-wrapper">
                  <input
                    className="pass-input"
                    type={showPass ? "text" : "password"}
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, password: e.target.value }))
                    }
                    required
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowPass((v) => !v)}
                  >
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div className="form-row pass-row">
                <label>Confirmar contraseña</label>
                <div className="pass-wrapper">
                  <input
                    className="pass-input"
                    type={showConfirmPass ? "text" : "password"}
                    value={createForm.confirm}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, confirm: e.target.value }))
                    }
                    required
                  />
                  <button
                    type="button"
                    className="pass-toggle"
                    onClick={() => setShowConfirmPass((v) => !v)}
                  >
                    {showConfirmPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div className="edit-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={cerrarCrear}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear docente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {editing && (
        <div className="edit-overlay">
          <div className="edit-modal">
            <h2>Editar docente #{editing}</h2>
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

      {/* Modal de confirmación de borrado */}
      {confirmDelete && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h2>Eliminar docente</h2>
            <p>
              ¿Estás seguro de que quieres eliminar a{" "}
              <strong>
                {confirmDelete.nombre} {confirmDelete.apellido}
              </strong>
              ?
              <br />
              Esta acción puede afectar los registros relacionados.
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={cerrarConfirmacion}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={eliminarDocente}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
