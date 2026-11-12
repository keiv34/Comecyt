import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { imagenLeccion } from "../../curso/imagenesLecciones";
import { leccionesNuevas } from "../../curso/leccionesNuevas";
import { leccionesSeguridadDigital } from "../../curso/seguridadDigital";
import "../../Css/LeccionesGuiadas.css";

export default function LeccionGuiada({ moduloId, numContenido, onComplete }) {
  const lecciones = leccionesNuevas[moduloId] ?? leccionesSeguridadDigital;
  const { titulo, intro, bloques, video, recursos, caso } = lecciones[numContenido - 1];
  const imagen = imagenLeccion(moduloId, numContenido);
  const [respuesta, setRespuesta] = useState(null);
  const [revisada, setRevisada] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardada, setGuardada] = useState(false);
  const acierto = revisada && respuesta === caso.correcta;

  async function guardar() {
    setGuardando(true);
    try {
      setGuardada(await onComplete());
    } finally {
      setGuardando(false);
    }
  }

  return (
    <article className="leccion-guiada">
      <header className="leccion-guiada__cabecera">
        <p>Módulo {moduloId} · Lección {numContenido} de {lecciones.length}</p>
        <h1>{titulo}</h1>
      </header>

      <div className="leccion-guiada__contenido">
        <section className="leccion-guiada__tarjeta">
          <h2>Introducción</h2>
          <div className="leccion-guiada__cuerpo"><p>{intro}</p></div>
        </section>

        {bloques.map(([nombre, ...parrafos], indice) => (
          <section className="leccion-guiada__tarjeta" key={nombre}>
            <h2>
              <span className="leccion-guiada__numero">{numContenido}.{indice + 1}</span>
              {nombre}
            </h2>
            <div className={`leccion-guiada__cuerpo${indice === 0 ? " leccion-guiada__columnas" : ""}`}>
              <div>{parrafos.map(parrafo => <p key={parrafo}>{parrafo}</p>)}</div>
              {indice === 0 && imagen.url && <FiguraLeccion imagen={imagen} />}
            </div>
          </section>
        ))}

        {video && <VideoLeccion video={video} />}

        <section className="leccion-guiada__tarjeta">
          <h2>Caso práctico</h2>
          <div className="leccion-guiada__cuerpo">
            <fieldset className="leccion-guiada__pregunta">
              <legend>{caso.pregunta}</legend>
              {caso.opciones.map((opcion, index) => (
                <label key={opcion} className="leccion-guiada__opcion">
                  <input type="radio" name="caso" checked={respuesta === index} onChange={() => { setRespuesta(index); setRevisada(false); }} disabled={acierto} />
                  {opcion}
                </label>
              ))}
            </fieldset>
            {revisada && (
              <p role="status" className={`leccion-guiada__feedback${acierto ? "" : " leccion-guiada__feedback--revisar"}`}>
                {acierto ? caso.explicacion : "Revisa las recomendaciones de la lección y prueba otra opción."}
              </p>
            )}
            {!acierto && <button className="leccion-guiada__boton" disabled={respuesta === null || revisada} onClick={() => setRevisada(true)}>Comprobar respuesta</button>}
            {acierto && (
              <button className="leccion-guiada__boton" disabled={guardando || guardada} onClick={guardar}>
                {guardada ? <><CheckCircle2 size={18} aria-hidden="true" /> Lección completada</> : guardando ? "Guardando…" : "Marcar lección como completada"}
              </button>
            )}
          </div>
        </section>

        {recursos?.length > 0 && (
          <section className="leccion-guiada__tarjeta">
            <h2>Recursos de consulta</h2>
            <div className="leccion-guiada__cuerpo">
              <ul>{recursos.map(([nombre, url]) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{nombre}</a></li>)}</ul>
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function FiguraLeccion({ imagen }) {
  const { url, descripcion, columnas, columna, fila } = imagen;
  return (
    <figure className="leccion-guiada__figura">
      <div className="leccion-guiada__imagen" style={{ "--proporcion": columnas === 3 ? "1 / 1" : "4 / 3" }}>
        <img src={url} alt={descripcion} decoding="async" style={{ width: `${columnas * 100}%`, left: `${-columna * 100}%`, top: `${-fila * 100}%` }} />
      </div>
      <figcaption>Imagen ilustrativa · {descripcion}</figcaption>
    </figure>
  );
}

function VideoLeccion({ video }) {
  const [reproducir, setReproducir] = useState(false);
  return (
    <section className="leccion-guiada__tarjeta">
      <h2>Video · {video.titulo}</h2>
      <div className="leccion-guiada__cuerpo">
        {video.autor && <p>Video de {video.autor}</p>}
        {reproducir ? (
          <iframe
            className="leccion-guiada__video"
            title={video.titulo}
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&cc_load_policy=1`}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : <button className="leccion-guiada__boton" onClick={() => setReproducir(true)}>Reproducir video</button>}
        <p className="leccion-guiada__video-enlace"><a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer">Ver en YouTube</a></p>
      </div>
    </section>
  );
}
