// src/pages/CertificadosDocente.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "../Css/CertificadosDocente.css";

export default function CertificadosDocente() {
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCert, setSelectedCert] = useState(null);

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
    const fetchCerts = async () => {
      try {
        const { data } = await axios.get(
          "https://backend-production-0a25.up.railway.app/api/docente/certificados"
        );
        setLista(data || []);
        setError("");

        if (!data || data.length === 0) {
          showToast("Todavía no hay certificados registrados.", "info");
        } else {
          showToast("Certificados cargados correctamente ✅", "success");
        }
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los certificados.");
        showToast(
          "No se pudieron cargar los certificados. Intenta más tarde.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const abrirModal = (cert) => {
    if (!cert.ruta_archivo) {
      showToast("Este certificado no tiene archivo asociado.", "error");
      return;
    }
    setSelectedCert(cert);
    showToast("Abriendo certificado…", "info");
  };

  const cerrarModal = () => setSelectedCert(null);

  return (
    <div className="docente-page">
      {/* 🔔 TOAST GLOBAL */}
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="docente-header">
        <h1>Certificados</h1>
        <p className="docente-sub">
          Consulta los certificados emitidos y visualiza el archivo generado.
        </p>
      </header>

      {loading ? (
        <p>Cargando certificados...</p>
      ) : error ? (
        <p className="error-msg">{error}</p>
      ) : (
        <section className="doc-card tabla-cert-card">
          <h2 className="section-title">Certificados emitidos</h2>
          <div className="tabla-wrapper">
            <table className="tabla-cert">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Alumno</th>
                  <th>Módulo</th>
                  <th>Fecha de emisión</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((c) => (
                  <tr key={c.certificado_id}>
                    <td>{c.certificado_id}</td>
                    <td>
                      {c.nombre} {c.apellido}
                    </td>
                    <td>{c.modulo_id}</td>
                    <td>
                      {c.fecha_emision
                        ? new Date(c.fecha_emision).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      {c.ruta_archivo ? (
                        <button
                          type="button"
                          className="btn-ver"
                          onClick={() => abrirModal(c)}
                        >
                          Ver
                        </button>
                      ) : (
                        <span className="tag-pendiente">Sin archivo</span>
                      )}
                    </td>
                  </tr>
                ))}
                {lista.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-msg">
                      Todavía no hay certificados registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 🟢 Modal del PDF */}
      {selectedCert && (
        <div className="cert-modal-backdrop" onClick={cerrarModal}>
          <div
            className="cert-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cert-modal-header">
              <div>
                <div>Certificado</div>
                <div className="cert-modal-sub">
                  {selectedCert.nombre} {selectedCert.apellido} · Módulo{" "}
                  {selectedCert.modulo_id}
                </div>
              </div>
              <button
                type="button"
                className="cert-modal-close"
                onClick={cerrarModal}
              >
                ×
              </button>
            </header>

            <div className="cert-modal-body">
              <iframe
                src={selectedCert.ruta_archivo}
                title={`Certificado ${selectedCert.certificado_id}`}
                className="cert-modal-frame"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
