// src/pages/CalificacionesDocente.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../Css/CalificacionesDocente.css";

export default function CalificacionesDocente() {
  const [top5, setTop5] = useState([]);
  const [lista, setLista] = useState([]);
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
    const fetchData = async () => {
      try {
        const [rTop, rLista] = await Promise.all([
          axios.get(`${API_URL}/api/docente/calificaciones/top5"),
          axios.get(`${API_URL}/api/docente/calificaciones`)
        ]);

        setTop5(rTop.data || []);
        setLista(rLista.data || []);
        setError("");

        if ((rTop.data || []).length === 0 && (rLista.data || []).length === 0) {
          showToast(
            "No hay calificaciones registradas todavía.",
            "info"
          );
        } else {
          showToast("Calificaciones cargadas correctamente ✅", "success");
        }
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las calificaciones.");
        showToast(
          "No se pudieron cargar las calificaciones. Intenta más tarde.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 0–15 promedio por evaluación → lo llevamos a 0–60 (4 evaluaciones)
  const getPromedio60 = (promedio15) => {
    const p = Number(promedio15 || 0);
    const total = p * 4; // 4 evaluaciones de 15 pts
    return total;
  };

  // 🔹 Estilos para la pastilla de puntaje (0 = rojo, 15 = verde)
  const getScoreStyles = (puntaje) => {
    const p = Math.max(0, Math.min(15, Number(puntaje || 0))); // 0–15
    const ratio = p / 15; // 0–1
    const hue = 0 + 120 * ratio; // 0=rojo, 120=verde

    return {
      backgroundColor: `hsl(${hue}, 85%, 95%)`,
      borderColor: `hsl(${hue}, 70%, 45%)`,
      color: "#111827",
    };
  };

  return (
    <div className="docente-page">
      {/* 🔔 TOAST GLOBAL DE CALIFICACIONES */}
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="docente-header">
        <h1>Calificaciones</h1>
        <p className="docente-sub">
          Revisa el top 5 de mejores promedios y el detalle de cada evaluación.
        </p>
      </header>

      {loading ? (
        <p>Cargando calificaciones...</p>
      ) : error ? (
        <p className="error-msg">{error}</p>
      ) : (
        <>
          {/* Top 5 */}
          <section className="doc-card top5-card">
            <h2 className="section-title">Top 5 alumnos con mejor promedio</h2>
            {top5.length === 0 ? (
              <p className="empty-msg">Aún no hay resultados en el sistema.</p>
            ) : (
              <ol className="top5-list">
                {top5.map((al, idx) => {
                  const total60 = getPromedio60(al.promedio); // 0–60
                  const equiv = (total60 / 60) * 100; // 0–100, sin símbolo %

                  return (
                    <li key={al.alumno_id}>
                      <span className="top5-rank">#{idx + 1}</span>
                      <span className="top5-name">
                        {al.nombre} {al.apellido}
                      </span>
                      <span className="top5-score">
                        {total60.toFixed(1)} / 60 pts ({equiv.toFixed(1)})
                      </span>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          {/* Tabla de calificaciones */}
          <section className="doc-card tabla-calif-card">
            <h2 className="section-title">Detalle de calificaciones</h2>
            <div className="tabla-calif-wrapper">
              <div className="tabla-calif-scroll">
                <table className="tabla-calif">
                  <thead>
                    <tr>
                      <th>Alumno</th>
                      <th>Evidencia / Evaluación</th>
                      <th>Puntaje</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((row) => {
                      const scoreStyle = getScoreStyles(row.puntaje);
                      return (
                        <tr key={row.resultado_id}>
                          <td>
                            {row.nombre} {row.apellido}
                          </td>
                          <td>
                            {row.titulo || `Evaluación #${row.evaluacion_id}`}
                          </td>
                          {/* 🔹 Pastilla con fondito de color */}
                          <td className="cell-score">
                            <span className="score-pill" style={scoreStyle}>
                              {row.puntaje}
                            </span>
                          </td>
                          <td>
                            {row.fecha
                              ? new Date(row.fecha).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                    {lista.length === 0 && (
                      <tr>
                        <td colSpan={4} className="empty-msg">
                          No hay registros de calificaciones todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
