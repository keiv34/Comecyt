// src/pages/contenido/modulo_1_contenido_16.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_3_contenido_2.css";

// 🔹 Imágenes de ejemplo para los pasos (1–6)
import whatsappRegistroPaso1 from "../../assets/whatsappRegistroPaso1.png";
import whatsappRegistroPaso2 from "../../assets/whatsappRegistroPaso2.png";
import whatsappRegistroPaso3 from "../../assets/whatsappRegistroPaso3.png";
import whatsappRegistroPaso4 from "../../assets/whatsappRegistroPaso4.png";
import whatsappRegistroPaso5 from "../../assets/whatsappRegistroPaso5.png";
import whatsappRegistroPaso6 from "../../assets/whatsappRegistroPaso6.png";
import whatsappComunicacionImg from "../../assets/whatsappComunicacion.png";
import whatsappLlamadasImg from "../../assets/whatsappLlamadas.png";
import whatsappGruposImg from "../../assets/whatsappGrupos.png";
import whatsappEstadosImg from "../../assets/whatsappEstados.png";

const API_URL = "http://localhost:4000";
const MODULO_ID = 3; // ✅ Es módulo 3
const NUM_CONTENIDO = 2;
const TOTAL_PREGUNTAS = 6;

export default function ContenidoWhatsappFunciones() {
  // ===== ESTADO PARA EL QUIZ =====
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);

  // 🔔 Notificaciones tipo toast
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  // ⏱️ control de avance (timer + scroll)
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
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido16");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  const correctAnswers = {
    q1: "funcionesMensajeria",
    q2: "pasoDescarga",
    q3: "verificacionSMS",
    q4: "comunicacionChat",
    q5: "usoGrupos",
    q6: "estados24h",
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

  // ⏱️ Timer de 2 minutos solo si gated = true
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

  // 📜 detectar scroll al final solo si gated = true
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
          <h1>Registro y configuración inicial de WhatsApp</h1>
        </div>
      </header>

      <main className="content-grid">
        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">2</span>
              Configuración inicial
            </h2>
          </header>
          <div className="card-body">
            <p>
              El <strong>registro y la configuración inicial de WhatsApp</strong>{" "}
              es el proceso mediante el cual el usuario crea y prepara su cuenta
              para comenzar a comunicarse desde su teléfono. Todo inicia al{" "}
              <strong>descargar la aplicación</strong> y registrar un{" "}
              <strong>número de teléfono</strong>.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">2.1</span>
              Registro y configuración inicial
            </h2>
          </header>

          <div className="card-body">
            <p className="pasos-intro">
              Sigue cada paso con calma: primero lees el texto y luego miras la
              imagen de ejemplo.
            </p>

            <ul className="lista-pasos-img">
              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 1:</strong>
                </p>
                <p className="paso-texto">
                  Abre la tienda de aplicaciones de tu teléfono. En Android abre{" "}
                  <strong>Play Store</strong> y en iPhone{" "}
                  <strong>App Store</strong>. Escribe{" "}
                  <strong>"WhatsApp"</strong> en el buscador y verifica que el
                  desarrollador sea <strong>WhatsApp LLC</strong>.
                </p>

                <figure className="paso-figure">
                  <img
                    src={whatsappRegistroPaso1}
                    alt="Búsqueda de WhatsApp en la tienda de aplicaciones"
                    className="paso-img"
                  />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 2:</strong>
                </p>
                <p className="paso-texto">
                  Pulsa en <strong>Instalar</strong> o{" "}
                  <strong>Obtener</strong> y espera a que finalice la descarga.
                  Después, toca en <strong>Abrir</strong> para iniciar la
                  aplicación y acepta los{" "}
                  <strong>Términos y condiciones</strong>.
                </p>

                <figure className="paso-figure">
                  <img
                    src={whatsappRegistroPaso2}
                    alt="Pantalla de instalación de WhatsApp"
                    className="paso-img"
                  />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 3:</strong>
                </p>
                <p className="paso-texto">
                  Selecciona tu país, escribe tu{" "}
                  <strong>número de teléfono</strong> completo y confirma que
                  sea correcto. WhatsApp enviará un{" "}
                  <strong>SMS con un código</strong> de verificación.
                </p>

                <figure className="paso-figure">
                  <img
                    src={whatsappRegistroPaso4}
                    alt="Pantalla donde se escribe el número de teléfono"
                    className="paso-img"
                  />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 4:</strong>
                </p>
                <p className="paso-texto">
                  Ingresa el <strong>código de 6 dígitos</strong> que llega por
                  SMS. En muchos casos la app lo detecta automáticamente. Al
                  validar el código, la cuenta queda asociada a tu número.
                </p>

                <figure className="paso-figure">
                  <img
                    src={whatsappRegistroPaso3}
                    alt="Pantalla donde se escribe el código SMS"
                    className="paso-img"
                  />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 5:</strong>
                </p>
                <p className="paso-texto">
                  Escribe tu <strong>nombre</strong> o apodo y agrega una{" "}
                  <strong>foto de perfil</strong>. Si lo deseas, escribe una
                  frase breve en la sección <strong>Información</strong>.
                </p>

                <figure className="paso-figure">
                  <img
                    src={whatsappRegistroPaso5}
                    alt="Pantalla donde se configura el perfil"
                    className="paso-img"
                  />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 6:</strong>
                </p>
                <p className="paso-texto">
                  Entra a <strong>Ajustes &gt; Cuenta &gt; Privacidad</strong> y{" "}
                  <strong>Ajustes &gt; Notificaciones</strong> para decidir quién
                  ve tu información y cómo quieres recibir avisos de mensajes.
                </p>

                <figure className="paso-figure">
                  <img
                    src={whatsappRegistroPaso6}
                    alt="Pantalla de ajustes de privacidad y notificaciones"
                    className="paso-img"
                  />
                </figure>
              </li>
            </ul>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">2.2</span>
              Comunicación básica
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  La comunicación básica en WhatsApp se realiza mediante{" "}
                  <strong>chats individuales</strong>, donde se intercambian
                  mensajes y archivos en tiempo real.
                </p>
                <ul className="lista-simple">
                  <li>
                    Permite enviar <strong>mensajes de texto</strong> a
                    cualquier contacto que tenga WhatsApp.
                  </li>
                  <li>
                    Se pueden utilizar <strong>emojis</strong>,{" "}
                    <strong>stickers</strong> y <strong>GIFs</strong> para
                    expresar emociones.
                  </li>
                  <li>
                    Permite compartir{" "}
                    <strong>
                      fotos, notas de voz, videos, documentos, contactos y
                      ubicación
                    </strong>
                    .
                  </li>
                  <li>
                    Usa un sistema de <strong>palomitas</strong> para mostrar el
                    estado del mensaje (enviado, entregado y leído).
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={whatsappComunicacionImg}
                  alt="Ejemplo de chat individual en WhatsApp"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">2.3</span>
              Llamadas, grupos y estados
            </h2>
          </header>
          <div className="card-body">
            <div className="three-col-img">
              <figure className="media-side">
                <img
                  src={whatsappLlamadasImg}
                  alt="Pantalla de llamadas y videollamadas en WhatsApp"
                  className="side-image"
                />
                <figcaption className="caption">
                  Llamadas y videollamadas usando internet.
                </figcaption>
              </figure>

              <figure className="media-side">
                <img
                  src={whatsappGruposImg}
                  alt="Ejemplo de chats grupales"
                  className="side-image"
                />
                <figcaption className="caption">
                  Chats grupales para coordinar actividades.
                </figcaption>
              </figure>

              <figure className="media-side">
                <img
                  src={whatsappEstadosImg}
                  alt="Ejemplo de estados de WhatsApp"
                  className="side-image"
                />
                <figcaption className="caption">
                  Estados que se muestran durante 24 horas.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>
      </main>

      <section className="video-section">
        <h2 className="section-title inline">
          <span className="section-number">2.4</span>
          Cómo comenzar a usar WhatsApp Messenger
        </h2>
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/n5zJ-ZWxbK4"
            title="Cómo comenzar a usar WhatsApp Messenger"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">2.5</span>
          Actividad práctica del tema
        </h2>
        <ol>
          <li>
            Escribe <strong>dos ejemplos</strong> de situaciones en las que
            usarías un <strong>chat individual</strong> de WhatsApp de manera
            responsable.
          </li>
          <li>
            Comenta tus respuestas con tu docente o compañeros y agreguen{" "}
            <strong>buenas prácticas</strong> para usar WhatsApp de forma segura
            y respetuosa.
          </li>
        </ol>
        <p className="hint">
          Recuerda: no todo lo que llega por mensaje es verdadero. Verifica la
          información antes de compartirla.
        </p>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">2.6</span>
          Quiz: Comprueba lo aprendido
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              1) ¿Cuál opción describe mejor las funciones principales de
              WhatsApp?
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="soloFotos">
                  Una aplicación solo para publicar fotos y historias.
                </option>
                <option value="funcionesMensajeria">
                  Una aplicación de mensajería para enviar textos, archivos y
                  hacer llamadas y videollamadas usando internet.
                </option>
                <option value="editorTextos">
                  Un programa para escribir documentos como si fuera un editor
                  de texto.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto: WhatsApp es una app de mensajería que también permite enviar archivos y hacer llamadas usando internet."
                  : "❗ Revisa: WhatsApp no es un editor de textos ni solo una app de fotos."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              2) ¿Cuál es el <strong>primer paso</strong> para registrarte en
              WhatsApp?
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="crearCorreo">
                  Crear una cuenta de correo electrónico nueva.
                </option>
                <option value="pasoDescarga">
                  Descargar la aplicación desde la tienda (Play Store o App
                  Store).
                </option>
                <option value="comprarSaldo">
                  Comprar saldo de llamadas telefónicas.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto: primero debes descargar la aplicación desde la tienda oficial."
                  : "❗ Recuerda que el registro inicia descargando la app desde la tienda, no con correo ni saldo."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              3) ¿Qué necesitas para <strong>verificar tu número</strong> en
              WhatsApp?
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="verificacionSMS">
                  Un SMS con un código que se introduce en la aplicación.
                </option>
                <option value="llamadaOperador">
                  Una llamada del operador de telefonía pidiendo tu CURP.
                </option>
                <option value="correoSoporte">
                  Un correo electrónico del soporte de WhatsApp.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto: WhatsApp envía un SMS con un código de verificación."
                  : "❗ Piensa: la verificación se hace con un código que llega por SMS, no por correo ni por una llamada del operador."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              4) ¿Qué acción corresponde a la{" "}
              <strong>comunicación básica</strong> dentro de un chat?
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="publicarEstado">
                  Publicar un estado visible 24 horas.
                </option>
                <option value="comunicacionChat">
                  Enviar mensajes de texto, emojis y notas de voz a un contacto.
                </option>
                <option value="crearEnlaceGrupo">
                  Crear un enlace de invitación para un grupo nuevo.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto: la comunicación básica se da en los chats individuales con mensajes, emojis y notas de voz."
                  : "❗ Publicar estados o crear enlaces de grupo también son funciones de WhatsApp, pero no son la comunicación básica del chat."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              5) ¿Para qué sirven principalmente los{" "}
              <strong>chats grupales</strong>?
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="editarFotos">
                  Editar fotografías con filtros y efectos.
                </option>
                <option value="usoGrupos">
                  Coordinar actividades y comunicarse varias personas en un
                  mismo espacio de conversación.
                </option>
                <option value="guardarContactos">
                  Guardar contactos nuevos automáticamente en la agenda.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto: los grupos sirven para que varias personas se organicen y se comuniquen al mismo tiempo."
                  : "❗ Los grupos no son para editar fotos ni para guardar contactos, sino para conversar entre varias personas."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              6) ¿Qué describe mejor los <strong>estados de WhatsApp</strong>?
              <select name="q6" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="mensajesPrivados">
                  Mensajes privados que solo puedes ver tú mismo.
                </option>
                <option value="estados24h">
                  Publicaciones de foto, texto o video que tus contactos ven
                  durante 24 horas.
                </option>
                <option value="listaContactos">
                  Una lista donde se guardan todos tus contactos nuevos.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto: los estados son publicaciones que duran 24 horas visibles para tus contactos."
                  : "❗ Los estados no son mensajes privados ni listas de contactos; son publicaciones temporales de 24 horas."}
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