// src/pages/contenido/modulo_1_contenido_25.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_4_contenido_4.css";

import igStoriesPaso1 from "../../assets/igStoriesPaso1.png";
import igStoriesPaso2 from "../../assets/igStoriesPaso2.png";
import igStoriesPaso3 from "../../assets/igStoriesPaso3.png";
import igStoriesPaso4 from "../../assets/igStoriesPaso4.png";
import igReelsPaso1 from "../../assets/igReelsPaso1.png";
import igReelsPaso2 from "../../assets/igReelsPaso2.png";
import igReelsPaso3 from "../../assets/igReelsPaso3.png";
import igReelsPaso4 from "../../assets/igReelsPaso4.png";
import igDmPaso1 from "../../assets/igDmPaso1.png";
import igDmPaso2 from "../../assets/igDmPaso2.png";
import igDmPaso3 from "../../assets/igDmPaso3.png";

const API_URL = "http://localhost:4000";
const MODULO_ID = 4; // ✅ Es módulo 4
const NUM_CONTENIDO = 4;
const TOTAL_PREGUNTAS = 6;

export default function ContenidoInstagramStoriesReelsDM() {
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
  const [totalContenidos, setTotalContenidos] = useState(25);
  const [modulos, setModulos] = useState([]);

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido25");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500);
  };

  const correctAnswers = {
    q1: "stories24",
    q2: "destacadas",
    q3: "reelsAlcance",
    q4: "primeros3",
    q5: "dmPrivado",
    q6: "seguridad",
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
    navigate("/modulo/1/contenido/24"); // ✅ Va al contenido 24
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  if (!progresoCargado) {
    return (
      <div className="ig4-container">
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
    <div className="ig4-container">
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="ig4-header">
        <div className="ig4-header-inner">
          <h1>Instagram: Stories, Reels y Mensajes (DM)</h1>
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
              <span className="section-number">4.1</span>
              Historias (Stories)
            </h2>
          </header>

          <div className="card-body">
            <p>
              Las <strong>Historias</strong> (Stories) son publicaciones rápidas que
              aparecen en la parte superior de Instagram y normalmente{" "}
              <strong>duran 24 horas</strong>. Se usan para compartir contenido del día,
              avisos cortos o momentos que no quieres dejar fijos en tu perfil.
            </p>

            <div className="mini-grid">
              <div className="mini-card">
                <h3 className="mini-title">¿Para qué sirven las Stories?</h3>
                <ul className="mini-list">
                  <li>Compartir momentos sin que queden permanentes.</li>
                  <li>Anunciar algo (promoción, evento, horario, etc.).</li>
                  <li>
                    Interactuar con encuestas, preguntas, emoji slider, menciones y enlaces
                    (si están disponibles).
                  </li>
                  <li>Mostrar “detrás de cámaras” o avances de un proyecto.</li>
                </ul>
              </div>

              <div className="mini-card">
                <h3 className="mini-title">Elementos importantes en Stories</h3>
                <ul className="mini-list">
                  <li>Foto o video corto.</li>
                  <li>Texto y stickers (ubicación, música, hora, hashtags).</li>
                  <li>Herramientas interactivas: encuesta, pregunta, quiz, etc.</li>
                  <li>Privacidad: “Mejores amigos” u “ocultar historia”.</li>
                </ul>
              </div>
            </div>

            <p className="hint">
              Tip: Si es cuenta personal, evita mostrar datos sensibles. Si es negocio,
              usa Stories para avisos, precios y responder dudas.
            </p>

            <p className="pasos-intro">
              Pasos para crear una Story (lee y luego mira el ejemplo).
            </p>

            <ul className="lista-pasos-img">
              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 1:</strong></p>
                <p className="paso-texto">
                  Toca tu foto de perfil con el signo <strong>+</strong> o desliza
                  hacia la derecha para abrir la cámara de Stories.
                </p>
                <figure className="paso-figure">
                  <img src={igStoriesPaso1} alt="Abrir cámara de Stories" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 2:</strong></p>
                <p className="paso-texto">
                  Toma una foto o graba un video. También puedes elegir contenido desde tu galería.
                </p>
                <figure className="paso-figure">
                  <img src={igStoriesPaso2} alt="Elegir contenido para Story" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 3:</strong></p>
                <p className="paso-texto">
                  Agrega texto, música o stickers y toca <strong>Tu historia</strong>.
                  Si quieres más privacidad, selecciona <strong>Mejores amigos</strong>.
                </p>
                <figure className="paso-figure">
                  <img src={igStoriesPaso3} alt="Editar y publicar Story" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 4:</strong></p>
                <p className="paso-texto">
                  Si quieres que una Story no desaparezca, guárdala en <strong>Destacadas</strong>{" "}
                  desde tu perfil (queda como una “carpetita”).
                </p>
                <figure className="paso-figure">
                  <img src={igStoriesPaso4} alt="Guardar Story en Destacadas" className="paso-img" />
                </figure>
              </li>
            </ul>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">4.2</span>
              Reels
            </h2>
          </header>

          <div className="card-body">
            <p>
              Los <strong>Reels</strong> son videos cortos (verticales) que Instagram recomienda
              a más personas, incluso si no te siguen. Por eso sirven para{" "}
              <strong>tener más alcance</strong> y crecer una cuenta.
            </p>

            <div className="mini-grid">
              <div className="mini-card">
                <h3 className="mini-title">¿Para qué sirven los Reels?</h3>
                <ul className="mini-list">
                  <li>Crear contenido corto y atractivo (tutoriales).</li>
                  <li>Aumentar el alcance y ganar seguidores.</li>
                  <li>Mostrar productos o procesos (antes/después).</li>
                  <li>Participar en tendencias si te conviene (audio, efectos).</li>
                </ul>
              </div>

              <div className="mini-card">
                <h3 className="mini-title">Elementos importantes en Reels</h3>
                <ul className="mini-list">
                  <li>Video vertical claro.</li>
                  <li>Música o audio (opcional).</li>
                  <li>Texto en pantalla (para entender sin sonido).</li>
                  <li>Hashtags y portada (cover) llamativa.</li>
                </ul>
              </div>
            </div>
            <p className="pasos-intro">Pasos para crear un Reel.</p>

            <ul className="lista-pasos-img">
              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 1:</strong></p>
                <p className="paso-texto">
                  Toca <strong>+</strong> y selecciona <strong>Reel</strong> (o entra a Reels y elige crear).
                </p>
                <figure className="paso-figure">
                  <img src={igReelsPaso1} alt="Crear Reel" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 2:</strong></p>
                <p className="paso-texto">
                  Graba o elige clips de la galería. Ajusta duración y agrega música o audio.
                </p>
                <figure className="paso-figure">
                  <img src={igReelsPaso2} alt="Agregar clips y música" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 3:</strong></p>
                <p className="paso-texto">
                  Agrega texto en pantalla y revisa que se entienda. Recorta partes que sobren.
                </p>
                <figure className="paso-figure">
                  <img src={igReelsPaso3} alt="Editar reel con texto" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 4:</strong></p>
                <p className="paso-texto">
                  Escribe una descripción corta, agrega hashtags y elige una portada clara.
                  Luego toca <strong>Compartir</strong>.
                </p>
                <figure className="paso-figure">
                  <img src={igReelsPaso4} alt="Compartir Reel" className="paso-img" />
                </figure>
              </li>
            </ul>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">4.3</span>
              Mensajería directa (DM)
            </h2>
          </header>

          <div className="card-body">
            <p>
              La <strong>mensajería directa</strong> (DM) es el chat privado de Instagram.
              Sirve para hablar con amigos, seguidores o clientes. Puedes enviar mensajes,
              fotos, audios y responder Stories.
            </p>

            <div className="mini-grid">
              <div className="mini-card">
                <h3 className="mini-title">¿Para qué sirve el DM?</h3>
                <ul className="mini-list">
                  <li>Resolver dudas o pedir información.</li>
                  <li>Coordinar pedidos, tareas o acuerdos.</li>
                  <li>Enviar publicaciones o reels en privado.</li>
                  <li>Responder mensajes de seguidores o amigos.</li>
                </ul>
              </div>

              <div className="mini-card">
                <h3 className="mini-title">Seguridad en DM</h3>
                <ul className="mini-list">
                  <li>No compartas contraseñas ni datos personales.</li>
                  <li>No abras enlaces sospechosos.</li>
                  <li>Si te molestan: restringe, bloquea o reporta.</li>
                  <li>Ajusta quién puede enviarte mensajes en Privacidad.</li>
                </ul>
              </div>
            </div>

            <p className="hint">
              Tip: Si es cuenta de negocio, responde con respeto y claridad: Qué ofrece + horario + cómo comprar.
            </p>

            <p className="pasos-intro">Pasos para enviar un DM.</p>

            <ul className="lista-pasos-img">
              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 1:</strong></p>
                <p className="paso-texto">
                  Toca el ícono de mensajes (avión / Messenger) para abrir tu bandeja de chats.
                </p>
                <figure className="paso-figure">
                  <img src={igDmPaso1} alt="Entrar a mensajes" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 2:</strong></p>
                <p className="paso-texto">
                  Presiona <strong>Nuevo mensaje</strong>, busca el usuario y escribe tu mensaje.
                </p>
                <figure className="paso-figure">
                  <img src={igDmPaso2} alt="Nuevo mensaje" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 3:</strong></p>
                <p className="paso-texto">
                  Si alguien te incomoda, entra al perfil y usa <strong>Restringir</strong>,
                  <strong> Bloquear</strong> o <strong>Reportar</strong>.
                </p>
                <figure className="paso-figure">
                  <img src={igDmPaso3} alt="Bloquear o reportar" className="paso-img" />
                </figure>
              </li>
            </ul>
          </div>
        </article>
      </main>

      <section className="video-section">
        <h2 className="section-title inline">
          <span className="section-number">4.4</span>
          Video: Stories, Reels y DM
        </h2>
        <p className="video-hint">
          Mira este video para reforzar cómo se usan Stories, Reels y mensajes directos.
        </p>
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/BFidBqCoBhg"
            title="Instagram Stories Reels DM"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">4.5</span>
          Actividad práctica del tema
        </h2>
        <ol>
          <li>
            Diseña una <strong>Story</strong> (texto) para anunciar algo (evento, tarea o promoción).
            Incluye: título + fecha + llamado a la acción.
          </li>
          <li>
            Escribe la idea de un <strong>Reel</strong> de 10–15 segundos: tema + qué se verá en los primeros 3 segundos.
          </li>
          <li>
            Escribe un ejemplo de <strong>DM</strong> educado para pedir información a un negocio (2–3 renglones).
          </li>
        </ol>
        <p className="hint">Usa ejemplos reales de tu escuela o comunidad.</p>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">4.6</span>
          Quiz: Stories, Reels y DM
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              <span className="question-text">
                1) ¿Cuánto tiempo duran normalmente las Stories?
              </span>
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="stories24">24 horas.</option>
                <option value="semana">7 días.</option>
                <option value="siempre">Se quedan para siempre.</option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: las Stories suelen durar 24 horas."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              <span className="question-text">
                2) ¿Cómo se llaman las Stories que guardas para que permanezcan en tu perfil?
              </span>
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="destacadas">Destacadas (Highlights).</option>
                <option value="archivos">Archivos borrados.</option>
                <option value="favoritos">Favoritos de Google.</option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: se llaman Destacadas."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              <span className="question-text">
                3) ¿Por qué los Reels ayudan a crecer una cuenta?
              </span>
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="reelsAlcance">
                  Porque Instagram los recomienda y pueden llegar a más personas.
                </option>
                <option value="soloAmigos">Solo los ven tus amigos cercanos.</option>
                <option value="noSirven">No sirven para crecer.</option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: los Reels suelen tener más alcance."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              <span className="question-text">
                4) ¿Qué es importante en los primeros 3 segundos de un Reel?
              </span>
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="primeros3">
                  Llamar la atención para que no se salten el video.
                </option>
                <option value="silencio">Que no pase nada.</option>
                <option value="bloquear">Bloquear a todos.</option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: debes enganchar rápido."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              <span className="question-text">
                5) ¿Qué es un DM en Instagram?
              </span>
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="dmPrivado">Un mensaje privado (chat directo).</option>
                <option value="publico">Una publicación pública del feed.</option>
                <option value="historia">Una historia de 24 horas.</option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: DM es mensajería privada."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              <span className="question-text">
                6) ¿Cuál es una buena práctica de seguridad en DM?
              </span>
              <select name="q6" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="seguridad">
                  No compartir contraseñas ni datos sensibles y evitar enlaces sospechosos.
                </option>
                <option value="todo">Enviar tu contraseña para que te “ayuden”.</option>
                <option value="link">Abrir cualquier enlace sin revisar.</option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: nunca compartas datos sensibles y evita enlaces raros."}
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
                ? "¡Excelente! Ya dominas Stories, Reels y DM. 🎉"
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