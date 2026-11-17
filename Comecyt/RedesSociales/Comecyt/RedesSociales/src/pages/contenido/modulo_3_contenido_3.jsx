// src/pages/contenido/modulo_1_contenido_17.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "@/Css/modulo_3_contenido_3.css";

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
const NUM_CONTENIDO = 3;
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
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido17");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  const correctAnswers = {
    q1: "internet",
    q2: "verYescuchar",
    q3: "coordinar",
    q4: "admins",
    q5: "temporales",
    q6: "verificarYrespetar",
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
    navigate("/modulo/3/contenido/16"); // ✅ Va al contenido 16 del módulo 3
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
          <h1>Llamadas, videollamadas y estados de WhatsApp</h1>
          <p className="sub">
            Aprende cómo usar las llamadas, videollamadas, chats grupales y
            estados de WhatsApp en tu día a día.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">3.1</span>
              Funciones principales de WhatsApp
            </h2>
          </header>
          <div className="card-body">
            <p>
              <strong>WhatsApp</strong> es una aplicación de mensajería
              instantánea que permite comunicarse usando{" "}
              <strong>internet</strong> en lugar de SMS tradicionales. Con ella
              puedes enviar mensajes de texto, notas de voz, fotos, videos,
              documentos y también realizar{" "}
              <strong>llamadas y videollamadas</strong>.
            </p>
            <p>
              Además, ofrece <strong>chats grupales</strong> para hablar con
              varias personas al mismo tiempo y <strong>estados</strong> para
              compartir contenido que dura 24 horas. Gracias a estas funciones,
              se utiliza a nivel personal, escolar y laboral, porque es rápida,
              sencilla y solo requiere conexión a datos o Wi-Fi.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">3.2</span>
              Llamadas y videollamadas
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  WhatsApp permite realizar <strong>llamadas de voz</strong> y{" "}
                  <strong>videollamadas</strong> utilizando la conexión a
                  internet, sin gastar saldo de llamadas tradicionales.
                </p>
                <ul className="lista-simple">
                  <li>
                    Desde un chat puedes tocar el ícono de{" "}
                    <strong>teléfono</strong> para una llamada de voz, o de{" "}
                    <strong>cámara</strong> para una videollamada.
                  </li>
                  <li>
                    También puedes usar la pestaña{" "}
                    <strong>"Llamadas"</strong> para ver el historial y volver a
                    comunicarte.
                  </li>
                  <li>
                    Es importante tener una buena conexión a{" "}
                    <strong>Wi-Fi</strong> o <strong>datos móviles</strong> para
                    que el audio y el video se vean y escuchen bien.
                  </li>
                  <li>
                    Es útil para resolver <strong>dudas escolares</strong>,
                    coordinar <strong>reuniones cortas</strong> o hablar con
                    familiares que viven lejos.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={whatsappLlamadasImg}
                  alt="Pantalla de llamada o videollamada en WhatsApp"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">3.3</span>
              Chats grupales
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Los <strong>chats grupales</strong> permiten que varias
                  personas se comuniquen en una sola conversación. Son muy
                  utilizados para coordinar tareas, proyectos y avisos.
                </p>
                <ul className="lista-simple">
                  <li>
                    Un usuario crea el grupo, elige un <strong>nombre</strong>,
                    una <strong>foto</strong> y agrega a los participantes.
                  </li>
                  <li>
                    El creador se vuelve <strong>administrador</strong> y puede
                    añadir o eliminar miembros, así como asignar otros
                    administradores.
                  </li>
                  <li>
                    Se comparten mensajes, archivos, notas de voz y enlaces que{" "}
                    <strong>todos los integrantes</strong> pueden ver.
                  </li>
                  <li>
                    Es recomendable establecer{" "}
                    <strong>normas de respeto</strong> y evitar difundir
                    información falsa o contenido ofensivo.
                  </li>
                  <li>
                    Si hay muchos mensajes, es posible{" "}
                    <strong>silenciar el grupo</strong> sin salir de él.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={whatsappGruposImg}
                  alt="Ejemplo de chat grupal en WhatsApp"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">3.4</span>
              Estados de WhatsApp
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Los <strong>estados de WhatsApp</strong> son publicaciones
                  temporales que duran <strong>24 horas</strong> y permiten
                  compartir fotos, videos o textos con los contactos.
                </p>
                <ul className="lista-simple">
                  <li>
                    Se accede a ellos desde la pestaña{" "}
                    <strong>"Estados"</strong>.
                  </li>
                  <li>
                    Puedes publicar <strong>fotos</strong>,{" "}
                    <strong>videos cortos</strong> o{" "}
                    <strong>mensajes de texto</strong> con fondos de colores,
                    emojis y stickers.
                  </li>
                  <li>
                    En la configuración de privacidad se elige quién puede ver
                    los estados: <strong>todos tus contactos</strong>,{" "}
                    <strong>solo algunos</strong> o todos excepto ciertas
                    personas.
                  </li>
                  <li>
                    Son útiles para compartir <strong>avisos</strong>,{" "}
                    <strong>recordatorios</strong>, logros o información
                    importante sin enviar mensajes uno por uno.
                  </li>
                </ul>
              </div>

              <figure className="media-side">
                <img
                  src={whatsappEstadosImg}
                  alt="Ejemplo de estados de WhatsApp"
                  className="side-image"
                />
              </figure>
            </div>
          </div>
        </article>
      </main>

      <section className="video-section">
        <h2 className="section-title inline">
          <span className="section-number">3.5</span>
          Video: Llamadas, grupos y estados en WhatsApp
        </h2>
        <p className="video-hint">
          Mira el siguiente video para reforzar cómo funcionan las llamadas,
          videollamadas, chats grupales y estados en WhatsApp.
        </p>
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/gA_zoJI0j3w"
            title="Llamadas, grupos y estados en WhatsApp"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">3.6</span>
          Actividad práctica
        </h2>

        <ol>
          <li>
            <strong>Llamadas y videollamadas:</strong>
            <ul className="lista-simple">
              <li>
                Escribe un ejemplo de situación en la que usarías una{" "}
                <strong>llamada de voz</strong> en WhatsApp.
              </li>
              <li>
                Escribe otra situación en la que sería mejor usar una{" "}
                <strong>videollamada</strong>.
              </li>
            </ul>
          </li>

          <li>
            <strong>Chats grupales:</strong>
            <ul className="lista-simple">
              <li>
                Imagina que vas a crear un grupo para tu{" "}
                <strong>salón de clases, trabajo o comunidad</strong>.
              </li>
              <li>
                Anota <strong>tres reglas de convivencia</strong> que ayudarían
                a mantener el grupo ordenado y respetuoso.
              </li>
            </ul>
          </li>
        </ol>

        <p className="hint">
          Procura pensar en ejemplos reales de tu escuela, comunidad o familia.
          Eso te ayudará a aplicar mejor lo aprendido.
        </p>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">3.7</span>
          Quiz: Llamadas, grupos y estados en WhatsApp
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              <span className="question-text">
                1) ¿Qué necesitas para hacer una llamada o videollamada por
                WhatsApp?
              </span>
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="saldo">
                  Tener saldo de llamadas tradicionales.
                </option>
                <option value="internet">
                  Tener conexión a internet (Wi-Fi o datos móviles).
                </option>
                <option value="correo">
                  Tener una cuenta de correo electrónico.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto: las llamadas y videollamadas de WhatsApp funcionan usando internet."
                  : "❗ Recuerda que WhatsApp usa conexión a internet, no saldo de llamadas ni correo electrónico."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              <span className="question-text">
                2) ¿Qué diferencia principal tiene la videollamada respecto a la
                llamada de voz?
              </span>
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="soloTexto">
                  En la videollamada solo se envían mensajes de texto.
                </option>
                <option value="soloAudio">
                  En la videollamada se escucha a la otra persona, pero no se le
                  ve.
                </option>
                <option value="verYescuchar">
                  En la videollamada se puede ver y escuchar a la otra persona
                  en la pantalla.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto: en la videollamada puedes ver y escuchar a la otra persona."
                  : "❗ Piensa en que la videollamada agrega la imagen de la persona, no solo el audio."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              <span className="question-text">
                3) ¿Para qué sirven principalmente los chats grupales?
              </span>
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="videojuegos">
                  Para jugar videojuegos en línea.
                </option>
                <option value="coordinar">
                  Para coordinar actividades y comunicarse varias personas en
                  una sola conversación.
                </option>
                <option value="guardarContactos">
                  Para guardar contactos automáticamente en el teléfono.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto: los grupos permiten organizar y comunicar a varias personas al mismo tiempo."
                  : "❗ Los grupos no son para juegos ni para guardar contactos, se usan para conversar y coordinar actividades."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              <span className="question-text">
                4) ¿Quién puede agregar o quitar participantes de un grupo de
                WhatsApp?
              </span>
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="todos">
                  Cualquier participante del grupo.
                </option>
                <option value="admins">
                  Solo el administrador o los administradores del grupo.
                </option>
                <option value="nadie">
                  Nadie, los grupos no se pueden modificar.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto: solo los administradores pueden gestionar a los participantes."
                  : "❗ Revisa: los cambios de participantes los hacen los administradores, no cualquier miembro."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              <span className="question-text">
                5) ¿Qué caracteriza a los estados de WhatsApp?
              </span>
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="permanentes">
                  Son mensajes que se quedan guardados para siempre en el
                  perfil.
                </option>
                <option value="temporales">
                  Son publicaciones que desaparecen automáticamente después de
                  24 horas.
                </option>
                <option value="soloPC">
                  Solo se pueden ver desde una computadora.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto: los estados son temporales y se eliminan después de 24 horas."
                  : "❗ Recuerda que los estados no son permanentes ni exclusivos de la computadora."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              <span className="question-text">
                6) ¿Qué es una buena práctica al usar estados y chats grupales?
              </span>
              <select name="q6" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="datosSensibles">
                  Compartir información personal sensible para que todos la
                  vean.
                </option>
                <option value="verificarYrespetar">
                  Verificar la información antes de compartirla y respetar la
                  privacidad de otras personas.
                </option>
                <option value="molestar">
                  Enviar mensajes a cualquier hora, aunque molesten a los demás.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto: siempre es importante verificar la información y cuidar la privacidad."
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
                ? "¡Excelente! Manejas muy bien las llamadas, los grupos y los estados de WhatsApp. 🎉"
                : "Buen intento. Revisa las secciones donde tuviste dudas y vuelve a intentar el quiz."}
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