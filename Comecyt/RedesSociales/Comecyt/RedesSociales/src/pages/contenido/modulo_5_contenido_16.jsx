import { BookOpen, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import "@/Css/ModuloFinal.css";

export default function CierreEducaplay({ onComplete }) {
  return (
    <div className="modulo-final-container">
      <section className="graduacion-card" aria-labelledby="cierre-educaplay">
        <h1 id="cierre-educaplay" className="titulo-graduacion">Retos Educaplay</h1>
        <p className="texto-principal">Llegaste al final de los retos. Marca este módulo como completado para obtener su constancia.</p>
        <div className="acciones-finales">
          <button type="button" className="btn-descargar-certificado" onClick={onComplete}>
            <CheckCircle size={22} aria-hidden="true" /> Completar módulo
          </button>
          <Link className="btn-volver-inicio" to="/contenidos">
            <BookOpen size={20} aria-hidden="true" /> Volver al temario
          </Link>
        </div>
      </section>
    </div>
  );
}
