// src/pages/contenido/modulo_1_contenido_20.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "@/Css/modulo_3_contenido_6 copy.css";

import wImagenPerfilImg from "../../assets/wImagenPerfilImg.png";
import WImagenMensajesImg from "../../assets/WImagenMensajesImg.png";
import ImagenEtiquetasImg from "../../assets/ImagenEtiquetasImg.png";
import ImagenEstadisticasImg from "../../assets/ImagenEstadisticasImg.png";
import ImagenCatalogoImg from "../../assets/ImagenCatalogoImg.png";

const API_URL = import.meta.env.VITE_API_URL
const MODULO_ID = 3; // ✅ Es módulo 3
const NUM_CONTENIDO = 6;
const TOTAL_PREGUNTAS = 6;

export default function ContenidoWhatsappBusinessFunciones() {
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
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido20");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  const correctAnswers = {
    q1: "perfilEmpresa",
    q2: "mensajeBienvenida",
    q3: "etiquetas",
    q4: "mensajesLeidos",
    q5: "catalogoProductos",
    q6: "buenUsoBusiness",
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
      `Obtuviste ${score} de ${TOTAL_PREGUNTAS} respuestas correctas.`,
      score >= 5 ? "success" : "info"
    );
  };

  // 🔙 Anterior
  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/modulo/3/contenido/19"); // ✅ Va al contenido 19 del módulo 3
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
          <h1>Funciones principales de WhatsApp Business</h1>
          <p className="sub">
            Aprende cómo el perfil empresarial, las herramientas de mensajería,
            la organización de clientes, las estadísticas y el catálogo te
            ayudan a usar WhatsApp Business de forma profesional.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">5.1</span>
              Perfil empresarial
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  El <strong>perfil empresarial</strong> de WhatsApp Business
                  permite mostrar información importante del negocio en un solo
                  lugar, para que los clientes sepan quién eres y cómo
                  contactarte.
                </p>
                <ul className="lista-simple">
                  <li>Nombre del negocio y categoría.</li>
                  <li>Descripción breve de lo que ofreces.</li>
                  <li>Dirección, horario de atención y ubicación en el mapa.</li>
                  <li>
                    Correo electrónico, sitio web y otros datos de contacto.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={wImagenPerfilImg}
                  alt="Ejemplo de perfil empresarial en WhatsApp Business"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">5.2</span>
              Herramientas de mensajería
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  WhatsApp Business incluye{" "}
                  <strong>mensajes automáticos</strong> que ayudan a atender
                  mejor a los clientes y ahorrar tiempo.
                </p>
                <ul className="lista-simple">
                  <li>
                    <strong>Mensaje de bienvenida:</strong> se envía cuando un
                    cliente escribe por primera vez.
                  </li>
                  <li>
                    <strong>Mensaje de ausencia:</strong> informa cuando el
                    negocio está cerrado o fuera de horario.
                  </li>
                  <li>
                    <strong>Respuestas rápidas:</strong> atajos para mensajes
                    frecuentes como precios, horarios o direcciones.
                  </li>
                  <li>
                    <strong>Listas de difusión:</strong> permiten enviar el
                    mismo aviso a varios contactos sin crear un grupo.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={WImagenMensajesImg}
                  alt="Pantalla de mensajes automáticos en WhatsApp Business"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">5.3</span>
              Organización de clientes
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Para no perder conversaciones importantes, WhatsApp Business
                  permite <strong>organizar clientes con etiquetas</strong>.
                </p>
                <ul className="lista-simple">
                  <li>
                    Crear etiquetas como: “nuevo cliente”, “pedido en proceso”,
                    “pagado”, “proveedor”, etc.
                  </li>
                  <li>
                    Buscar chats por etiqueta para dar seguimiento a pedidos o
                    cobros pendientes.
                  </li>
                  <li>
                    Combinar etiquetas con listas de difusión para enviar
                    mensajes a grupos específicos.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={ImagenEtiquetasImg}
                  alt="Ejemplo de etiquetas para organizar clientes"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">5.4</span>
              Estadísticas y métricas
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  WhatsApp Business muestra estadísticas sencillas que ayudan a
                  conocer el <strong>alcance de los mensajes</strong>.
                </p>
                <ul className="lista-simple">
                  <li>
                    <strong>Mensajes enviados:</strong> cuántos mensajes se han
                    mandado desde la cuenta.
                  </li>
                  <li>
                    <strong>Mensajes entregados:</strong> cuántos llegaron al
                    teléfono del cliente.
                  </li>
                  <li>
                    <strong>Mensajes leídos:</strong> cuántos fueron abiertos y
                    revisados.
                  </li>
                  <li>
                    Estos datos permiten mejorar horarios de envío y tipo de
                    mensajes que funcionan mejor.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={ImagenEstadisticasImg}
                  alt="Pantalla de estadísticas en WhatsApp Business"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">5.5</span>
              Catálogo y ventas
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  El <strong>catálogo</strong> permite mostrar productos o
                  servicios directamente en WhatsApp Business, casi como un
                  pequeño escaparate digital.
                </p>
                <ul className="lista-simple">
                  <li>
                    Cada producto puede tener foto, nombre, precio y
                    descripción.
                  </li>
                  <li>
                    Desde el chat se pueden enviar fichas del catálogo para
                    resolver dudas y tomar pedidos.
                  </li>
                  <li>
                    Facilita compartir promociones sin necesidad de enviar
                    muchas fotos o textos repetidos.
                  </li>
                  <li>
                    Ayuda a que el cliente vea rápidamente qué ofrece el negocio
                    y cuánto cuesta.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={ImagenCatalogoImg}
                  alt="Ejemplo de catálogo de productos en WhatsApp Business"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>
      </main>

      <section className="video-section">
        <h2 className="section-title inline">
          <span className="section-number">5.6</span>
          Video: WhatsApp Business para tu negocio
        </h2>
        <p className="video-hint">
          Mira el siguiente video para reforzar cómo funciona WhatsApp Business
          y cómo puede apoyar a pequeños negocios y emprendedores.
        </p>
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/UOj_1r8fir0"
            title="WhatsApp Business para tu negocio"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">5.7</span>
          Actividad práctica del tema
        </h2>
        <ol>
          <li>
            Piensa en un <strong>negocio de tu comunidad</strong> (por ejemplo,
            una tienda, una panadería o una papelería) y escribe:
            <ul className="lista-simple">
              <li>Nombre del negocio.</li>
              <li>Qué producto o servicio ofrece.</li>
              <li>
                Cómo podría usar <strong>WhatsApp Business</strong> para atender
                mejor a sus clientes.
              </li>
            </ul>
          </li>
          <li>
            Imagina que eres dueño de ese negocio y diseña un{" "}
            <strong>perfil de empresa</strong> escribiendo:
            <ul className="lista-simple">
              <li>Nombre del negocio.</li>
              <li>Descripción breve.</li>
              <li>Horario de atención.</li>
              <li>Un mensaje corto para la sección &quot;Información&quot;.</li>
            </ul>
          </li>
          <li>
            Diseña un <strong>mensaje de bienvenida automático</strong> para tus
            clientes nuevos.
          </li>
          <li>
            Escribe al menos <strong>tres etiquetas</strong> que usarías para
            organizar tus chats (por ejemplo: “Nuevo pedido”, “En preparación”,
            “Entregado”).
          </li>
        </ol>
        <p className="hint">
          Procura usar ejemplos reales de negocios de tu comunidad. Eso te
          ayudará a aplicar mejor lo aprendido.
        </p>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">5.8</span>
          Quiz: Funciones de WhatsApp Business
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              <span className="question-text">
                1) ¿Qué información forma parte del{" "}
                <strong>perfil empresarial</strong>?
              </span>
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="fondosPantalla">
                  Los fondos de pantalla del dueño del negocio.
                </option>
                <option value="perfilEmpresa">
                  Nombre del negocio, categoría, descripción y datos de
                  contacto.
                </option>
                <option value="juegos">
                  Los juegos instalados en el teléfono.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto: el perfil empresarial muestra datos claros del negocio."
                  : "❗ Revisa: el perfil debe contener datos del negocio, no información personal irrelevante."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              <span className="question-text">
                2) ¿Cuál de las siguientes opciones es una{" "}
                <strong>herramienta de mensajería</strong> de WhatsApp Business?
              </span>
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="cambiarTema">
                  Cambiar el tema del teléfono a modo oscuro.
                </option>
                <option value="mensajeBienvenida">
                  Configurar un mensaje de bienvenida para nuevos clientes.
                </option>
                <option value="bloquearNumero">
                  Bloquear todos los contactos que escriban.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto: el mensaje de bienvenida es una herramienta de mensajería."
                  : "❗ Cambiar el tema o bloquear a todos no es una herramienta para mejorar la atención al cliente."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              <span className="question-text">
                3) ¿Cómo ayuda la función de{" "}
                <strong>etiquetas de clientes</strong>?
              </span>
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="etiquetas">
                  Permite clasificar chats (por ejemplo: “nuevo cliente”,
                  “pedido en proceso”, “pagado”).
                </option>
                <option value="cambiarTono">
                  Sirve solo para cambiar el tono de los mensajes.
                </option>
                <option value="borrarChats">
                  Borra automáticamente todos los mensajes viejos.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto: las etiquetas ayudan a organizar y encontrar rápidamente los chats importantes."
                  : "❗ Las etiquetas no cambian sonidos ni borran mensajes, sirven para organizar clientes."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              <span className="question-text">
                4) ¿Qué dato es un ejemplo de{" "}
                <strong>estadística o métrica</strong> en WhatsApp Business?
              </span>
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="colorIcono">
                  El color del ícono de la aplicación.
                </option>
                <option value="mensajesLeidos">
                  La cantidad de mensajes que fueron leídos por los clientes.
                </option>
                <option value="nivelBateria">
                  El nivel de batería del teléfono.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto: las métricas muestran cuántos mensajes se envían, entregan y leen."
                  : "❗ El color del ícono o la batería no son estadísticas de la cuenta de negocio."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              <span className="question-text">
                5) ¿Para qué sirve el <strong>catálogo</strong> en WhatsApp
                Business?
              </span>
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="catalogoFondos">
                  Para guardar solo fondos de pantalla bonitos.
                </option>
                <option value="catalogoProductos">
                  Para mostrar productos o servicios con foto, precio y
                  descripción.
                </option>
                <option value="catalogoJuegos">
                  Para instalar juegos dentro de WhatsApp.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto: el catálogo es como un pequeño escaparate de productos o servicios."
                  : "❗ El catálogo no es para fondos ni juegos, es para mostrar lo que vende el negocio."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              <span className="question-text">
                6) ¿Cuál de estas situaciones representa un{" "}
                <strong>buen uso</strong> de WhatsApp Business?
              </span>
              <select name="q6" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="soloMemes">
                  Usarlo solo para enviar memes a los amigos.
                </option>
                <option value="buenUsoBusiness">
                  Usarlo para atender clientes, enviar información clara y dar
                  seguimiento a pedidos con etiquetas y catálogo.
                </option>
                <option value="ignorarClientes">
                  Abrir mensajes de clientes pero nunca responderlos.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto: el objetivo de WhatsApp Business es mejorar la atención y las ventas."
                  : "❗ Si solo se usa para memes o se ignoran los mensajes, no se aprovecha como herramienta de negocio."}
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
                ? "¡Excelente! Entiendes muy bien las funciones principales de WhatsApp Business. 🎉"
                : "Buen intento. Revisa las tarjetas donde tuviste dudas y vuelve a intentar el quiz."}
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
