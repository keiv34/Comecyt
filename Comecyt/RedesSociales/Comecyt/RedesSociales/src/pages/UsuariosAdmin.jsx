// src/pages/UsuariosAdmin.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../Css/UsuariosAdmin.css";

export default function UsuariosAdmin() {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(null); // id del alumno en edición
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
  });

  const [confirmDelete, setConfirmDelete] = useState(null); // alumno a borrar

  // 🔹 estado para CREAR alumno
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

  const cargarAlumnos = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/admin/alumnos"
      );
      setAlumnos(data);
      setError("");

      if (!data || data.length === 0) {
        showToast("No hay alumnos registrados todavía.", "info");
      } else {
        showToast("Lista de alumnos cargada correctamente ✅", "success");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los alumnos.");
      showToast(
        "Error al cargar los alumnos. Intenta nuevamente más tarde.",
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
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:4000/api/admin/alumnos/${editing}`,
        form
      );

      setAlumnos((prev) =>
        prev.map((al) =>
          al.alumno_id === editing ? { ...al, ...form } : al
        )
      );
      cerrarEdicion();
      showToast("Datos del alumno actualizados correctamente ✅", "success");
    } catch (err) {
      console.error(err);
      showToast("Error al actualizar el alumno.", "error");
    }
  };

  // abrir / cerrar modal de confirmación de borrado
  const abrirConfirmacion = (al) => {
    setConfirmDelete(al);
  };

  const cerrarConfirmacion = () => {
    setConfirmDelete(null);
  };

  const eliminarAlumno = async () => {
    if (!confirmDelete) return;
    try {
      await axios.delete(
        `http://localhost:4000/api/admin/alumnos/${confirmDelete.alumno_id}`
      );

      setAlumnos((prev) =>
        prev.filter((al) => al.alumno_id !== confirmDelete.alumno_id)
      );
      showToast("Alumno eliminado correctamente.", "success");
      cerrarConfirmacion();
    } catch (err) {
      console.error(err);
      showToast("Error al eliminar el alumno.", "error");
    }
  };

  // 🔢 progreso_m1 (0–29) → porcentaje
  const getPorcentaje = (al) => {
    const v = Number(al.progreso_m1 || 0);
    const porcentaje = (v / 29) * 100;
    return Math.max(0, Math.min(100, porcentaje));
  };

  // ===== CREAR ALUMNO =====
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

  const crearAlumno = async (e) => {
    e.preventDefault();

    if (createForm.password !== createForm.confirm) {
      showToast("Las contraseñas no coinciden.", "error");
      return;
    }

    try {
      await axios.post("http://localhost:4000/api/admin/alumnos", {
        nombre: createForm.nombre,
        apellido: createForm.apellido,
        correo: createForm.correo,
        contraseña: createForm.password,
      });

      await cargarAlumnos();
      cerrarCrear();
      showToast("Alumno creado correctamente ✅", "success");
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message ||
          "Error al crear el alumno. Verifica los datos.",
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
          <h1>Alumnos registrados</h1>
          <p className="admin-sub">
            Administra la lista de alumnos: crea nuevos registros, edita sus
            datos, revisa su progreso y elimina registros si es necesario.
          </p>
        </div>
        <button className="btn-primary btn-create" onClick={abrirCrear}>
          + Crear alumno
        </button>
      </header>

      {loading ? (
        <p>Cargando alumnos...</p>
      ) : error ? (
        <p className="error-msg">{error}</p>
      ) : (
        <div className="tabla-wrapper">
          <div className="tabla-scroll">
            <table className="tabla-alumnos">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Progreso módulo 1</th>
                  <th>Certificado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((al) => {
                  const percent = getPorcentaje(al);
                  const tieneCert = !!al.tiene_certificado;

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
                        {tieneCert ? (
                          <span className="tag-cert-ok">✔ Libre</span>
                        ) : (
                          <span className="tag-cert-lock">🔒 Pendiente</span>
                        )}
                      </td>
                      <td className="acciones-cell">
                        <button
                          className="btn-link"
                          type="button"
                          onClick={() => abrirEdicion(al)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-danger"
                          type="button"
                          onClick={() => abrirConfirmacion(al)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {alumnos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-msg">
                      No hay alumnos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal CREAR alumno */}
      {showCreate && (
        <div className="edit-overlay">
          <div className="edit-modal">
            <h2>Crear nuevo alumno</h2>
            <form onSubmit={crearAlumno} className="edit-form">
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
                  Crear alumno
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

      {/* Modal de confirmación de borrado */}
      {confirmDelete && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h2>Eliminar alumno</h2>
            <p>
              ¿Estás seguro de que quieres eliminar a{" "}
              <strong>
                {confirmDelete.nombre} {confirmDelete.apellido}
              </strong>
              ?<br />
              Esta acción no se puede deshacer.
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
                onClick={eliminarAlumno}
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
