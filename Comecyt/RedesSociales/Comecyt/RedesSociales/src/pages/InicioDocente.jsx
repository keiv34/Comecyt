// src/pages/InicioDocente.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../Css/InicioDocente.css";

export default function InicioDocente() {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/docente/dashboard-resumen"
        );
        setResumen(data || null);
        setError("");

        if (!data) {
          showToast(
            "No se encontró información para el panel del docente.",
            "info"
          );
        } else {
          showToast("Información del panel cargada correctamente ✅", "success");
        }
      } catch (err) {
        console.error(err);
        setError("Ocurrió un error al cargar el dashboard del docente.");
        showToast(
          "No se pudo cargar la información del panel. Intenta más tarde.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResumen();
  }, []);

  const {
    totalAlumnos = 0,
    totalCertificados = 0,
    promedioGeneral = null,
    top3Alumnos = [],
    progresoAlumnos = [],
  } = resumen || {};

  return (
    <div className="docente-page docente-dashboard">
      {/* 🔔 TOAST GLOBAL */}
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="docente-header">
        <h1>Panel del docente</h1>
        <p className="docente-sub">
          Resumen general de alumnos, calificaciones y certificados.
        </p>
      </header>

      {/* ESTADOS DE CARGA / ERROR / CONTENIDO */}
      {loading ? (
        <div>Cargando información...</div>
      ) : error ? (
        <div className="error-msg">{error}</div>
      ) : (
        <>
          {/* Tarjetas de resumen */}
          <section className="doc-cards-grid">
            <article className="doc-card stat-card">
              <p className="stat-label">Alumnos inscritos</p>
              <p className="stat-value">{totalAlumnos}</p>
            </article>

            <article className="doc-card stat-card">
              <p className="stat-label">Certificados emitidos</p>
              <p className="stat-value">{totalCertificados}</p>
            </article>

            <article className="doc-card stat-card">
              <p className="stat-label">Promedio general</p>
              <p className="stat-value">
                {promedioGeneral !== null
                  ? `${Number(promedioGeneral).toFixed(1)} / 100`
                  : "—"}
              </p>
            </article>
          </section>

          <div className="docente-main-grid">
            {/* Top 3 mejores promedios */}
            <section className="doc-card top-section">
              <h2 className="section-title">
                Top 3 alumnos con mejor promedio
              </h2>
              {top3Alumnos.length === 0 ? (
                <p className="empty-msg">Aún no hay resultados registrados.</p>
              ) : (
                <ol className="top-list">
                  {top3Alumnos.map((al, idx) => (
                    <li key={al.alumno_id}>
                      <span className="top-rank">#{idx + 1}</span>
                      <span className="top-name">
                        {al.nombre} {al.apellido}
                      </span>
                      <span className="top-score">
                        {Number(al.promedio || 0).toFixed(1)} pts
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* “Gráfica” simple de progreso por alumno */}
            <section className="doc-card progress-section">
              <h2 className="section-title">Progreso por alumno (Módulo 1)</h2>

              {progresoAlumnos.length === 0 ? (
                <p className="empty-msg">Sin datos de progreso todavía.</p>
              ) : (
                <ul className="progress-list">
                  {progresoAlumnos.map((al) => {
                    // progreso (0–29) → porcentaje
                    const valor = Number(al.progreso || 0);
                    const percentRaw = (valor / 29) * 100;
                    const percent = Math.max(
                      0,
                      Math.min(100, Math.round(percentRaw))
                    );

                    return (
                      <li key={al.alumno_id} className="progress-item">
                        <div className="progress-label">
                          {al.nombre} {al.apellido}
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="progress-value">{percent}%</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
