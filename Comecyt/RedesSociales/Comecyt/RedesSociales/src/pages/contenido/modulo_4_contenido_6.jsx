// src/pages/contenido/modulo_1_contenido_27.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_4_contenido_6.css";

import igProfesionalPaso1 from "../../assets/igProfesionalPaso1.png";
import igProfesionalPaso2 from "../../assets/igProfesionalPaso2.png";
import igProfesionalPaso3 from "../../assets/igProfesionalPaso3.png";
import igShoppingPaso1 from "../../assets/igShoppingPaso1.png";
import igShoppingPaso2 from "../../assets/igShoppingPaso2.png";

const API_URL = "http://localhost:4000";
const MODULO_ID = 4; // ✅ Es módulo 4
const NUM_CONTENIDO = 6;
const TOTAL_PREGUNTAS = 6;

export default function ContenidoInstagramNegociosCreadores() {
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
  const [totalContenidos, setTotalContenidos] = useState(27);
  const [modulos, setModulos] = useState([]);

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido27");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500);
  };

  const correctAnswers = {
    q1: "profesional",
    q2: "creador",
    q3: "empresa",
    q4: "insights",
    q5: "contacto",
    q6: "shopping",
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
    navigate("/modulo/1/contenido/26"); // ✅ Va al contenido 26
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  if (!progresoCargado) {
    return (
      <div className="ig6-container">
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
    <div className="ig6-container">
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="ig6-header">
        <div className="ig6-header-inner">
          <h1>Instagram para negocios y creadores</h1>
          <p className="sub">
            Conoce los <strong>tipos de cuentas</strong>, las{" "}
            <strong>herramientas de negocio</strong> y cómo funciona{" "}
            <strong>Instagram Shopping</strong>.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">6.0</span>
              ¿Para qué sirve Instagram en un negocio o proyecto?
            </h2>
          </header>
          <div className="card-body">
            <p>
              Instagram puede ayudarte a <strong>promocionar</strong> un negocio,
              mostrar tus productos/servicios y crear una audiencia. Con una cuenta
              profesional tienes herramientas extra para <strong>medir resultados</strong>{" "}
              (estadísticas), facilitar <strong>contacto</strong> y, en algunos casos,
              activar funciones de <strong>venta</strong>.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">6.1</span>
              Tipos de cuentas profesionales
            </h2>
          </header>

          <div className="card-body">
            <p>
              Las cuentas profesionales se dividen principalmente en{" "}
              <strong>Creador</strong> y <strong>Empresa</strong>. Ambas ofrecen
              estadísticas, pero cada una se adapta a un objetivo diferente.
            </p>

            <div className="mini-grid">
              <div className="mini-card">
                <h3 className="mini-title">Cuenta de creador (Creator)</h3>
                <ul className="mini-list">
                  <li>Ideal para: creadores, artistas, proyectos personales.</li>
                  <li>Enfocada en: crecimiento de audiencia y contenido.</li>
                  <li>Mejora organización de mensajes y estadísticas.</li>
                </ul>
              </div>

              <div className="mini-card">
                <h3 className="mini-title">Cuenta de empresa (Business)</h3>
                <ul className="mini-list">
                  <li>Ideal para: negocios, tiendas, servicios.</li>
                  <li>Enfocada en: ventas, contacto y promociones.</li>
                  <li>Botones: llamar, correo, ubicación (según configuración).</li>
                </ul>
              </div>
            </div>

            <p className="pasos-intro">Pasos para cambiar a cuenta profesional:</p>

            <ul className="lista-pasos-img">
              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 1:</strong></p>
                <p className="paso-texto">
                  Ve a tu <strong>perfil</strong> y entra al menú de{" "}
                  <strong>Configuración</strong>.
                </p>
                <figure className="paso-figure">
                  <img src={igProfesionalPaso1} alt="Entrar a configuración" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 2:</strong></p>
                <p className="paso-texto">
                  Entra a <strong>Cuenta</strong> o <strong>Tipo de cuenta</strong> y
                  busca la opción de <strong>Cambiar a cuenta profesional</strong>.
                </p>
                <figure className="paso-figure">
                  <img src={igProfesionalPaso2} alt="Cambiar a profesional" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 3:</strong></p>
                <p className="paso-texto">
                  Elige <strong>Creador</strong> o <strong>Empresa</strong>, selecciona
                  una <strong>categoría</strong> y guarda los cambios.
                </p>
                <figure className="paso-figure">
                  <img src={igProfesionalPaso3} alt="Elegir creador o empresa" className="paso-img" />
                </figure>
              </li>
            </ul>

            <p className="hint">
              Tip: Si vendes algo, “Empresa” suele ser mejor. Si haces contenido o marca personal, “Creador” funciona muy bien.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">6.2</span>
              Herramientas de negocios
            </h2>
          </header>

          <div className="card-body">
            <p>
              Al usar una cuenta profesional, Instagram activa herramientas para{" "}
              <strong>medir</strong> tu contenido, mejorar el <strong>contacto</strong>{" "}
              y facilitar la <strong>promoción</strong> de publicaciones.
            </p>

            <div className="mini-grid">
              <div className="mini-card">
                <h3 className="mini-title">📊 Estadísticas (Insights)</h3>
                <ul className="mini-list">
                  <li><strong>Alcance:</strong> cuántas personas te vieron.</li>
                  <li><strong>Interacciones:</strong> likes, comentarios, guardados.</li>
                  <li><strong>Audiencia:</strong> ubicación/horarios (según datos).</li>
                </ul>
              </div>

              <div className="mini-card">
                <h3 className="mini-title">📩 Botones de contacto</h3>
                <ul className="mini-list">
                  <li>Correo, teléfono y ubicación (si lo agregas).</li>
                  <li>Hace más fácil que un cliente te contacte.</li>
                  <li>Útil para negocios locales (comida, ropa, servicios).</li>
                </ul>
              </div>

              <div className="mini-card">
                <h3 className="mini-title">📣 Promociones</h3>
                <ul className="mini-list">
                  <li>“Promocionar” para llegar a más personas.</li>
                  <li>Eliges objetivo: mensajes, visitas al perfil, etc.</li>
                  <li>Puede requerir método de pago/configuración.</li>
                </ul>
              </div>

              <div className="mini-card">
                <h3 className="mini-title">✅ Buenas prácticas</h3>
                <ul className="mini-list">
                  <li>Publica con objetivo (informar/vender/atraer).</li>
                  <li>Responde rápido y con respeto.</li>
                  <li>Fotos claras, precios visibles, datos reales.</li>
                </ul>
              </div>
            </div>
            <p className="hint">
              Tip: Revisa Insights 1 vez por semana y anota qué publicaciones tuvieron más guardados o mensajes.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">6.3</span>
              Instagram Shopping
            </h2>
          </header>

          <div className="card-body">
            <p>
              <strong>Instagram Shopping</strong> permite mostrar productos y, en algunos casos,
              etiquetarlos en publicaciones para que las personas vean detalles (precio,
              nombre, enlace). La disponibilidad depende del país, requisitos y políticas.
            </p>

            <div className="mini-grid">
              <div className="mini-card">
                <h3 className="mini-title">¿Qué permite?</h3>
                <ul className="mini-list">
                  <li>Mostrar productos como catálogo.</li>
                  <li>Etiquetar productos (si está habilitado).</li>
                  <li>Dirigir a la tienda/catálogo.</li>
                </ul>
              </div>

              <div className="mini-card">
                <h3 className="mini-title">Requisitos generales</h3>
                <ul className="mini-list">
                  <li>Cuenta profesional.</li>
                  <li>Productos elegibles y políticas de comercio.</li>
                  <li>Catálogo configurado (cuando aplica).</li>
                </ul>
              </div>
            </div>

            <p className="pasos-intro">Pasos (si la opción aparece disponible):</p>

            <ul className="lista-pasos-img">
              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 1:</strong></p>
                <p className="paso-texto">
                  En configuración profesional, busca <strong>Compras</strong> o{" "}
                  <strong>Shopping</strong> y revisa si puedes iniciar la configuración.
                </p>
                <figure className="paso-figure">
                  <img src={igShoppingPaso1} alt="Opción de Shopping" className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo"><strong>Paso 2:</strong></p>
                <p className="paso-texto">
                  Conecta o crea un <strong>catálogo</strong> (cuando aplica) y espera revisión.
                  Si se aprueba, podrás etiquetar productos.
                </p>
                <figure className="paso-figure">
                  <img src={igShoppingPaso2} alt="Catálogo y revisión" className="paso-img" />
                </figure>
              </li>
            </ul>

            <p className="hint">
              Si no tienes Shopping, puedes vender igual: link a WhatsApp, formulario, link en bio o catálogo externo.
            </p>
          </div>
        </article>
      </main>

      <section className="video-section">
        <h2 className="section-title inline">
          <span className="section-number">6.4</span>
          Video: Cuenta profesional e Insights en Instagram
        </h2>
        <p className="video-hint">
          Mira este video para reforzar cómo cambiar a cuenta profesional y usar estadísticas.
        </p>
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/Oh8JU1E0_gc"
            title="Cuenta profesional e Insights"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">6.5</span>
          Actividad práctica del tema
        </h2>
        <ol>
          <li>
            Elige un ejemplo de negocio (real o inventado) y escribe:
            <ul className="lista-simple">
              <li>Nombre del negocio.</li>
              <li>¿Cuenta de creador o empresa? ¿Por qué?</li>
              <li>Qué botón de contacto usarías (correo, WhatsApp, ubicación).</li>
            </ul>
          </li>
          <li>
            Escribe 3 ideas de publicaciones para ese negocio:
            <ul className="lista-simple">
              <li>1 para informar (horarios/ubicación).</li>
              <li>1 para vender (producto + precio).</li>
              <li>1 para confianza (testimonio/antes y después).</li>
            </ul>
          </li>
          <li>
            Explica en 3 renglones: ¿qué medirías en Insights para saber si te va bien?
          </li>
        </ol>
        <p className="hint">
          Hazlo pensando en un negocio de tu comunidad: comida, ropa, papelería, estética, etc.
        </p>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">6.6</span>
          Quiz: Instagram para negocios y creadores
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              <span className="question-text">
                1) ¿Qué ventaja principal tiene una cuenta profesional?
              </span>
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="profesional">
                  Acceso a herramientas como estadísticas, contacto y promoción.
                </option>
                <option value="borra">Borra automáticamente comentarios.</option>
                <option value="wifi">Da internet gratis.</option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: la ventaja es acceder a herramientas profesionales."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              <span className="question-text">
                2) ¿Qué cuenta es más ideal para un creador de contenido?
              </span>
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="creador">Cuenta de creador (Creator).</option>
                <option value="solo">Solo cuenta privada siempre.</option>
                <option value="no">No existe.</option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: Creator está pensada para creadores."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              <span className="question-text">
                3) ¿Qué cuenta suele convenir más para un negocio local?
              </span>
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="empresa">Cuenta de empresa (Business).</option>
                <option value="juego">Cuenta para jugar.</option>
                <option value="sin">Cuenta sin perfil.</option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: Business se enfoca en ventas, contacto y promociones."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              <span className="question-text">
                4) ¿Para qué sirven los Insights?
              </span>
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="insights">
                  Para ver estadísticas de alcance, interacciones y audiencia.
                </option>
                <option value="bloq">Para bloquear el celular.</option>
                <option value="cambia">Para cambiar el idioma del teléfono.</option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: Insights muestra métricas del rendimiento."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              <span className="question-text">
                5) ¿Qué hacen los botones de contacto?
              </span>
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="contacto">
                  Facilitan que te llamen, te escriban o te encuentren.
                </option>
                <option value="juego">Sirven para jugar dentro de Instagram.</option>
                <option value="borra">Borran tu perfil.</option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: son para contacto rápido con clientes/seguidores."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              <span className="question-text">
                6) ¿Qué es Instagram Shopping?
              </span>
              <select name="q6" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="shopping">
                  Una función para mostrar/etiquetar productos (si está disponible).
                </option>
                <option value="solo">Solo para ver memes.</option>
                <option value="wifi">Para conectarte al WiFi.</option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: Shopping está relacionado con catálogo y productos."}
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
                ? "¡Excelente! Ya sabes usar Instagram como herramienta profesional. 🎉"
                : "Buen intento. Revisa las tarjetas y vuelve a intentar el quiz."}
            </p>
          </div>
        )}
      </section>

      <footer className="contenido-footer">
        <div className="avance-mensaje">
          {gated && !timerTerminado && (
            <p>
              ⏳ Lee el contenido. El botón <strong>Siguiente</strong> se habilitará
              en {formatearTiempo(tiempoRestante)}.
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