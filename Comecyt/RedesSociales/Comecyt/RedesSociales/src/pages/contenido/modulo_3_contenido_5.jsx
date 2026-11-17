// src/pages/contenido/modulo_1_contenido_19.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "@/Css/modulo_3_contenido_5.css";

import wBusinessIntroImg from "../../assets/wBusinessIntro.png";
import wBusinessBeneficiosImg from "../../assets/wBusinessBeneficios.png";
import wBusinessImpactoImg from "../../assets/wBusinessImpacto.png";
import wBusinessPaso1 from "../../assets/wBusinessPaso1.png";
import wBusinessPaso2 from "../../assets/wBusinessPaso2.png";
import wBusinessPaso3 from "../../assets/wBusinessPaso3.png";
import whatsappRegistroPaso3 from "../../assets/whatsappRegistroPaso3.png";
import wBusinessPaso5 from "../../assets/wBusinessPaso5.jpg";
import wBusinessPaso6 from "../../assets/wBusinessPaso6.png";
import wBusinessPaso7 from "../../assets/wBusinessPaso7.png";

const API_URL = "http://localhost:4000";
const MODULO_ID = 3; // ✅ Es módulo 3
const NUM_CONTENIDO = 5;
const TOTAL_PREGUNTAS = 6;

export default function ContenidoWhatsappBusiness() {
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
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido19");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  const correctAnswers = {
    q1: "defBusiness",
    q2: "telInternet",
    q3: "perfilCompleto",
    q4: "benefOrganiza",
    q5: "catalogoCompleto",
    q6: "buenaPractica",
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
    navigate("/modulo/3/contenido/18"); // ✅ Va al contenido 18 del módulo 3
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
          <h1>WhatsApp Business: perfil y herramientas de mensajería</h1>
          <p className="sub">
            Conoce qué es WhatsApp Business, cómo crear tu cuenta y cómo puede
            ayudar a pequeños negocios y emprendedores.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">4.1</span>
              ¿Qué es WhatsApp Business?
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  <strong>WhatsApp Business</strong> es una versión de WhatsApp
                  diseñada especialmente para <strong>negocios pequeños</strong>,
                  <strong> emprendedores</strong> y{" "}
                  <strong>servicios locales</strong>. Permite comunicarse con
                  los clientes de forma rápida y sencilla usando{" "}
                  <strong>mensajes, llamadas y notas de voz</strong>.
                </p>
                <p>
                  Incluye herramientas especiales como el{" "}
                  <strong>perfil de empresa</strong>,{" "}
                  <strong>mensajes automáticos</strong>,{" "}
                  <strong>catálogo de productos</strong> y{" "}
                  <strong>etiquetas</strong> para organizar conversaciones. Todo
                  esto ayuda a que el negocio se vea más{" "}
                  <strong>profesional y ordenado</strong>, aunque sea pequeño.
                </p>
              </div>

              <figure className="media-side">
                <img
                  src={wBusinessIntroImg}
                  alt="Ejemplo de perfil de WhatsApp Business"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">4.2</span>
              Cómo crear una cuenta en WhatsApp Business
            </h2>
          </header>

          <div className="card-body">
            <p className="pasos-intro">
              Sigue cada paso con calma: primero lee el texto y después observa
              la imagen de ejemplo que colocarás en la parte inferior.
            </p>

            <ol className="lista-pasos-img">
              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 1</strong>
                </p>
                <p className="paso-texto">
                  Abre la <strong>Play Store</strong> (Android) o la{" "}
                  <strong>App Store</strong> (iPhone) y escribe{" "}
                  <strong>&quot;WhatsApp Business&quot;</strong> en el buscador.
                  Verifica que el desarrollador sea{" "}
                  <strong>WhatsApp LLC</strong>.
                </p>

                <figure className="paso-figure">
                  <img
                    src={wBusinessPaso1}
                    alt="Búsqueda de WhatsApp Business en la tienda"
                    className="paso-img"
                  />
                  <figcaption className="paso-caption">
                    Aquí puedes colocar una captura de la tienda de apps mostrando
                    WhatsApp Business.
                  </figcaption>
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 2</strong>
                </p>
                <p className="paso-texto">
                  Pulsa en <strong>Instalar</strong> y espera a que termine la
                  descarga. Después, toca en <strong>Abrir</strong> para entrar
                  a la aplicación y acepta los{" "}
                  <strong>Términos y condiciones</strong>.
                </p>

                <figure className="paso-figure">
                  <img
                    src={wBusinessPaso2}
                    alt="Pantalla de instalación de WhatsApp Business"
                    className="paso-img"
                  />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 3</strong>
                </p>
                <p className="paso-texto">
                  Elige el <strong>número de teléfono</strong> que usarás para
                  tu negocio. Puede ser uno diferente al de tu WhatsApp
                  personal. Selecciona el país, escribe el número completo y
                  confirma que sea correcto.
                </p>

                <figure className="paso-figure">
                  <img
                    src={wBusinessPaso3}
                    alt="Pantalla para escribir el número de teléfono"
                    className="paso-img"
                  />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 4</strong>
                </p>
                <p className="paso-texto">
                  Recibirás un <strong>SMS con un código de 6 dígitos</strong>.
                  Escríbelo en la aplicación para verificar tu número. En muchos
                  casos, la app lo detecta automáticamente.
                </p>

                <figure className="paso-figure">
                  <img
                    src={whatsappRegistroPaso3}
                    alt="Pantalla para ingresar el código SMS"
                    className="paso-img"
                  />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 5</strong>
                </p>
                <p className="paso-texto">
                  Escribe el <strong>nombre de tu negocio</strong> (por ejemplo
                  “Papelería Lupita” o “Tacos El Amigo”), elige la{" "}
                  <strong>categoría</strong> y agrega una{" "}
                  <strong>foto o logotipo</strong> que lo represente.
                </p>

                <figure className="paso-figure">
                  <img
                    src={wBusinessPaso5}
                    alt="Pantalla para poner nombre y categoría del negocio"
                    className="paso-img"
                  />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 6</strong>
                </p>
                <p className="paso-texto">
                  Completa el <strong>perfil de empresa</strong> con una
                  descripción breve, dirección, horario de atención y, si
                  tienes, correo electrónico o página web.
                </p>

                <figure className="paso-figure">
                  <img
                    src={wBusinessPaso6}
                    alt="Perfil de empresa en WhatsApp Business"
                    className="paso-img"
                  />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 7</strong>
                </p>
                <p className="paso-texto">
                  En <strong>Herramientas para la empresa</strong> configura
                  mensajes de <strong>bienvenida</strong>,{" "}
                  <strong>ausencia</strong> y <strong>respuestas rápidas</strong>{" "}
                  para atender a tus clientes de forma más rápida y ordenada.
                </p>

                <figure className="paso-figure">
                  <img
                    src={wBusinessPaso7}
                    alt="Pantalla de herramientas para la empresa"
                    className="paso-img"
                  />
                </figure>
              </li>
            </ol>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">4.3</span>
              Beneficios para negocios y emprendedores
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  WhatsApp Business ayuda a que los negocios pequeños se vean
                  más <strong>profesionales</strong> y atiendan mejor a sus
                  clientes, incluso si solo usan un teléfono celular.
                </p>
                <ul className="lista-simple">
                  <li>
                    Comunicación <strong>directa y rápida</strong> con los
                    clientes desde el celular.
                  </li>
                  <li>
                    Imagen más <strong>seria y confiable</strong> gracias al
                    perfil de empresa y mensajes automáticos.
                  </li>
                  <li>
                    Uso de <strong>etiquetas</strong> para organizar pedidos:
                    “nuevo cliente”, “en proceso”, “pagado”, “entregado”, etc.
                  </li>
                  <li>
                    Ahorro de tiempo con <strong>respuestas rápidas</strong> a
                    preguntas frecuentes.
                  </li>
                  <li>
                    Mayor <strong>alcance</strong>, porque muchas personas ya
                    usan WhatsApp y pueden recomendar el negocio.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={wBusinessBeneficiosImg}
                  alt="Beneficios de usar WhatsApp Business en un negocio"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">4.4</span>
              Impacto de WhatsApp Business en el comercio digital
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  WhatsApp Business forma parte del{" "}
                  <strong>comercio digital</strong>, es decir, de las ventas y
                  servicios que se apoyan en la tecnología e internet.
                </p>
                <ul className="lista-simple">
                  <li>
                    Facilita que negocios pequeños entren al{" "}
                    <strong>mundo digital</strong> sin necesidad de una página
                    web.
                  </li>
                  <li>
                    Aumenta la <strong>visibilidad y recomendación</strong> del
                    negocio entre contactos y grupos.
                  </li>
                  <li>
                    Mejora la <strong>atención al cliente</strong> al responder
                    rápido y con información clara.
                  </li>
                  <li>
                    Apoya la <strong>economía local</strong> al permitir que
                    comercios de barrio lleguen a más personas.
                  </li>
                  <li>
                    Permite realizar <strong>ventas a distancia</strong> con
                    entregas a domicilio y coordinación por chat.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={wBusinessImpactoImg}
                  alt="Impacto de WhatsApp Business en el comercio digital"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>
      </main>

      <section className="video-section">
        <h2 className="section-title inline">
          <span className="section-number">4.5</span>
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
          <span className="section-number">4.6</span>
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
          <span className="section-number">4.7</span>
          Quiz: WhatsApp Business y su uso en negocios
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              <span className="question-text">
                1) ¿Cuál es la mejor definición de WhatsApp Business?
              </span>
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="editorTextos">
                  Una aplicación para editar documentos de texto.
                </option>
                <option value="defBusiness">
                  Una versión de WhatsApp pensada para negocios, con
                  herramientas especiales para atender clientes.
                </option>
                <option value="soloFotos">
                  Una red social para publicar fotos y videos cortos.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto: WhatsApp Business está diseñada para negocios y emprendedores."
                  : "❗ Revisa: WhatsApp Business no es un editor de textos ni solo una red de fotos."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              <span className="question-text">
                2) ¿Qué es indispensable para crear una cuenta en WhatsApp
                Business?
              </span>
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="soloPC">
                  Tener una computadora de escritorio.
                </option>
                <option value="telInternet">
                  Tener un número de teléfono y un celular con internet.
                </option>
                <option value="cuentaBanco">
                  Tener una cuenta bancaria.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto: necesitas un número de teléfono y un celular con conexión a internet."
                  : "❗ Recuerda que la cuenta se crea desde el celular con un número y acceso a internet."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              <span className="question-text">
                3) ¿Qué información se puede incluir en el perfil de empresa de
                WhatsApp Business?
              </span>
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="apodoFoto">
                  Solo un apodo y una foto cualquiera.
                </option>
                <option value="perfilCompleto">
                  Nombre del negocio, descripción, dirección y horario de
                  atención.
                </option>
                <option value="soloCorreo">
                  Solo el correo electrónico del dueño.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto: el perfil de empresa permite mostrar datos completos del negocio."
                  : "❗ Revisa: el perfil no se limita a un apodo o un solo dato, sino que incluye información más completa."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              <span className="question-text">
                4) ¿Cuál de las siguientes opciones es un beneficio para un
                pequeño negocio al usar WhatsApp Business?
              </span>
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="dificulta">
                  Es más difícil que los clientes se comuniquen.
                </option>
                <option value="benefOrganiza">
                  Permite organizar chats con etiquetas y dar una atención más
                  rápida y ordenada.
                </option>
                <option value="obligaCerrar">
                  Obliga a cerrar el negocio físico.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto: WhatsApp Business ayuda a organizar la comunicación con los clientes."
                  : "❗ Recuerda: su objetivo es mejorar la atención, no dificultarla ni cerrar el negocio físico."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              <span className="question-text">
                5) ¿Qué característica tiene el catálogo de WhatsApp Business?
              </span>
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="soloTexto">
                  Solo permite texto sin imágenes.
                </option>
                <option value="catalogoCompleto">
                  Permite mostrar productos o servicios con fotos, precios y
                  descripciones.
                </option>
                <option value="soloExtranjero">
                  Solo funciona si el negocio vende al extranjero.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto: el catálogo permite presentar productos y servicios de forma clara."
                  : "❗ Revisa: el catálogo no está limitado a texto ni a ventas en el extranjero."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              <span className="question-text">
                6) ¿Cuál es una buena práctica al usar WhatsApp Business con los
                clientes?
              </span>
              <select name="q6" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="datosSensibles">
                  Compartir información personal sensible para que todos la
                  vean.
                </option>
                <option value="buenaPractica">
                  Usar mensajes claros y respetuosos, verificando la información
                  y cuidando los datos personales.
                </option>
                <option value="cualquierHora">
                  Enviar mensajes a cualquier hora, aunque molesten a los demás.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto: es importante ser respetuoso, honesto y cuidar la privacidad de los clientes."
                  : "❗ Evita compartir datos sensibles o enviar mensajes que puedan molestar o poner en riesgo a otras personas."}
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
                ? "¡Excelente! Comprendes muy bien cómo usar WhatsApp Business en un negocio. 🎉"
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