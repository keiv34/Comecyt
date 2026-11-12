import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../Css/LeccionesGuiadas.css";

export default function EvaluacionGuiada({ moduloId, tituloModulo, onComplete }) {
  const endpoint = `/api/alumno/modulo/${moduloId}/evaluacion`;
  const { api } = useAuth();
  const [examen, setExamen] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [completada, setCompletada] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    api.get(endpoint, { signal: controller.signal }).then(({ data }) => {
      setExamen(data);
      if (data.puntaje !== null) setResultado({ puntaje: data.puntaje, aprobado: data.aprobado });
    }).catch(err => {
      if (!controller.signal.aborted) setError(err.response?.data?.error || "No se pudo cargar la evaluación.");
    });
    return () => controller.abort();
  }, [api, endpoint]);

  async function enviar(event) {
    event.preventDefault();
    if (ocupado) return;
    setOcupado(true);
    setError("");
    try {
      const opciones = examen.preguntas.map((_, index) => respuestas[index]);
      const { data } = await api.post(endpoint, { respuestas: opciones });
      setResultado(data);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo guardar el intento. Puedes enviarlo de nuevo.");
    } finally {
      setOcupado(false);
    }
  }

  async function completar() {
    setOcupado(true);
    try {
      setCompletada(await onComplete());
    } finally {
      setOcupado(false);
    }
  }

  return (
    <article className="leccion-guiada">
      <header className="leccion-guiada__cabecera">
        <p>Módulo {moduloId} · {tituloModulo}</p>
        <h1>Evaluación final</h1>
      </header>

      <div className="leccion-guiada__contenido">
        <section className="leccion-guiada__tarjeta">
          <h2>Instrucciones</h2>
          <div className="leccion-guiada__cuerpo">
            {examen && <p>Contesta los {examen.preguntas.length} reactivos. Necesitas {examen.minimo} de 100 puntos para aprobar.</p>}
            {error && <p className="leccion-guiada__feedback leccion-guiada__feedback--revisar" role="alert">{error}</p>}
            {!examen && !error && <p role="status">Cargando evaluación…</p>}
          </div>
        </section>

        {examen && resultado && (
          <section className="leccion-guiada__tarjeta">
            <h2>Resultado</h2>
            <div className="leccion-guiada__cuerpo">
              <p role="status" className={`leccion-guiada__feedback${resultado.aprobado ? "" : " leccion-guiada__feedback--revisar"}`}>
                Obtuviste {resultado.puntaje} de 100. {resultado.aprobado ? "Aprobaste la evaluación." : "Repasa las lecciones y vuelve a intentarlo."}
              </p>
              {resultado.aprobado ? (
                <button className="leccion-guiada__boton" onClick={completar} disabled={ocupado || completada}>
                  {completada ? "Módulo completado" : ocupado ? "Guardando…" : "Completar módulo"}
                </button>
              ) : <button className="leccion-guiada__boton" onClick={() => { setRespuestas({}); setResultado(null); }}>Intentar de nuevo</button>}
            </div>
          </section>
        )}

        {examen && !resultado && (
          <section className="leccion-guiada__tarjeta">
            <h2>Cuestionario</h2>
            <form className="leccion-guiada__cuerpo" onSubmit={enviar}>
              {examen.preguntas.map(({ enunciado, opciones }, index) => (
                <fieldset className="leccion-guiada__pregunta" key={enunciado} disabled={ocupado}>
                  <legend>{index + 1}. {enunciado}</legend>
                  {opciones.map((opcion, opcionIndex) => (
                    <label className="leccion-guiada__opcion" key={opcion}>
                      <input type="radio" name={`pregunta-${index}`} checked={respuestas[index] === opcionIndex} onChange={() => setRespuestas(prev => ({ ...prev, [index]: opcionIndex }))} />
                      {opcion}
                    </label>
                  ))}
                </fieldset>
              ))}
              <p className="leccion-guiada__contador">{Object.keys(respuestas).length} de {examen.preguntas.length} contestadas</p>
              <button className="leccion-guiada__boton" disabled={ocupado || Object.keys(respuestas).length !== examen.preguntas.length}>
                {ocupado ? "Calificando…" : "Finalizar evaluación"}
              </button>
            </form>
          </section>
        )}
      </div>
    </article>
  );
}
