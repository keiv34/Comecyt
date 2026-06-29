// src/pages/contenido/modulo_1_contenido_9.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_2_contenido_1.css";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MODULO_ID = 2; // ✅ Es módulo 2
const NUM_CONTENIDO = 1;

export default function ContenidoFacebookIntro() {
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [feedback, setFeedback] = useState({});
  const [answers, setAnswers] = useState({});

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
  const [totalContenidos, setTotalContenidos] = useState(8);
  const [modulos, setModulos] = useState([]);

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido9");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  const correctAnswers = {
    q1: "redSocial",
    q2: "comunicacion",
    q3: "alcanceMundial",
    q4: "ventajaFacebook",
    q5: "marketplaceLocal",
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

        const modulo2 = modulosData.find(
          (m) => m.modulo_id === MODULO_ID
        );

        if (modulo2) {
          setTotalContenidos(modulo2.total_contenidos); // 👈 NUEVO
          const p = Number(modulo2.progreso_actual ?? 0);
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
      const isCorrect = answers[key] === correctAnswers[key];
      if (isCorrect) score += 1;
      newFeedback[key] = isCorrect ? "correct" : "incorrect";
    });

    setQuizScore(score);
    setFeedback(newFeedback);
    setQuizAnswered(true);

    showToast(
      `Obtuviste ${score} de 5 respuestas correctas.`,
      score === 5 ? "success" : "info"
    );
  };

  // 🔙 Anterior
  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/modulo/1/contenido/8");
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  if (!progresoCargado) {
    return (
      <div className="fbintro-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#6a0f3c'
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
    <div className="fbintro-container">
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="fbintro-header">
        <div className="fb-header-inner">
          <div>
            <h1>Introducción a Facebook y Facebook Marketplace</h1>
          </div>
        </div>
      </header>

      <section className="intro-card">
        <h2 className="section-title">
          <span className="section-number">2.0</span>
          ¿Qué puedes hacer en Facebook?
        </h2>
        <p>
          Facebook es una red social que permite crear un perfil personal,
          conectarse con otras personas, compartir contenido y comunicarse a
          través de mensajes, comentarios y reacciones. Conocer sus funciones
          principales te ayuda a usarla de forma más segura, responsable y
          provechosa.
        </p>
      </section>

      <main className="content-grid">
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">1.1</span>
              ¿Qué es Facebook?
            </h3>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  <strong>Facebook</strong> es una <strong>red social</strong>.
                  Es un lugar en internet donde las personas:
                </p>
                <ul className="lista-centrada">
                  <li>
                    Tienen un perfil con su nombre y, si quieren, una foto.
                  </li>
                  <li>Agregan a amigos, familiares y conocidos.</li>
                  <li>Comparten fotos, videos y mensajes.</li>
                  <li>Ven lo que otras personas publican.</li>
                </ul>
                <p>
                  Puedes imaginar Facebook como una{" "}
                  <strong>plaza o salón grande</strong>, pero digital, donde
                  todos tienen un espacio para platicar y compartir cosas.
                </p>
              </div>

              <figure className="media media-side">
                <img
                  src={fbIntroImg}
                  alt="Pantalla principal de Facebook en una computadora"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">1.2</span>
              ¿Para qué sirve Facebook?
            </h3>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>Facebook tiene varios objetivos importantes, entre ellos:</p>
                <ul className="lista-centrada">
                  <li>
                    🗣 <strong>Comunicación:</strong> mandar mensajes, fotos y
                    videos a personas que están cerca o lejos.
                  </li>
                  <li>
                    📰 <strong>Información:</strong> ver noticias, anuncios,
                    avisos de tu comunidad o de la escuela.
                  </li>
                  <li>
                    👥 <strong>Comunidades:</strong> unirte a grupos de tu
                    colonia, iglesia, escuela o actividades que te gusten.
                  </li>
                  <li>
                    🛒 <strong>Comercio:</strong> usar <em>Marketplace</em> para
                    comprar y vender productos.
                  </li>
                </ul>
                <p>
                  Facebook no es solo para "pasar el rato", también puede servir
                  para <strong>informarse, trabajar y vender</strong>.
                </p>
              </div>

              <figure className="media media-side">
                <img
                  src={fbObjetivosImg}
                  alt="Íconos que representan comunicación, grupos y ventas en Facebook"
                  className="side-image"
                />
                <img
                  src={fbImg}
                  alt="Íconos que representan comunicación, grupos y ventas en Facebook"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">1.3</span>
              Importancia y alcance mundial
            </h3>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Facebook es una de las redes sociales más usadas del mundo. Lo
                  utilizan <strong>millones de personas en muchos países</strong>
                  . Gracias a eso:
                </p>
                <ul className="lista-centrada">
                  <li>
                    Puedes comunicarte con familiares y amigos que viven en otra
                    ciudad o país.
                  </li>
                  <li>
                    Los negocios locales pueden darse a conocer sin gastar tanto
                    en publicidad.
                  </li>
                  <li>
                    Las organizaciones pueden difundir campañas, avisos y
                    eventos importantes.
                  </li>
                </ul>
                <p className="hint">
                  Para muchas personas, Facebook es su{" "}
                  <strong>primera puerta al mundo digital</strong>.
                </p>
              </div>

              <figure className="media media-side">
                <img
                  src={fbAlcanceImg}
                  alt="Mapa del mundo representando el alcance global de Facebook"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">1.4</span>
              Ventajas de Facebook como red social
            </h3>
          </header>
          <div className="card-body">
            <ul className="lista-centrada">
              <li>
                <strong>Es gratuito:</strong> crear una cuenta no tiene costo.
              </li>
              <li>
                <strong>Es sencillo de usar:</strong> funciona con botones e
                íconos, no necesitas ser experta/o en computación.
              </li>
              <li>
                <strong>Comunicación rápida:</strong> permite mandar mensajes,
                hacer llamadas y videollamadas.
              </li>
              <li>
                <strong>Funciona en varios dispositivos:</strong> celular,
                tableta y computadora.
              </li>
              <li>
                <strong>Mucho contenido útil:</strong> recetas, clases, noticias,
                ideas para negocio, etc.
              </li>
            </ul>
            <p className="hint">
              Una gran ventaja es que muchas personas ya usan Facebook, por eso
              es fácil encontrar contactos.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">1.5</span>
              Ventajas de Facebook Marketplace para ventas locales
            </h3>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  <strong>Facebook Marketplace</strong> es una parte de Facebook
                  donde se pueden <strong>comprar y vender productos</strong>.
                </p>
                <ul className="lista-centrada">
                  <li>
                    🏘 <strong>Personas cercanas:</strong> tus productos se
                    muestran a gente que vive cerca de ti.
                  </li>
                  <li>
                    💸 <strong>Publicar es gratis:</strong> no tienes que pagar
                    por subir tus anuncios.
                  </li>
                  <li>
                    💬 <strong>Contacto directo:</strong> los clientes te
                    escriben por Messenger para resolver dudas.
                  </li>
                  <li>
                    🧑‍🍳 <strong>Ideal para emprendedores:</strong> comida casera,
                    ropa, zapatos, manualidades, servicios y más.
                  </li>
                </ul>
              </div>

              <figure className="media media-side">
                <img
                  src={fbMarketImg}
                  className="side-image"
                  alt="Ejemplo de Facebook Marketplace"
                />
              </figure>
            </div>
          </div>
        </article>
      </main>

      <section className="video-section">
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/lY1CNHcbx8M"
            title="Historia de Facebook"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">1.7</span>
          Quiz: Comprueba lo aprendido
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className="q">
            <label>
              1) ¿Qué es Facebook?
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="buscador">
                  Un buscador para encontrar páginas web.
                </option>
                <option value="redSocial">
                  Una red social donde las personas se conectan y comparten
                  contenido.
                </option>
                <option value="juego">
                  Un juego en línea para ganar puntos.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto: Facebook es una red social."
                  : "❗ No es un buscador ni un simple juego, es una red social."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              2) Uno de los objetivos principales de Facebook es…
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="almacenarArchivos">
                  Guardar archivos como si fuera una memoria USB.
                </option>
                <option value="comunicacion">
                  Permitir que las personas se comuniquen y compartan
                  información.
                </option>
                <option value="editarVideos">
                  Editar videos profesionales para cine.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto: Facebook está hecho para la comunicación."
                  : "❗ Su función principal no es guardar archivos ni editar videos."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              3) ¿Qué significa que Facebook tenga "alcance mundial"?
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="soloMexico">Que solo funciona en México.</option>
                <option value="alcanceMundial">
                  Que personas de muchos países pueden usarlo.
                </option>
                <option value="soloEscuelas">
                  Que solo se usa en escuelas.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto: se usa en distintos países del mundo."
                  : "❗ Facebook no está limitado a un solo país o institución."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              4) Una ventaja importante de Facebook es que…
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="pagoMensual">
                  Cobra una mensualidad obligatoria.
                </option>
                <option value="ventajaFacebook">
                  Permite comunicarse rápido y sin costo con muchas personas.
                </option>
                <option value="soloNoticias">
                  Solo sirve para leer noticias.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto: la comunicación rápida y gratuita es una gran ventaja."
                  : "❗ Recuerda que Facebook no cobra una mensualidad obligatoria."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              5) ¿Para qué es especialmente útil Facebook Marketplace?
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="marketplaceLocal">
                  Para vender y comprar productos con personas cercanas.
                </option>
                <option value="verPeliculas">
                  Para ver películas en línea.
                </option>
                <option value="jugarAjedrez">
                  Para jugar ajedrez en internet.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto: Marketplace se usa para ventas locales."
                  : "❗ Marketplace está pensado para ventas y compras, no para juegos o películas."}
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
              Puntaje: <strong>{quizScore} / 5</strong>
            </p>
            <p className={quizScore === 5 ? "ok" : "warn"}>
              {quizScore === 5
                ? "¡Excelente! Comprendiste muy bien esta introducción a Facebook. 🎉"
                : "Buen trabajo, revisa las tarjetas y vuelve a intentarlo."}
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
              ✅ Ya completaste antes este contenido. Puedes avanzar libremente.
            </p>
          )}
          {gated && timerTerminado && scrolledBottom && (
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
