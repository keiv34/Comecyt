// src/pages/contenido/modulo_1_contenido_26.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_4_contenido_5.css";

import igBuscarPaso1 from "../../assets/igBuscarPaso1.png";
import igBuscarPaso2 from "../../assets/igBuscarPaso2.png";
import igBuscarPaso3 from "../../assets/igBuscarPaso3.png";

import igRecomendPaso1 from "../../assets/igRecomendPaso1.png";
import igRecomendPaso2 from "../../assets/igRecomendPaso2.png";
import igInteraccionPaso1 from "../../assets/igInteraccionPaso1.png";
import igInteraccionPaso2 from "../../assets/igInteraccionPaso2.png";

const API_URL = "http://localhost:4000";
const MODULO_ID = 4; // ✅ Es módulo 4
const NUM_CONTENIDO = 5;
const TOTAL_PREGUNTAS = 6;

export default function ContenidoInstagramBusquedaDescubrimiento() {
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const [tiempoRestante, setTiempoRestante] = useState(120);
  const [timerTerminado, setTimerTerminado] = useState(false);
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const [gated, setGated] = useState(true);
  const [progreso, setProgreso] = useState(0);

  // ✅ CAMBIO 1: States nuevos para el fix
  const [totalContenidos, setTotalContenidos] = useState(26);
  const [modulos, setModulos] = useState([]);

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido26");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500);
  };

  const correctAnswers = {
    q1: "barraBuscar",
    q2: "hashtags",
    q3: "lugares",
    q4: "recomendaciones",
    q5: "guardar",
    q6: "comentarioResp",
  };

  // ✅ CAMBIO 2: useEffect modificado con setModulos y setTotalContenidos
  useEffect(() => {
    const fetchProgreso = async () => {
      try {
        const correo = localStorage.getItem("correo");
        if (!correo) {
          setProgresoCargado(true);
          return;
        }

        const resp = await axios.post(
          `${API_URL}/api/alumno/progreso`,
          { correo }
        );
        const modulosData = resp.data.modulos || [];
        setModulos(modulosData); // 👈 NUEVO

        const modulo = modulosData.find((m) => m.modulo_id === MODULO_ID);
        if (modulo) {
          setTotalContenidos(modulo.total_contenidos); // 👈 NUEVO
          const p = Number(modulo?.progreso_actual ?? 0);
          setProgreso(p);

          if (p >= NUM_CONTENIDO) {
            setGated(false);
            setTimerTerminado(true);
            setScrolledBottom(true);
          } else {
            setGated(true);
          }
        }
      } catch (err) {
        console.error("Error obteniendo progreso:", err);
        showToast(
          "No se pudo obtener tu progreso, pero puedes seguir leyendo.",
          "error"
        );
      } finally {
        setProgresoCargado(true);
      }
    };

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    fetchProgreso();
  }, []);

  useEffect(() => {
    if (!progresoCargado) return;

    if (gated) {
      setTiempoRestante(120);
      setTimerTerminado(false);
    } else {
      setTiempoRestante(0);
      setTimerTerminado(true);
      setScrolledBottom(true);
      return;
    }

    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerTerminado(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gated, progresoCargado]);

  useEffect(() => {
    if (!gated) return;

    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.documentElement.offsetHeight;
      if (scrollPosition >= pageHeight - 80) setScrolledBottom(true);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [gated]);

  const puedeAvanzar = !gated || (timerTerminado && scrolledBottom);

  const formatearTiempo = (segundos) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({ ...prev, [name]: value }));
    setQuizAnswered(false);
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();

    let score = 0;
    const newFeedback = {};

    Object.keys(correctAnswers).forEach((key) => {
      if (answers[key] === correctAnswers[key]) {
        score++;
        newFeedback[key] = "correct";
      } else {
        newFeedback[key] = "incorrect";
      }
    });

    setFeedback(newFeedback);
    setQuizScore(score);
    setQuizAnswered(true);

    showToast(
      `Obtuviste ${score} de ${TOTAL_PREGUNTAS} respuestas correctas.`,
      score >= 5 ? "success" : "info"
    );
  };

  // 🔙 Anterior
  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/modulo/1/contenido/25"); // ✅ Va al contenido 25
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  if (!progresoCargado) {
    return (
      <div className="ig5-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#833ab4'
        }}>
          <p>Cargando contenido...</p>
        </div>
      </div>
    );
  }



  const finalizarContenido = async () => {
    if (!puedeAvanzar) return;
    setGuardando(true);
    const correo = localStorage.getItem("correo");
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${API_URL}/api/alumno/progreso/actualizar`,
        { correo, modulo_id: MODULO_ID, progreso_actual: NUM_CONTENIDO },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      if (response.data?.success) {
        window.scrollTo(0, 0);
        // si es el último contenido, vuelve al inicio
        if (NUM_CONTENIDO >= totalContenidos) {
          navigate("/inicio");
        } else {
          navigate(`/modulo/${MODULO_ID}/contenido/${NUM_CONTENIDO + 1}`);
        }
      } else {
        setToast('Error al guardar progreso. Intenta de nuevo.');
        setTimeout(() => setToast(""), 3000);
      }
    } catch (err) {
      console.error("❌ Error al guardar:", err.response?.data || err);
      setToast('Error de conexión al guardar progreso');
      setTimeout(() => setToast(""), 3000);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="ig5-container">
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="ig5-header">
        <div className="ig5-header-inner">
          <h1>Instagram: Interacción y herramientas de búsqueda</h1>
          <p className="sub">
            Funciones más usadas de Instagram:
            <strong> Historias</strong> (contenido rápido),
            <strong> Reels</strong> (videos cortos) y
            <strong> DM</strong> (mensajes privados).
          </p>
        </div>
      </header>

      <main className="content-grid">
        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">5.0</span>
              ¿Qué aprenderás en este tema?
            </h2>
          </header>
          <div className="card-body">
            <p>
              Instagram no solo sirve para publicar, también es una herramienta para{" "}
              <strong>buscar</strong> personas, temas y lugares. En esta unidad aprenderás
              a usar la búsqueda de forma inteligente, entender por qué te aparecen
              ciertas publicaciones y cómo interactuar sin caer en riesgos (spam,
              cuentas falsas o información engañosa).
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">5.1</span>
              Barra de búsqueda (personas, hashtags, lugares)
            </h2>
          </header>

          <div className="card-body">
            <p>
              La <strong>barra de búsqueda</strong> te ayuda a encontrar contenido usando{" "}
              <strong>usuarios</strong> (personas), <strong>hashtags</strong> (temas) y{" "}
              <strong>lugares</strong>. Es clave para descubrir cuentas nuevas o información
              relacionada con un tema específico.
            </p>

            <div className="mini-grid">
              <div className="mini-card">
                <h3 className="mini-title">¿Qué puedes buscar?</h3>
                <ul className="mini-list">
                  <li><strong>Personas:</strong> por usuario o nombre.</li>
                  <li><strong>Hashtags:</strong> temas como #tareas, #recetas, #deporte.</li>
                  <li><strong>Lugares:</strong> ciudades o negocios.</li>
                  <li><strong>Audios / reels:</strong> según lo que te muestre la app.</li>
                </ul>
              </div>

              <div className="mini-card">
                <h3 className="mini-title">Consejos para buscar mejor</h3>
                <ul className="mini-list">
                  <li>Escribe pocas palabras y revisa sugerencias.</li>
                  <li>Abre el perfil antes de seguir (verifica que sea real).</li>
                  <li>Evita cuentas con enlaces raros o mensajes sospechosos.</li>
                  <li>Si no te interesa un tema, deja de buscarlo (cambia recomendaciones).</li>
                </ul>
              </div>
            </div>

            <p className="pasos-intro">Pasos para buscar correctamente:</p>

            <ul className="lista-pasos-img">
              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 1:</strong></p>
                <p className="paso-texto">
                  Toca el ícono de <strong>lupa</strong> (Buscar/Explorar) y entra a la{" "}
                  <strong>barra</strong> de búsqueda.
                </p>
                <figure className="paso-figure">
                  <img src={igBuscarPaso1} alt="Entrar a explorar" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 2:</strong></p>
                <p className="paso-texto">
                  Escribe lo que quieres: un <strong>usuario</strong>, un <strong>#hashtag</strong>{" "}
                  o un <strong>lugar</strong>. Luego elige la pestaña correcta (Cuentas/Tags/Lugares).
                </p>
                <figure className="paso-figure">
                  <img src={igBuscarPaso2} alt="Buscar por pestañas" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 3:</strong></p>
                <p className="paso-texto">
                  Abre el resultado y revisa: foto, publicaciones y descripción. Si es negocio,
                  revisa si tiene datos claros (horario, ubicación, contacto).
                </p>
                <figure className="paso-figure">
                  <img src={igBuscarPaso3} alt="Revisar perfil" className="paso-img" />
                </figure>
              </li>
            </ul>

            <p className="hint">
              Tip: Si buscas un tema (ej. “tacos”), prueba también con #tacos, #tacosmexico o “tacos + tu ciudad”.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">5.2</span>
              Recomendaciones de Instagram
            </h2>
          </header>

          <div className="card-body">
            <p>
              Las <strong>recomendaciones</strong> son publicaciones que Instagram te muestra
              porque cree que te interesan. Se basan en lo que{" "}
              <strong>ves, buscas, guardas, comentas</strong> y en las cuentas que sigues.
            </p>

            <div className="mini-grid">
              <div className="mini-card">
                <h3 className="mini-title">¿Cómo decide qué mostrarte?</h3>
                <ul className="mini-list">
                  <li>Lo que ves por más tiempo (aunque no des like).</li>
                  <li>Las cuentas que sigues y el tipo de contenido que consumen.</li>
                  <li>Los hashtags o temas que buscas.</li>
                  <li>Los reels o publicaciones que guardas o compartes.</li>
                </ul>
              </div>

              <div className="mini-card">
                <h3 className="mini-title">¿Cómo mejorar tus recomendaciones?</h3>
                <ul className="mini-list">
                  <li>Deja de seguir cuentas que no te aporten.</li>
                  <li>Usa “<strong>No me interesa</strong>” para algo que no quieres ver.</li>
                  <li>Busca temas útiles (educación, tutoriales, noticias confiables).</li>
                  <li>Evita interactuar con contenido que te molesta.</li>
                </ul>
              </div>
            </div>

            <p className="pasos-intro">Pasos para ajustar recomendaciones:</p>

            <ul className="lista-pasos-img">
              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 1:</strong></p>
                <p className="paso-texto">
                  En una publicación que no te interesa, toca los <strong>tres puntos</strong> (⋯).
                </p>
                <figure className="paso-figure">
                  <img src={igRecomendPaso1} alt="Menú de publicación" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 2:</strong></p>
                <p className="paso-texto">
                  Elige <strong>No me interesa</strong> o <strong>Reportar</strong>.
                  Con eso Instagram aprende y va mostrando menos contenido similar.
                </p>
                <figure className="paso-figure">
                  <img src={igRecomendPaso2} alt="No me interesa" className="paso-img" />
                </figure>
              </li>
            </ul>

            <p className="hint">
              Tip: Si quieres aprender, busca y guarda contenido educativo. Eso “entrena” tu feed.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">5.3</span>
              Interacción con el contenido
            </h2>
          </header>

          <div className="card-body">
            <p>
              La <strong>interacción</strong> es lo que haces con las publicaciones:
              dar <strong>like</strong>, comentar, compartir, guardar o reaccionar.
              Esto ayuda a que Instagram sepa qué te gusta y también puede hacer que
              tu cuenta tenga más actividad.
            </p>

            <div className="mini-grid">
              <div className="mini-card">
                <h3 className="mini-title">Formas de interactuar</h3>
                <ul className="mini-list">
                  <li><strong>Like</strong> (me gusta).</li>
                  <li><strong>Comentario</strong> (opinar o preguntar).</li>
                  <li><strong>Compartir</strong> (en stories o por DM).</li>
                  <li><strong>Guardar</strong> (para ver después).</li>
                </ul>
              </div>

              <div className="mini-card">
                <h3 className="mini-title">Buenas prácticas</h3>
                <ul className="mini-list">
                  <li>Comenta con respeto y evita peleas.</li>
                  <li>No compartas información falsa o sin verificar.</li>
                  <li>Si una cuenta te da desconfianza, no abras enlaces.</li>
                  <li>Usa “reportar” si ves estafas o contenido peligroso.</li>
                </ul>
              </div>
            </div>

            <p className="pasos-intro">Pasos para interactuar de forma segura:</p>

            <ul className="lista-pasos-img">
              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 1:</strong></p>
                <p className="paso-texto">
                  Para dar like, toca el <strong>corazón</strong>. Si el contenido te sirve,
                  mejor <strong>guárdalo</strong> para revisarlo después.
                </p>
                <figure className="paso-figure">
                  <img src={igInteraccionPaso1} alt="Like y guardar" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 2:</strong></p>
                <p className="paso-texto">
                  Para comentar, escribe algo claro. Si es una pregunta, sé específico
                  (ej. “¿Cuál es el precio?” “¿Dónde están ubicados?”).
                </p>
                <figure className="paso-figure">
                  <img src={igInteraccionPaso2} alt="Comentar" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 3:</strong></p>
                <p className="paso-texto">
                  Si ves algo sospechoso, entra al menú (⋯) y usa <strong>Reportar</strong>{" "}
                  o <strong>Bloquear</strong> para cuidar tu cuenta.
                </p>
                <figure className="paso-figure">
                  <img src={igRecomendPaso2} alt="Reportar o bloquear" className="paso-img" />
                </figure>
              </li>
            </ul>

            <p className="hint">
              Tip: “Guardar” es mejor que compartir todo. Mantiene tu perfil ordenado y te ayuda a estudiar después.
            </p>
          </div>
        </article>
      </main>

      <section className="video-section">
        <h2 className="section-title inline">
          <span className="section-number">5.4</span>
          Video: Búsqueda y recomendaciones en Instagram
        </h2>
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/wXCT14UdFBU"
            title="Búsqueda y recomendaciones en Instagram"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">5.5</span>
          Actividad práctica del tema
        </h2>
        <ol>
          <li>
            Busca un tema útil (ej. “tareas”, “Word”, “recetas”, “deporte”) y escribe:
            <ul className="lista-simple">
              <li>1 usuario que encontraste.</li>
              <li>1 hashtag que te sirvió.</li>
              <li>1 lugar que apareció.</li>
            </ul>
          </li>
          <li>
            Explica en 3 renglones: ¿por qué crees que Instagram te recomienda ciertas publicaciones?
          </li>
        </ol>
        <p className="hint">Recuerda: Buscar e interactuar también cambia lo que Instagram te mostrará.</p>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">5.6</span>
          Quiz: Búsqueda y descubrimiento
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              <span className="question-text">
                1) ¿Para qué sirve la barra de búsqueda?
              </span>
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="barraBuscar">
                  Para encontrar personas, hashtags y lugares.
                </option>
                <option value="borrar">Para borrar tu cuenta.</option>
                <option value="wifi">Para conectarte al WiFi.</option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: la barra sirve para encontrar cuentas, temas y lugares."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              <span className="question-text">
                2) ¿Qué es un hashtag?
              </span>
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="hashtags">
                  Una etiqueta (#) para agrupar publicaciones por tema.
                </option>
                <option value="contra">Una contraseña.</option>
                <option value="tarjeta">Un banco.</option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: los hashtags agrupan contenido por tema."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              <span className="question-text">
                3) ¿Para qué sirve buscar por lugares?
              </span>
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="lugares">
                  Para ver contenido relacionado con una zona o negocio.
                </option>
                <option value="broma">Para hacer memes.</option>
                <option value="bloquear">Para bloquear a todos.</option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: lugares sirve para ver contenido de una zona."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              <span className="question-text">
                4) ¿En qué se basan las recomendaciones de Instagram?
              </span>
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="recomendaciones">
                  En lo que ves, buscas, guardas, comentas y sigues.
                </option>
                <option value="azar">Solo al azar.</option>
                <option value="no">No se basan en nada.</option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: se basan en tu actividad dentro de Instagram."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              <span className="question-text">
                5) ¿Qué acción te ayuda a guardar contenido para ver después?
              </span>
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="guardar">Usar “Guardar” (icono de marcador).</option>
                <option value="apagar">Apagar el celular.</option>
                <option value="reset">Reiniciar Instagram.</option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: guardar te permite revisarlo después."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              <span className="question-text">
                6) ¿Cuál es una buena práctica al comentar?
              </span>
              <select name="q6" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="comentarioResp">
                  Comentar con respeto y no compartir información falsa.
                </option>
                <option value="insultar">Insultar para que “se haga viral”.</option>
                <option value="spam">Poner spam con enlaces raros.</option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: comentar con respeto y evitar spam es lo correcto."}
              </p>
            )}
          </div>

          <button type="submit" className="btn-primary">
            Calificar
          </button>
        </form>

        {quizAnswered && (
          <div className="quiz-result">
            <p>
              Puntaje: <strong>{quizScore} / {TOTAL_PREGUNTAS}</strong>
            </p>
            <p className={quizScore >= 5 ? "ok" : "warn"}>
              {quizScore >= 5
                ? "¡Excelente! Ya sabes buscar y descubrir contenido de forma inteligente. 🎉"
                : "Buen intento. Revisa el contenido y vuelve a intentar el quiz."}
            </p>
          </div>
        )}
      </section>

      <footer className="contenido-footer">
        <div className="avance-mensaje">
          {gated && !timerTerminado && (
            <p>
              ⏳ Lee el contenido. El botón <strong>Siguiente</strong> se
              habilitará en {formatearTiempo(tiempoRestante)}.
            </p>
          )}
          {gated && timerTerminado && !scrolledBottom && (
            <p>
              👇 Desplázate hasta el final de la página para habilitar el botón{" "}
              <strong>Siguiente</strong>.
            </p>
          )}
          {!gated && (
            <p>✅ Ya habías llegado a este contenido. Puedes avanzar cuando lo necesites.</p>
          )}
          {(!gated || (timerTerminado && scrolledBottom)) && (
            <p>✅ Ya puedes continuar al siguiente contenido.</p>
          )}
        </div>

        <div className="botones-nav">
          <button className="btn-anterior" onClick={irAnterior}>
            ← Anterior
          </button>
          <button
            className={`btn-siguiente ${!puedeAvanzar || guardando ? "btn-disabled" : ""}`}
            onClick={finalizarContenido}
            disabled={guardando || !puedeAvanzar}
          >
            {guardando ? "Guardando..." : "Siguiente →"}
          </button>
        </div>
      </footer>
    </div>
  );
}