import { BookOpen, FolderOpen, LockKeyhole } from "lucide-react";
import "../../Css/Acceso.css";

export default function MarcoAcceso({ tituloId, children }) {
  return (
    <main className="acceso-agora">
      <section className="acceso-agora__marca" aria-label="ÁGORA COMECYT">
        <div className="acceso-agora__firma">
          <span className="acceso-agora__simbolo"><BookOpen size={24} aria-hidden="true" /></span>
          <span><strong>ÁGORA</strong><small>COMECYT</small></span>
        </div>
        <div className="acceso-agora__presentacion">
          <h1>Habilidades digitales para la vida diaria</h1>
          <p>Aprende a colaborar, comunicarte y usar herramientas digitales con confianza.</p>
        </div>
        <div className="acceso-agora__temas" aria-label="Temas de aprendizaje">
          <span><FolderOpen aria-hidden="true" size={18} /> Colaboración</span>
          <span><LockKeyhole aria-hidden="true" size={18} /> Seguridad digital</span>
        </div>
      </section>
      <section className="acceso-agora__panel" aria-labelledby={tituloId}>
        <div className="acceso-agora__contenido">{children}</div>
      </section>
    </main>
  );
}
