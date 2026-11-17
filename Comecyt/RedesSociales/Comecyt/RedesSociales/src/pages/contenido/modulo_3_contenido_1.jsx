// src/pages/contenido/modulo_1_contenido_15.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_3_contenido_1.css";

import whatsappIntroImg from "../../assets/whatsappIntro.png";
import whatsappWorldImg from "../../assets/whatsappWorld.png";
import whatsappPersonalBusinessImg from "../../assets/whatsappPersonalBusiness.png";
import whatsappSecurityImg from "../../assets/whatsappSecurity.png";

const API_URL = "http://localhost:4000";
const MODULO_ID = 3; // ✅ Es módulo 3
const NUM_CONTENIDO = 1;

export default function ContenidoWhatsappIntroduccion() {
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
  const [totalContenidos, setTotalContenidos] = useState(8);
  const [modulos, setModulos] = useState([]);

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido15");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  const correctAnswers = {
    q1: "whatsappMensajeria",
    q2: "evolucionPopular",
    q3: "ventajasBusiness",
    q4: "riesgosPrivacidad",
    q5: "limitesAcceso",
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

        const modulo3 = modulosData.find(
          (m) => m.modulo_id === MODULO_ID
        );

        if (modulo3) {
          setTotalContenidos(modulo3.total_contenidos); // 👈 NUEVO
          const p = Number(modulo3?.progreso_actual ?? 0);
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
    setAnswers((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      `Obtuviste ${score} de 5 respuestas correctas.`,
      score === 5 ? "success" : "info"
    );
  };

  // 🔙 Anterior
  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/modulo/2/contenido/14"); // ✅ Viene del último contenido del módulo 2
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  if (!progresoCargado) {
    return (
      <div className="wa-intro-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#075e54'
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
    <div className="wa-intro-container">
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="wa-header">
        <div className="wa-header-inner">
          <h1>Introducción a WhatsApp</h1>
          <p className="sub">
            Conoce qué es WhatsApp, cómo ha evolucionado y los principales
            riesgos que debes tener en cuenta.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">1.1</span>
              ¿Qué es WhatsApp?
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  <strong>WhatsApp</strong> es una aplicación de{" "}
                  <strong>mensajería instantánea</strong> que permite enviar
                  mensajes de texto, notas de voz, fotos, videos, documentos y
                  realizar llamadas y videollamadas usando{" "}
                  <strong>internet</strong> en lugar de saldo para llamadas o
                  SMS tradicionales.
                </p>
                <p>
                  Funciona principalmente en teléfonos inteligentes, pero
                  también se puede usar desde la computadora mediante{" "}
                  <strong>WhatsApp Web</strong> o la aplicación de escritorio.
                  Para crear una cuenta solo necesitas un{" "}
                  <strong>número de teléfono móvil</strong> activo.
                </p>
              </div>

              <figure className="media-side">
                <img
                  src={whatsappIntroImg}
                  alt="Interfaz general de WhatsApp"
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
              Evolución y popularidad a nivel mundial
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  WhatsApp fue creada en <strong>2009</strong> y con el paso de
                  los años pasó de ser una aplicación básica para enviar
                  mensajes a convertirse en la{" "}
                  <strong>app de mensajería más utilizada en el mundo</strong>.
                </p>
                <p>
                  Con el tiempo se incorporaron funciones como{" "}
                  <strong>llamadas y videollamadas</strong>,{" "}
                  <strong>estados</strong>, <strong>comunidades</strong> y{" "}
                  <strong>canales</strong>, lo que la volvió una herramienta
                  clave para coordinar actividades escolares, laborales y
                  familiares.
                </p>
                <p>
                  En países como México y en gran parte de América Latina, muchas
                  personas prefieren WhatsApp sobre otras aplicaciones porque es
                  sencilla, rápida y la mayoría de sus contactos la usa.
                </p>
              </div>

              <figure className="media-side">
                <img
                  src={whatsappWorldImg}
                  alt="Popularidad de WhatsApp en el mundo"
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
              Ventajas de WhatsApp personal y WhatsApp Business
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <h3>WhatsApp personal</h3>
                <ul className="lista-simple">
                  <li>
                    Es <strong>gratuito</strong>, solo necesitas conexión a
                    internet (datos móviles o Wi-Fi).
                  </li>
                  <li>
                    Interfaz <strong>sencilla</strong> y fácil de usar, incluso
                    para quienes están empezando con la tecnología.
                  </li>
                  <li>
                    Permite compartir <strong>texto, fotos, videos, audios</strong> y documentos.
                  </li>
                  <li>
                    Se pueden crear <strong>grupos</strong> para coordinar
                    tareas, proyectos o actividades familiares.
                  </li>
                  <li>
                    Cuenta con <strong>cifrado de extremo a extremo</strong>,
                    que protege el contenido de los mensajes.
                  </li>
                </ul>

                <h3>WhatsApp Business</h3>
                <ul className="lista-simple">
                  <li>
                    Permite crear un <strong>perfil de empresa</strong> con
                    nombre comercial, descripción, dirección, horario y formas
                    de contacto.
                  </li>
                  <li>
                    Incluye <strong>mensajes automáticos</strong> (bienvenida,
                    ausencia y respuestas rápidas) para atender mejor a los
                    clientes.
                  </li>
                  <li>
                    Ofrece un <strong>catálogo</strong> para mostrar productos o
                    servicios con fotos, precios y descripciones.
                  </li>
                  <li>
                    Permite usar <strong>etiquetas</strong> para organizar
                    conversaciones: “nuevo cliente”, “pedido en proceso”,
                    “pagado”, etc.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={whatsappPersonalBusinessImg}
                  alt="Comparación de WhatsApp personal y Business"
                  className="side-image"
                />
                <figcaption className="caption">
                  WhatsApp Business agrega herramientas especiales para
                  emprendedores y negocios.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">1.4</span>
              Limitaciones y riesgos de ambas versiones
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <h3>Limitaciones técnicas y de acceso</h3>
                <ul className="lista-simple">
                  <li>
                    Depende de un <strong>teléfono inteligente</strong> y
                    conexión a internet, lo que puede ser una barrera en algunas
                    comunidades.
                  </li>
                  <li>
                    La cuenta está ligada a un <strong>solo número</strong>; si
                    se pierde el chip o se cambia, puede ser necesario
                    configurar todo de nuevo.
                  </li>
                </ul>

                <h3>Riesgos de privacidad y seguridad</h3>
                <ul className="lista-simple">
                  <li>
                    Circular <strong>noticias falsas</strong> si el usuario no
                    verifica la información.
                  </li>
                  <li>
                    Compartir <strong>datos personales</strong> (dirección,
                    cuentas bancarias, fotografías privadas) con personas
                    desconocidas.
                  </li>
                </ul>

                <h3>Riesgos en WhatsApp Business</h3>
                <ul className="lista-simple">
                  <li>
                    Manejo inadecuado de <strong>datos de clientes</strong>,
                    como nombres, teléfonos y direcciones.
                  </li>
                  <li>
                    Comunicación poco profesional o tardía, que afecta la{" "}
                    <strong>imagen del negocio</strong>.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={whatsappSecurityImg}
                  alt="Seguridad y riesgos en WhatsApp"
                  className="side-image"
                />
                <figcaption className="caption">
                  Es importante usar WhatsApp con responsabilidad para evitar
                  fraudes y problemas de privacidad.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>
      </main>

      <section className="video-section">
        <h2 className="section-title inline">
          <span className="section-number">1.5</span>
          Video: ¿Qué es WhatsApp?
        </h2>
        <p className="video-hint">
          Mira el siguiente video para reforzar los conceptos básicos de
          WhatsApp, su evolución y sus usos principales.
        </p>
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/97PU1vKWlHs"
            title="Introducción a WhatsApp"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">1.6</span>
          Actividad práctica del tema
        </h2>
        <ol>
          <li>
            Escribe <strong>tres situaciones</strong> en las que podrías usar
            WhatsApp de forma responsable en tu escuela, trabajo o comunidad.
          </li>
          <li>
            Menciona <strong>dos ventajas</strong> de usar WhatsApp Business
            para un negocio pequeño de tu localidad.
          </li>
          <li>
            Escribe <strong>dos riesgos</strong> de usar WhatsApp sin cuidar tu
            privacidad.
          </li>
          <li>
            Comparte tus respuestas con tu docente o instructor y comenten en
            grupo qué prácticas consideran más seguras.
          </li>
        </ol>
        <p className="hint">
          Recuerda: no todo lo que llega por mensaje es verdadero. Verifica la
          información antes de compartirla.
        </p>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">1.7</span>
          Quiz: Comprueba lo aprendido
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              1) ¿Cuál es la mejor definición de WhatsApp?
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="redSocialFotos">
                  Una red social pensada solo para publicar fotos.
                </option>
                <option value="whatsappMensajeria">
                  Una aplicación de mensajería instantánea para enviar textos,
                  notas de voz, archivos y hacer llamadas usando internet.
                </option>
                <option value="editorTextos">
                  Un editor de documentos similar a Word.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto: WhatsApp es una app de mensajería instantánea que funciona con internet."
                  : "❗ Revisa el concepto: WhatsApp no es un editor de textos ni solo una red de fotos."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              2) ¿Qué aspecto describe mejor la evolución de WhatsApp?
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="soloMensajes">
                  Sigue siendo solo para enviar mensajes de texto básicos.
                </option>
                <option value="evolucionPopular">
                  Ha agregado funciones como llamadas, videollamadas, estados y
                  comunidades, convirtiéndose en la app de mensajería más usada.
                </option>
                <option value="soloComputadora">
                  Solo se puede usar desde computadoras de escritorio.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto: con el tiempo WhatsApp ha añadido más funciones y se ha vuelto muy popular."
                  : "❗ Recuerda que WhatsApp incluye llamadas, videollamadas y estados, no solo mensajes."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              3) ¿Cuál de estas opciones es una ventaja específica de WhatsApp
              Business?
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="soloFamilia">
                  Poder hablar únicamente con familiares cercanos.
                </option>
                <option value="ventajasBusiness">
                  Crear un perfil de empresa, configurar mensajes automáticos y
                  mostrar un catálogo de productos o servicios.
                </option>
                <option value="jugarEnLinea">
                  Entrar a salas de juegos en línea con otros usuarios.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto: WhatsApp Business está pensado para negocios y emprendedores."
                  : "❗ Revisa: WhatsApp Business agrega catálogo, perfil de empresa y mensajes automáticos."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              4) ¿Cuál es un riesgo importante al usar WhatsApp?
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="usarConFamilia">
                  Usarlo para avisar a tu familia que llegaste bien a casa.
                </option>
                <option value="configurarPrivacidad">
                  Activar opciones de privacidad para que solo tus contactos vean tu información.
                </option>
                <option value="riesgosPrivacidad">
                  Compartir datos personales o creer en cadenas y mensajes falsos sin verificar.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto: debes cuidar tus datos y no creer todo lo que llega por mensaje."
                  : "❗ El riesgo aparece cuando compartimos demasiada información o creemos en mensajes falsos."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              5) ¿Cuál de estas situaciones refleja una limitación de acceso a
              WhatsApp?
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="limitesAcceso">
                  No tener un teléfono inteligente o conexión a internet
                  disponible en la comunidad.
                </option>
                <option value="grupoEscuela">
                  Tener un grupo escolar donde se comparten tareas y avisos.
                </option>
                <option value="usarEstados">
                  Publicar estados de vez en cuando.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto: sin dispositivo o internet, es difícil acceder a la aplicación."
                  : "❗ Piensa en qué necesita una persona para poder usar WhatsApp en primer lugar."}
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
                ? "¡Excelente! Dominas los conceptos básicos de WhatsApp. 🎉"
                : "Buen intento. Revisa las tarjetas donde tuviste dudas y vuelve a intentarlo."}
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