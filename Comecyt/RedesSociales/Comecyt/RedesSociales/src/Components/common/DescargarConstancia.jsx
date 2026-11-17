import { useState } from "react";
import { Download } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "../../Css/PanelAlumno.css";

export default function DescargarConstancia({ moduloId }) {
  const { api } = useAuth();
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");

  async function descargar() {
    setGenerando(true);
    setError("");
    try {
      const { data } = await api.post("/api/certificados/generar", { modulo_id: moduloId }, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `Constancia_AGORA_Modulo_${moduloId}.pdf`;
      enlace.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (fallo) {
      const respuesta = fallo.response?.data;
      const detalle = respuesta instanceof Blob ? await respuesta.text().then(JSON.parse).catch(() => null) : respuesta;
      setError(detalle?.error || "No pudimos descargar la constancia. Intenta de nuevo.");
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div>
      <button type="button" className="panel-alumno__boton" onClick={descargar} disabled={generando}>
        <Download size={17} aria-hidden="true" /> {generando ? "Generando…" : "Descargar constancia"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
