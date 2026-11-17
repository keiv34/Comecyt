import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { imagenLeccion } from "../../curso/imagenesLecciones";
import { leccionesCobrosDigitales } from "../../curso/cobrosDigitales";
import { leccionesNuevas } from "../../curso/leccionesNuevas";
import { practicasGuiadas } from "../../curso/practicasGuiadas";
import { leccionesSeguridadDigital } from "../../curso/seguridadDigital";
import "../../Css/LeccionesGuiadas.css";

const leccionesPorModulo = { 6: leccionesCobrosDigitales, 7: leccionesSeguridadDigital, ...leccionesNuevas };

export default function LeccionGuiada({ moduloId, numContenido, numeroModulo, tituloModulo, onComplete }) {
  const lecciones = leccionesPorModulo[moduloId];
  const { titulo, intro, bloques, ejemplo, video, recursos, caso } = lecciones[numContenido - 1];
  const practica = practicasGuiadas[moduloId][numContenido - 1];
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
        <p>Módulo {numeroModulo} · {tituloModulo} · Lección {numContenido} de {lecciones.length}</p>
        <h1>{titulo}</h1>
        <p className="leccion-guiada__intro">{intro}</p>
      </header>

      <div className="leccion-guiada__contenido">
        {bloques.map(([nombre, ...parrafos], indice) => {
          const tieneApoyo = indice === 0 && (imagen || ejemplo);
          return (
            <section className="leccion-guiada__tarjeta" key={nombre}>
              <h2>
                <span className="leccion-guiada__numero">{numContenido}.{indice + 1}</span>
                {nombre}
              </h2>
              <div className={`leccion-guiada__cuerpo${tieneApoyo ? " leccion-guiada__columnas" : ""}`}>
                <div>{parrafos.map(parrafo => <p key={parrafo}>{parrafo}</p>)}</div>
                {tieneApoyo && (imagen ? <FiguraLeccion imagen={imagen} /> : <EjemploLeccion ejemplo={ejemplo} />)}
              </div>
            </section>
          );
        })}

        <section className="leccion-guiada__tarjeta">
          <h2><span className="leccion-guiada__numero">{numContenido}.{bloques.length + 1}</span>{practica.titulo}</h2>
          <div className="leccion-guiada__cuerpo">
            <ol className="leccion-guiada__pasos">{practica.pasos.map(paso => <li key={paso}>{paso}</li>)}</ol>
          </div>
        </section>

        {video && <VideoLeccion video={video} />}

        {recursos?.length > 0 && (
          <section className="leccion-guiada__tarjeta">
            <h2>Recursos de consulta</h2>
            <div className="leccion-guiada__cuerpo">
              <ul>{recursos.map(([nombre, url]) => <li key={url}><a href={url} target="_blank" rel="noreferrer">{nombre}</a></li>)}</ul>
            </div>
          </section>
        )}

        <section className="leccion-guiada__tarjeta leccion-guiada__actividad">
          <h2><span className="leccion-guiada__numero">{numContenido}.{bloques.length + 2}</span>Actividad práctica</h2>
          <div className="leccion-guiada__cuerpo"><p>{practica.actividad}</p></div>
        </section>

        <section className="leccion-guiada__tarjeta">
          <h2><span className="leccion-guiada__numero">{numContenido}.{bloques.length + 3}</span>Comprueba lo aprendido</h2>
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
      </div>
    </article>
  );
}

function EjemploLeccion({ ejemplo }) {
  return (
    <div className="leccion-guiada__ejemplo">
      <h3>{ejemplo.titulo}</h3>
      <dl>
        {ejemplo.datos.map(([etiqueta, valor]) => (
          <div key={etiqueta}>
            <dt>{etiqueta}</dt>
            <dd>{valor}</dd>
          </div>
        ))}
      </dl>
    </div>
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
