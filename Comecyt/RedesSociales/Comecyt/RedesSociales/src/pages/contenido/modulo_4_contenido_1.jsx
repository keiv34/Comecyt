// src/pages/contenido/modulo_1_contenido_22.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_4_contenido_1.css";

import igIntroImg from "../../assets/igIntro.png";
import igPopularidadImg from "../../assets/igPopularidad.png";

const API_URL = "http://localhost:4000";
const MODULO_ID = 4; // ✅ Es módulo 4
const NUM_CONTENIDO = 1;
const TOTAL_PREGUNTAS = 6;

export default function ContenidoInstagramIntro() {
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
  const [totalContenidos, setTotalContenidos] = useState(22);
  const [modulos, setModulos] = useState([]);

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido22");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  const correctAnswers = {
    q1: "redSocialVisual",
    q2: "formatos",
    q3: "popular",
    q4: "usarVender",
    q5: "creador",
    q6: "empresa",
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
      if (scrollPosition >= pageHeight - 80) {
        setScrolledBottom(true);
      }
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
    navigate("/modulo/1/contenido/21"); // ✅ Viene del contenido 21 - Examen
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  if (!progresoCargado) {
    return (
      <div className="ig-intro-container">
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
    <div className="ig-intro-container">
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="ig-header">
        <div className="ig-header-inner">
          <h1>Instagram: Introducción, popularidad y tipos de cuenta</h1>
        </div>
      </header>

      <main className="content-grid">
        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">1.1</span>
              ¿Qué es Instagram?
            </h2>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  <strong>Instagram</strong> es una red social centrada en
                  contenido <strong>visual</strong>, donde las personas publican{" "}
                  <strong>fotos</strong>, <strong>videos</strong> y mensajes
                  cortos para compartir ideas, experiencias o promocionar un
                  proyecto.
                </p>
                <p>
                  Dentro de la app puedes interactuar con el contenido mediante{" "}
                  <strong>me gusta</strong>, <strong>comentarios</strong>,{" "}
                  <strong>mensajes</strong> y <strong>seguidores</strong>. También
                  permite descubrir cuentas nuevas según tus gustos.
                </p>
                <p>
                  Instagram maneja varios formatos:{" "}
                  <strong>publicaciones (feed)</strong>,{" "}
                  <strong>historias</strong>, <strong>reels</strong> y{" "}
                  <strong>transmisiones en vivo</strong>. Cada uno se usa para
                  comunicar de manera rápida y atractiva.
                </p>
              </div>
              <figure className="media-side">
                <img
                  src={igIntroImg}
                  alt="Pantalla principal de Instagram"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">1.2</span>
              Popularidad y usos principales
            </h2>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Instagram se volvió popular porque permite consumir contenido
                  de forma <strong>rápida</strong> y <strong>visual</strong>.
                  Muchas personas lo usan diariamente para entretenerse, aprender
                  algo nuevo o conectar con otras personas.
                </p>

                <h3>Usos comunes en Instagram</h3>
                <ul className="lista-simple">
                  <li>
                    <strong>Compartir momentos:</strong> fotos, viajes, eventos,
                    actividades.
                  </li>
                  <li>
                    <strong>Aprender:</strong> tutoriales y consejos en reels.
                  </li>
                  <li>
                    <strong>Inspiración:</strong> moda, arte, comida, ejercicio,
                    estudio.
                  </li>
                  <li>
                    <strong>Comunidades:</strong> seguir intereses (deportes,
                    música, educación).
                  </li>
                  <li>
                    <strong>Promoción y ventas:</strong> negocios que muestran
                    productos, precios y contacto.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={igPopularidadImg}
                  alt="Ejemplos de usos de Instagram"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">1.3</span>
              Diferencias entre cuenta personal, creador y empresa
            </h2>
          </header>

          <div className="card-body">
            <p>
              Instagram ofrece distintos tipos de cuenta. Elegir bien te ayuda a
              tener las herramientas correctas según lo que quieras hacer:
              publicar por hobby, crecer como creador o vender como negocio.
            </p>

            <div className="compare-grid">
              <div className="compare-item">
                <h3>Cuenta personal</h3>
                <ul className="lista-simple">
                  <li>Para uso cotidiano y publicaciones personales.</li>
                  <li>Ideal para compartir con amigos o familia.</li>
                  <li>Menos herramientas profesionales.</li>
                </ul>
              </div>

              <div className="compare-item">
                <h3>Cuenta de creador</h3>
                <ul className="lista-simple">
                  <li>Para creadores de contenido, influencers, artistas.</li>
                  <li>Mejores opciones para gestionar audiencia y mensajes.</li>
                  <li>Acceso a estadísticas (insights).</li>
                </ul>
              </div>

              <div className="compare-item">
                <h3>Cuenta de empresa</h3>
                <ul className="lista-simple">
                  <li>Para negocios y marcas (venta o promoción).</li>
                  <li>Botones de contacto: correo, llamada, ubicación.</li>
                  <li>Anuncios y métricas orientadas a resultados.</li>
                </ul>
              </div>
            </div>

            <p className="hint">
              Recomendación: Personal (uso normal), Creador (crecer
              audiencia), Empresa (vender o promocionar negocio).
            </p>
          </div>
        </article>
      </main>

      <section className="video-section">
        <h2 className="section-title inline">
          <span className="section-number">1.4</span>
          Video: Conociendo Instagram en 3 minutos
        </h2>
        <p className="video-hint">
          Historia de Instagram.
        </p>

        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/mA7kLqHCx1g"
            title="Introducción a Instagram"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">1.5</span>
          Actividad práctica del tema
        </h2>

        <ol>
          <li>
            Escribe 3 usos que tú le darías a Instagram (por ejemplo: aprender,
            vender, compartir, entretenimiento).
          </li>
          <li>
            Describe en 3–4 renglones cuál tipo de cuenta usarías y por qué:
            <ul className="lista-simple">
              <li>Si solo quieres publicar fotos personales.</li>
              <li>Si quieres ser creador de videos de estudio/tutoriales.</li>
              <li>Si tienes un negocio (ropa, comida, servicios).</li>
            </ul>
          </li>
          <li>
            Escribe un ejemplo de publicación (texto corto) que usarías:
            <ul className="lista-simple">
              <li>Como persona (algo de tu día).</li>
              <li>Como negocio (promoción de producto/servicio).</li>
            </ul>
          </li>
        </ol>

        <p className="hint">
          Usa ejemplos reales de tu comunidad (negocios cercanos o ideas que ya
          existan). Eso hace que el aprendizaje sea más práctico.
        </p>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">1.6</span>
          Quiz: Introducción a Instagram
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              <span className="question-text">
                1) ¿Cuál es la descripción más correcta de Instagram?
              </span>
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="soloMensajes">Solo sirve para enviar mensajes.</option>
                <option value="redSocialVisual">
                  Es una red social enfocada en fotos y videos para compartir e
                  interactuar.
                </option>
                <option value="editorPDF">Es un editor de archivos PDF.</option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto: Instagram es una red social visual."
                  : "❗ Revisa: Instagram no es solo mensajes ni un editor de PDF."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              <span className="question-text">
                2) ¿Cuál conjunto incluye formatos reales de Instagram?
              </span>
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="formatos">
                  Feed, historias, reels y transmisiones en vivo.
                </option>
                <option value="soloDocs">Word, Excel y PowerPoint.</option>
                <option value="soloCorreos">Bandeja, spam y borradores.</option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto: esos son formatos de Instagram."
                  : "❗ Revisa: Instagram no es una suite de oficina ni un correo."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              <span className="question-text">
                3) ¿Por qué Instagram se considera popular?
              </span>
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="popular">
                  Porque el contenido visual es rápido de ver y fácil de compartir.
                </option>
                <option value="noPopular">Porque casi nadie lo usa.</option>
                <option value="soloEscuela">Porque solo sirve para tareas escolares.</option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto: su formato visual y rápido lo hace atractivo."
                  : "❗ Revisa: Instagram se usa para muchos propósitos, no solo escuela."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              <span className="question-text">
                4) ¿Cuál es un uso común de Instagram hoy en día?
              </span>
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="usarVender">
                  Aprender, entretenerse, crear comunidad y también vender/promocionar.
                </option>
                <option value="soloLlamadas">Solo sirve para llamadas telefónicas.</option>
                <option value="soloNotas">Solo sirve para notas de voz.</option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto: Instagram se usa para muchos objetivos, incluso ventas."
                  : "❗ Revisa: Instagram no se limita a llamadas o notas."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              <span className="question-text">
                5) ¿Qué tipo de cuenta se recomienda para creadores de contenido?
              </span>
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="personal">Cuenta personal.</option>
                <option value="creador">Cuenta de creador.</option>
                <option value="empresa">Cuenta de empresa.</option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto: la cuenta de creador está pensada para creadores e influencers."
                  : "❗ Revisa: para creadores conviene la cuenta de creador."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              <span className="question-text">
                6) Si tienes un negocio y quieres mostrar contacto y promocionar, ¿qué cuenta conviene?
              </span>
              <select name="q6" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="personal">Cuenta personal.</option>
                <option value="creador">Cuenta de creador.</option>
                <option value="empresa">Cuenta de empresa.</option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto: la cuenta de empresa es la ideal para negocios."
                  : "❗ Revisa: si es un negocio, la cuenta de empresa ofrece más herramientas."}
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
              Puntaje:{" "}
              <strong>
                {quizScore} / {TOTAL_PREGUNTAS}
              </strong>
            </p>
            <p className={quizScore >= 5 ? "ok" : "warn"}>
              {quizScore >= 5
                ? "¡Excelente! Ya dominas lo básico de Instagram. 🎉"
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
            <p>
              ✅ Ya habías llegado a este contenido. Puedes avanzar cuando lo
              necesites.
            </p>
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