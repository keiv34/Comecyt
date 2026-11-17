// src/pages/contenido/modulo_1_contenido_18.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "@/Css/modulo_3_contenido_4.css";

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
const NUM_CONTENIDO = 4;
const TOTAL_PREGUNTAS = 6;

export default function ContenidoWhatsappSeguridad() {
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
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido18");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  const correctAnswers = {
    q1: "copiaNube",
    q2: "wifiSinVideos",
    q3: "cifradoExtremo",
    q4: "bloquearContacto",
    q5: "motivoReporte",
    q6: "buenaPracticaSeguridad",
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
      score >= 5 ? "success" : "info"
    );
  };

  // 🔙 Anterior
  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/modulo/3/contenido/17"); // ✅ Va al contenido 17 del módulo 3
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
          <h1>Seguridad y configuración avanzada en WhatsApp</h1>
          <p className="sub">
            Aprende a cuidar tus conversaciones usando copias de seguridad, cifrado
            de extremo a extremo y bloqueo de contactos.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">4</span>
              Seguridad y configuración avanzada
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Además de enviar mensajes y hacer llamadas, WhatsApp incluye varias
                  opciones para cuidar tu <strong>privacidad</strong> y proteger tu{" "}
                  <strong>información personal</strong>. Conocer estas herramientas te
                  ayuda a usar la aplicación de forma más segura y responsable.
                </p>
                <p>
                  En este tema revisaremos tres funciones importantes:
                  <strong> copias de seguridad</strong>,{" "}
                  <strong>cifrado de extremo a extremo</strong> y{" "}
                  <strong>bloqueo y reporte de contactos</strong>. Todas ellas son clave
                  para evitar la pérdida de información y para protegerte de personas
                  desconocidas o mensajes peligrosos.
                </p>
              </div>

              <figure className="media-side">
                <img
                  src={whatsappSeguridadIntroImg}
                  alt="Ilustración general de seguridad en WhatsApp"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">4.1</span>
              Copias de seguridad
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Las <strong>copias de seguridad</strong> sirven para guardar tus{" "}
                  <strong>chats, fotos, videos y notas de voz</strong> y no
                  perderlos si cambias de teléfono, desinstalas la aplicación o tu
                  dispositivo se descompone.
                </p>
                <ul className="lista-simple">
                  <li>
                    WhatsApp puede guardar tus conversaciones en la{" "}
                    <strong>nube</strong> (Google Drive o iCloud, según el
                    dispositivo).
                  </li>
                  <li>
                    Puedes elegir la frecuencia: <strong>diaria</strong>,{" "}
                    <strong>semanal</strong>, <strong>mensual</strong> o solo cuando
                    tú lo hagas de forma manual.
                  </li>
                  <li>
                    También puedes decidir si quieres incluir <strong>videos</strong>{" "}
                    o solo <strong>mensajes</strong>, para ahorrar espacio y datos.
                  </li>
                  <li>
                    Al instalar WhatsApp en un nuevo teléfono, puedes{" "}
                    <strong>restaurar</strong> la copia para recuperar tus chats.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={whatsappBackupImg}
                  alt="Pantalla de copias de seguridad en WhatsApp"
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
              Cifrado de extremo a extremo
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  El <strong>cifrado de extremo a extremo</strong> protege el
                  contenido de tus mensajes y llamadas. Significa que lo que envías
                  se “codifica” y{" "}
                  <strong>
                    solo tu dispositivo y el de la otra persona pueden leerlo o
                    escucharlo
                  </strong>
                  .
                </p>
                <ul className="lista-simple">
                  <li>
                    Se aplica a <strong>mensajes, fotos, videos, notas de voz y
                      llamadas</strong>.
                  </li>
                  <li>
                    Ni WhatsApp ni otras personas intermedias pueden ver el
                    contenido mientras viaja por internet.
                  </li>
                  <li>
                    En muchos chats aparece un mensaje que indica que están{" "}
                    <strong>cifrados de extremo a extremo</strong>.
                  </li>
                  <li>
                    Aun así, alguien puede ver tus mensajes si tiene tu{" "}
                    <strong>teléfono desbloqueado</strong>, por eso es importante
                    cuidar la contraseña o PIN de tu dispositivo.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={whatsappEncryptionImg}
                  alt="Aviso de cifrado de extremo a extremo en un chat"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">4.3</span>
              Bloqueo de contactos y reportes
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  El <strong>bloqueo</strong> y los <strong>reportes</strong> te
                  ayudan a protegerte de personas que molestan, envían spam o mensajes
                  peligrosos.
                </p>
                <h3>Bloqueo de contactos</h3>
                <ul className="lista-simple">
                  <li>
                    Si bloqueas a alguien, esa persona ya <strong>no puede</strong>{" "}
                    enviarte mensajes, llamarte ni ver tu última conexión, tu foto de
                    perfil o tus estados (según tu configuración).
                  </li>
                  <li>
                    La persona bloqueada <strong>no recibe un aviso</strong>, solo
                    verá que sus mensajes no se entregan.
                  </li>
                </ul>
                <h3>Reportes</h3>
                <ul className="lista-simple">
                  <li>
                    Sirven para avisar a WhatsApp de números que envían{" "}
                    <strong>fraudes, engaños, amenazas o contenido ofensivo</strong>.
                  </li>
                  <li>
                    Al reportar, WhatsApp puede revisar parte reciente de la
                    conversación para ver si se rompen sus normas.
                  </li>
                  <li>
                    Es recomendable reportar si piden <strong>datos personales</strong>{" "}
                    (cuentas bancarias, códigos, contraseñas) o hacen ofertas
                    “demasiado buenas para ser verdad”.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={whatsappBlockImg}
                  alt="Opciones de bloqueo y reporte de contactos en WhatsApp"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>
      </main>

      <section className="video-section">
        <h2 className="section-title inline">
          <span className="section-number">4.4</span>
          Video: Seguridad y configuración avanzada en WhatsApp
        </h2>
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/qio3yImjSEA"
            title="Seguridad y configuración avanzada en WhatsApp"
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
            En tu propio teléfono (o en uno de ejemplo), entra a la sección de{" "}
            <strong>copias de seguridad</strong> de WhatsApp y escribe:
            <ul className="lista-simple">
              <li>
                Cada cuánto tiempo te gustaría que se hiciera la copia (diaria,
                semanal, mensual).
              </li>
              <li>
                Si activarías la opción de hacer copias solo con{" "}
                <strong>Wi-Fi</strong> y sin videos, y por qué.
              </li>
            </ul>
          </li>
          <li>
            Explica con tus palabras qué significa el{" "}
            <strong>cifrado de extremo a extremo</strong> y por qué es importante
            para tu privacidad.
          </li>
          <li>
            Escribe dos ejemplos de situaciones en las que usarías el{" "}
            <strong>bloqueo</strong> y el <strong>reporte</strong> de un contacto
            para protegerte.
          </li>
        </ol>

        <p className="hint">
          Recuerda: si algo te parece extraño, agresivo o demasiado bueno para ser
          verdad, es mejor desconfiar y pedir apoyo antes de responder.
        </p>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">4.6</span>
          Quiz: Seguridad y configuración avanzada
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              <span className="question-text">
                1) ¿Para qué sirve principalmente una{" "}
                <strong>copia de seguridad</strong> en WhatsApp?
              </span>
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="cambiarColor">
                  Para cambiar el color de fondo de los chats.
                </option>
                <option value="copiaNube">
                  Para guardar tus chats y archivos en la nube y poder
                  recuperarlos si cambias de teléfono.
                </option>
                <option value="borrarMensajes">
                  Para borrar todos tus mensajes automáticamente.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto: la copia de seguridad guarda tus conversaciones para poder restaurarlas después."
                  : "❗ Revisa: la copia de seguridad no es para cambiar colores ni borrar todo, sino para guardar tus chats."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              <span className="question-text">
                2) ¿Qué configuración ayuda a{" "}
                <strong>no gastar tantos datos móviles</strong> al hacer copias?
              </span>
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="siempreDatos">
                  Hacer copias solo con datos móviles e incluir todos los videos.
                </option>
                <option value="wifiSinVideos">
                  Hacer copias solo con Wi-Fi y, si es posible, sin incluir videos.
                </option>
                <option value="nuncaCopias">
                  Nunca hacer copias de seguridad.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto: usar solo Wi-Fi y evitar los videos reduce el consumo de datos."
                  : "❗ Piensa: si usas datos móviles y muchos videos, gastarás más megas."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              <span className="question-text">
                3) ¿Qué describe mejor el{" "}
                <strong>cifrado de extremo a extremo</strong>?
              </span>
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="cifradoExtremo">
                  Los mensajes se codifican y solo el dispositivo que envía y el
                  que recibe pueden leerlos.
                </option>
                <option value="soloWhatsAppLee">
                  Solo WhatsApp puede leer todos los mensajes para revisarlos.
                </option>
                <option value="soloWifi">
                  Solo funciona cuando estás conectado a Wi-Fi.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto: el cifrado protege el contenido para que solo los participantes del chat lo vean."
                  : "❗ Recuerda: el cifrado no es para que WhatsApp lea tus mensajes, sino para que otros no puedan hacerlo."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              <span className="question-text">
                4) ¿Qué sucede cuando <strong>bloqueas</strong> a un contacto en
                WhatsApp?
              </span>
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="nadaPasa">
                  Nada cambia, solo se borra la foto de perfil.
                </option>
                <option value="bloquearContacto">
                  Esa persona ya no puede enviarte mensajes, llamarte ni ver
                  cierta información de tu perfil.
                </option>
                <option value="borrarCuenta">
                  Se borra por completo tu cuenta de WhatsApp.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto: el bloqueo corta el contacto desde ese número."
                  : "❗ El bloqueo no borra tu cuenta, solo impide que ese número se comunique contigo."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              <span className="question-text">
                5) ¿Cuándo es recomendable <strong>reportar</strong> un número?
              </span>
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="mensajeNormal">
                  Cuando un amigo te manda un saludo normal.
                </option>
                <option value="motivoReporte">
                  Cuando envían mensajes de engaño, insultos, amenazas o piden
                  datos personales.
                </option>
                <option value="fotoPerfilFea">
                  Cuando no te gusta la foto de perfil de esa persona.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto: los reportes se usan ante conductas peligrosas o faltas de respeto."
                  : "❗ No se debe reportar por cualquier cosa; se usa para casos de riesgo, fraude o falta de respeto."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              <span className="question-text">
                6) ¿Cuál es una <strong>buena práctica</strong> para mantener tu
                seguridad en WhatsApp?
              </span>
              <select name="q6" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="compartirCodigos">
                  Compartir los códigos que te llegan por SMS si alguien te los
                  pide por WhatsApp.
                </option>
                <option value="buenaPracticaSeguridad">
                  No compartir datos personales ni códigos, y revisar la
                  información antes de reenviarla.
                </option>
                <option value="dejarCelular">
                  Dejar el celular desbloqueado en cualquier lugar para que todos
                  lo usen.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto: cuidar tus datos y tus códigos es clave para no ser víctima de fraudes."
                  : "❗ Nunca compartas códigos ni dejes tu teléfono desbloqueado al alcance de cualquiera."}
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
                ? "¡Excelente! Manejas muy bien las opciones de seguridad de WhatsApp. 🎉"
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