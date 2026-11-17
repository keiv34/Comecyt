// src/pages/contenido/modulo_1_contenido_24.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_4_contenido_3.css";

import igFeedIntroImg from "../../assets/igFeedIntro.png";
import igFeedPaso1Img from "../../assets/igFeedPaso1.png";
import igFeedPaso2Img from "../../assets/igFeedPaso2.png";
import igFeedPaso3Img from "../../assets/igFeedPaso3.png";

const API_URL = "http://localhost:4000";
const MODULO_ID = 4; // ✅ Es módulo 4
const NUM_CONTENIDO = 3;
const TOTAL_PREGUNTAS = 6;

export default function ContenidoInstagramFuncionesBasicasFeed() {
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
  const [totalContenidos, setTotalContenidos] = useState(24);
  const [modulos, setModulos] = useState([]);

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido24");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500);
  };

  const correctAnswers = {
    q1: "feed",
    q2: "caption",
    q3: "hashtag",
    q4: "tag",
    q5: "location",
    q6: "privacy",
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
    navigate("/modulo/1/contenido/23"); // ✅ Va al contenido 23
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  if (!progresoCargado) {
    return (
      <div className="ig3-container">
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
    <div className="ig3-container">
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="ig3-header">
        <div className="ig3-header-inner">
          <h1>Instagram: Funciones básicas</h1>
          <p className="sub">
            En este tema aprenderás a crear <strong>publicaciones en el feed</strong>:
            qué son, cómo se hacen.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">3.1</span>
              Publicaciones en el feed
            </h2>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Las <strong>publicaciones en el feed</strong> son las fotos o videos
                  que subes a tu perfil y que también aparecen en el inicio (feed) de tus
                  seguidores. A diferencia de las historias, el feed es un contenido más{" "}
                  <strong>permanente</strong> y sirve para mostrar lo más importante de
                  tu cuenta.
                </p>
                <p>
                  Una publicación normalmente incluye: la <strong>imagen o video</strong>,
                  un <strong>texto</strong>,{" "}
                  <strong>hashtags</strong>, ubicación y{" "}
                  <strong>etiquetas</strong> de personas o cuentas.
                </p>

                <ul className="lista-simple">
                  <li>
                    Si es personal: comparte momentos, actividades o recuerdos.
                  </li>
                  <li>
                    Si es negocio/creador: muestra productos, servicios, trabajos o
                    contenido educativo.
                  </li>
                  <li>
                    Cuida la <strong>calidad</strong> y la <strong>privacidad</strong>{" "}
                    de lo que publicas.
                  </li>
                </ul>
              </div>
              <figure className="media-side">
                <img
                  src={igFeedIntroImg}
                  alt="Ejemplo de publicación en el feed de Instagram"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">3.2</span>
              Cómo publicar en el feed (pasos)
            </h2>
          </header>

          <div className="card-body">
            <p className="pasos-intro">
              Hazlo con calma: lee el paso y después revisa la imagen de ejemplo.
            </p>

            <ul className="lista-pasos-img">
              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 1:</strong>
                </p>
                <p className="paso-texto">
                  Abre Instagram y toca el botón <strong>+</strong> (Crear) para
                  seleccionar <strong>Publicación</strong>. Elige una foto o video de
                  tu galería o toma uno nuevo.
                </p>
                <figure className="paso-figure">
                  <img src={igFeedPaso1Img} alt="Botón + para crear publicación" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 2:</strong>
                </p>
                <p className="paso-texto">
                  Ajusta el recorte, el tamaño o aplica un filtro suave si lo necesitas.
                  Evita filtros muy fuertes si quieres que se vea más natural.
                </p>
                <figure className="paso-figure">
                  <img src={igFeedPaso2Img} alt="Edición básica: recorte y filtro" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 3:</strong>
                </p>
                <p className="paso-texto">
                  Escribe una <strong>descripción (caption)</strong>, agrega{" "}
                  <strong>hashtags</strong> y, si quieres, etiqueta a personas o agrega{" "}
                  <strong>ubicación</strong>. Al final toca <strong>Compartir</strong>.
                </p>
                <figure className="paso-figure">
                  <img src={igFeedPaso3Img} alt="Agregar caption, hashtags y compartir" className="paso-img" />
                </figure>
              </li>
            </ul>

            <p className="hint">
              Tip: Para cuentas de negocio, usa una descripción clara: qué ofreces + precio
              + cómo pedir (DM/WhatsApp).
            </p>
          </div>
        </article>
      </main>

      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">3.3</span>
          Actividad práctica del tema
        </h2>
        <ol>
          <li>
            Elige una foto (puede ser de tu comunidad, escuela o un producto) y escribe
            un <strong>caption</strong> de 2–3 renglones.
          </li>
          <li>
            Agrega <strong>3 hashtags</strong> relacionados (por ejemplo: #comida #postres #sanFelipe).
          </li>
          <li>
            Escribe si tu publicación sería para una cuenta <strong>personal</strong> o
            de <strong>negocio</strong> y explica por qué en 2 renglones.
          </li>
        </ol>
        <p className="hint">La idea es practicar escribir claro y cuidar lo que compartes.</p>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">3.4</span>
          Quiz: Publicaciones en el feed
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              <span className="question-text">
                1) ¿Qué es una publicación en el feed?
              </span>
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="feed">
                  Una foto o video que queda en tu perfil y aparece a tus seguidores.
                </option>
                <option value="dm">Un mensaje privado (DM).</option>
                <option value="historia">Una historia que dura 24 horas.</option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: el feed es lo que queda publicado en tu perfil."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              <span className="question-text">
                2) ¿Cómo se llama el texto que acompaña una publicación?
              </span>
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="caption">Caption o descripción.</option>
                <option value="pin">PIN de seguridad.</option>
                <option value="wifi">Clave WiFi.</option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: se le llama caption o descripción."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              <span className="question-text">
                3) ¿Para qué sirven los hashtags?
              </span>
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="hashtag">
                  Para que más personas encuentren tu publicación por temas.
                </option>
                <option value="bloquear">Para bloquear la cuenta.</option>
                <option value="pagar">Para pagar anuncios automáticamente.</option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: ayudan a categorizar y encontrar contenido."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              <span className="question-text">
                4) ¿Qué significa etiquetar (tag) en una publicación?
              </span>
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="tag">
                  Mencionar a una persona o cuenta dentro de la publicación.
                </option>
                <option value="borrar">Borrar la publicación.</option>
                <option value="cambiarClave">Cambiar tu contraseña.</option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: etiquetar es mencionar cuentas/personas."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              <span className="question-text">
                5) ¿Qué se logra al agregar ubicación?
              </span>
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="location">
                  Indicar dónde fue tomada o de qué lugar trata la publicación.
                </option>
                <option value="pantalla">Cambiar el brillo de pantalla.</option>
                <option value="vpn">Activar VPN automáticamente.</option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: ubicación ayuda a dar contexto del lugar."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              <span className="question-text">
                6) ¿Qué es importante considerar antes de publicar?
              </span>
              <select name="q6" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="privacy">
                  Cuidar privacidad: no compartir datos sensibles y revisar quién lo verá.
                </option>
                <option value="todo">
                  Publicar cualquier cosa con datos personales completos.
                </option>
                <option value="nada">
                  No importa lo que publiques.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: siempre cuida tu información y privacidad."}
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
                ? "¡Excelente! Ya dominas lo básico del feed. 🎉"
                : "Buen intento. Revisa las tarjetas y vuelve a intentar el quiz."}
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