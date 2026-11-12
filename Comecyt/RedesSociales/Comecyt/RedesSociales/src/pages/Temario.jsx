// src/pages/Temario.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { MODULOS } from "../curso/catalogo";
import { MessageCircle, CheckCircle2, Lock, Circle } from "lucide-react";
import "../Css/Temario.css";

function Temario() {
  const navigate = useNavigate();
  const [completados, setCompletados] = useState({}); // {1: [1,2,3], 2: [1],...}
  const [modulosVistaPrevia, setModulosVistaPrevia] = useState([]);
  const [loading, setLoading] = useState(true);
  const { api, user } = useAuth();
  const correo = user?.correo;
  const [errorProgreso, setErrorProgreso] = useState(false);

  useEffect(() => {
    const cargarProgreso = async () => {
      if (!correo) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.post("/api/alumno/progreso", { correo });

        // Agrupamos por modulo_id: {1: [1,2,3], 2: [1,2],...}
        const agrupados = {};
        res.data.contenidosCompletados.forEach(item => {
          if (!agrupados[item.modulo_id]) agrupados[item.modulo_id] = [];
          agrupados[item.modulo_id].push(Number(item.contenido_id));
        });

        setCompletados(agrupados);
        setModulosVistaPrevia(res.data.modulos_vista_previa ?? []);
      } catch (error) {
        console.error("Error cargando progreso:", error);
        setErrorProgreso(true);
      } finally {
        setLoading(false);
      }
    };

    cargarProgreso();
  }, [api, correo]);

  const estaCompletado = (moduloId, contenidoId) => {
    return completados[moduloId]?.includes(contenidoId) || false;
  };

  const estaBloqueado = (moduloId, contenidoId) => {
    return !modulosVistaPrevia.includes(moduloId) && contenidoId > 1 && !estaCompletado(moduloId, contenidoId) && !estaCompletado(moduloId, contenidoId - 1);
  };

  const handleClick = (tema, moduloId) => {
    if (estaBloqueado(moduloId, tema.contenidoId)) {
      alert("Contenido bloqueado. Debes completar los temas anteriores en orden.");
      return;
    }
    window.scrollTo(0, 0);
    navigate(`/modulo/${moduloId}/contenido/${tema.contenidoId}`);
  };

  if (loading) return <div className="temario-container"><p>Cargando progreso...</p></div>;

  return (
    <div className="temario-container">
      <h1 className="temario-titulo">📋 Temario del Curso</h1>

      {errorProgreso && <p role="alert">No se pudo cargar tu avance.</p>}

      {MODULOS.map(seccion => (
        <div key={seccion.id} className="modulo-card">
          <h2 className="modulo-titulo">{seccion.icono} {seccion.id}. {seccion.titulo}</h2>
          {modulosVistaPrevia.includes(seccion.id) && <p>Vista previa · Todas las lecciones disponibles</p>}
          <div className="temas-lista">
            {seccion.temas.map((tema) => {
              const completado = estaCompletado(seccion.moduloId, tema.contenidoId);
              const bloqueado = estaBloqueado(seccion.moduloId, tema.contenidoId);

              return (
                <div
                  key={tema.contenidoId}
                  className={`tema-item ${bloqueado ? 'bloqueado' : 'disponible'} ${completado ? 'completado' : ''}`}
                  onClick={() => handleClick(tema, seccion.moduloId)}
                >
                  <span className="tema-icono">
                    {bloqueado ? (
                      <Lock size={16} />
                    ) : completado ? (
                      <CheckCircle2 size={16} color="#22c55e" />
                    ) : (
                      <Circle size={16} color="#94a3b8" />
                    )}
                  </span>
                  <span className="tema-nombre">
                    {tema.contenidoId}. {tema.nombre}
                  </span>
                  {completado && <span className="check-text">Completado</span>}
                  {bloqueado && <span className="check-text">Bloqueado</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="whatsapp-support-container">
        <a
          href="https://wa.me/527121265349"
          className="whatsapp-float-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="float-content">
            <MessageCircle size={24} />
            <span>Ayuda WhatsApp</span>
          </div>
        </a>
      </div>
    </div>
  );
}

export default Temario;