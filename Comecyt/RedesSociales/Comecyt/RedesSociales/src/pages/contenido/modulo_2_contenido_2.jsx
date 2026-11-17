// src/pages/contenido/modulo_1_contenido_10.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_2_contenido_2.css";

import conexionImg from "../../assets/conexion.png";
import publicacionesImg from "../../assets/publicaciones.png";
import messengerImg from "../../assets/messenger.png";
import paso1FbImg from "../../assets/Paso1_fb.png";
import paso2FbImg from "../../assets/Paso2_fb.png";
import paso3FbImg from "../../assets/Paso3_fb.png";
import paso4FbImg from "../../assets/Paso4_fb.png";
import paso5FbImg from "../../assets/Paso5_fb.png";
import paso6FbImg from "../../assets/Paso6_fb.png";
import paso7FbImg from "../../assets/Paso7_fb.png";
import paso8FbImg from "../../assets/Paso8_fb.png";

const API_URL = "http://localhost:4000";
const MODULO_ID = 2;
const NUM_CONTENIDO = 2;

export default function ContenidoFacebookFunciones() {
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
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido10");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  const correctAnswers = {
    q1: "perfilIdentidad",
    q2: "privacidadControl",
    q3: "solicitudAmistad",
    q4: "reaccionesEmociones",
    q5: "messengerPrivado",
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
      score >= 3 ? "success" : "info"
    );
  };

  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/modulo/2/contenido/9");
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  if (!progresoCargado) {
    return (
      <div className="fbfunc-container">
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
    <div className="fbfunc-container">
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="fbfunc-header">
        <div className="fb-header-inner">
          <div>
            <h1>Funciones principales de Facebook</h1>
            <p className="sub">
              Perfil, conexiones, publicaciones e interacción con otras personas
            </p>
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
              <span className="section-number">2.1</span>
              Creación y gestión de perfil
            </h3>
          </header>
          <div className="card-body">
            <div>
              <h4>¿Qué es el perfil?</h4>
              <p>
                El <strong>perfil</strong> es tu identidad dentro de Facebook.
                Muestra quién eres y permite que otras personas te reconozcan,
                conecten contigo y vean tu contenido, según la privacidad que
                configures.
              </p>

              <h4>Elementos principales del perfil</h4>
              <ul className="lista-centrada">
                <li>
                  <strong>Foto de perfil:</strong> Imagen pequeña que te
                  representa y aparece en tus publicaciones y comentarios.
                </li>
                <li>
                  <strong>Foto de portada:</strong> Imagen grande en la parte
                  superior de tu perfil que muestra tus gustos o intereses.
                </li>
                <li>
                  <strong>Información personal:</strong> Ciudad, escuela,
                  trabajo, intereses, entre otros.
                </li>
                <li>
                  <strong>Biografía:</strong> Pequeño texto donde te presentas
                  con tus propias palabras.
                </li>
                <li>
                  <strong>Privacidad:</strong> Tú decides quién puede ver tu
                  información: público, amigos o solo tú.
                </li>
              </ul>
              <p className="hint">
                Recuerda: No es obligatorio mostrar toda tu información. Solo
                comparte lo que te haga sentir seguro y cómodo.
              </p>
            </div>
          </div>
        </article>

        <article className="card card-steps">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">2.2</span>
              Pasos para crear tu perfil en Facebook
            </h3>
            <p className="card-sub">
              Sigue cada paso con calma: primero lees el texto y luego miras la
              imagen de ejemplo.
            </p>
          </header>

          <div className="card-body steps-body">
            <section className="step-block">
              <h4 className="step-title">Paso 1:</h4>
              <p>
                Entra a <strong>www.facebook.com</strong> y haz clic en{" "}
                <strong>"Crear cuenta nueva"</strong>.
              </p>
              <figure className="step-figure">
                <img src={paso1FbImg} className="step-image" alt="Facebook inicio" />
                <img src={paso2FbImg} className="step-image" alt="Botón crear cuenta" />
              </figure>
            </section>

            <section className="step-block">
              <h4 className="step-title">Paso 2:</h4>
              <p>
                Escribe tu <strong>nombre y apellidos</strong>, correo o
                teléfono, <strong>fecha de nacimiento, género</strong> y una{" "}
                <strong>contraseña segura</strong>.
              </p>
              <figure className="step-figure">
                <img src={paso3FbImg} className="step-image" alt="Formulario de datos" />
              </figure>
            </section>

            <section className="step-block">
              <h4 className="step-title">Paso 3:</h4>
              <p>
                Haz clic en <strong>"Registrarte"</strong> y escribe el{" "}
                <strong>código de verificación</strong> que te llegará por SMS o
                correo.
              </p>
              <figure className="step-figure">
                <img src={paso4FbImg} className="step-image" alt="Verificación de cuenta" />
              </figure>
            </section>

            <section className="step-block">
              <h4 className="step-title">Paso 4:</h4>
              <p>
                Agrega una <strong>foto de perfil</strong> clara donde se vea tu
                rostro.
              </p>
              <figure className="step-figure">
                <img src={paso5FbImg} className="step-image" alt="Subir foto de perfil" />
              </figure>
            </section>

            <section className="step-block">
              <h4 className="step-title">Paso 5:</h4>
              <p>
                Elige una <strong>foto de portada</strong> que represente tus
                gustos o intereses.
              </p>
              <figure className="step-figure">
                <img src={paso6FbImg} className="step-image" alt="Elegir foto de portada" />
              </figure>
            </section>

            <section className="step-block">
              <h4 className="step-title">Paso 6:</h4>
              <p>
                Completa tus <strong>datos básicos</strong> (ciudad, escuela,
                trabajo, biografía) en la sección de información del perfil.
              </p>
              <figure className="step-figure">
                <img src={paso7FbImg} className="step-image" alt="Datos básicos del perfil" />
              </figure>
            </section>

            <section className="step-block">
              <h4 className="step-title">Paso 7:</h4>
              <p>
                Entra a las <strong>Configuraciones de privacidad</strong> y
                decide quién puede ver tus publicaciones y tu información
                (público, amigos o solo tú).
              </p>
              <figure className="step-figure">
                <img src={paso8FbImg} className="step-image" alt="Configuración de privacidad" />
              </figure>
            </section>

            <section className="step-block">
              <p className="hint">
                Recuerda: <strong>No es obligatorio</strong> mostrar toda tu
                información. Solo comparte lo que te haga sentir seguro y cómodo.
              </p>
            </section>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">2.3</span>
              Conexión con otros usuarios
            </h3>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Facebook está diseñado para{" "}
                  <strong>conectar con otras personas</strong>: familia,
                  amigos, compañeros, e incluso con personas de otros lugares.
                </p>

                <h4>Formas de conectar</h4>
                <ul className="lista-centrada">
                  <li>
                    <strong>Solicitudes de amistad:</strong> Envías una
                    invitación y la otra persona decide si la acepta. Si la
                    acepta, ambos serán amigos en Facebook.
                  </li>
                  <li>
                    <strong>Seguidores y seguidos:</strong> Puedes seguir a
                    personas o páginas para ver su contenido público.
                  </li>
                  <li>
                    <strong>Búsqueda de contactos:</strong> Desde la barra de
                    búsqueda, puedes escribir el <strong>nombre</strong> de
                    alguien para intentar encontrarlo.
                  </li>
                </ul>
              </div>
              <figure className="media media-side">
                <img
                  src={conexionImg}
                  className="side-image"
                  alt="Conexiones en Facebook"
                />
              </figure>
            </div>
            <p className="hint">
              Antes de aceptar a alguien, piensa si realmente lo conoces. Evita
              agregar a desconocidos.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">2.4</span>
              Publicaciones e Interacciones
            </h3>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  En Facebook puedes <strong>compartir lo que piensas</strong>,
                  lo que haces o lo que te interesa, a través de diferentes
                  tipos de publicaciones.
                </p>

                <h4>Tipos de publicaciones</h4>
                <ul className="lista-centrada">
                  <li>
                    <strong>Estado:</strong> texto corto para compartir una
                    idea, aviso o reflexión.
                  </li>
                  <li>
                    <strong>Fotos y videos:</strong> momentos importantes,
                    actividades o recuerdos.
                  </li>
                  <li>
                    <strong>Enlaces:</strong> noticias, artículos o páginas que
                    te parezcan interesantes.
                  </li>
                </ul>

                <h4>Formas de interactuar</h4>
                <ul className="lista-centrada">
                  <li>
                    <strong>Reacciones:</strong> Me gusta, Me encanta, Me
                    divierte, Me asombra.
                  </li>
                  <li>
                    <strong>Comentarios y respuestas:</strong> Escribir tu
                    opinión o responder.
                  </li>
                  <li>
                    <strong>Compartir:</strong> Publicar en tu perfil algo que
                    viste en una página.
                  </li>
                </ul>
              </div>
              <figure className="media media-side">
                <img
                  src={publicacionesImg}
                  className="side-image"
                  alt="Publicaciones en Facebook"
                />
              </figure>
            </div>
            <p className="hint">
              Piensa antes de publicar: lo que subes a internet puede ser visto,
              guardado o compartido por muchas personas.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">2.5</span>
              Comunicación: Messenger, llamadas y grupos
            </h3>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Además de publicar en tu perfil, Facebook permite{" "}
                  <strong>comunicarte en privado</strong> mediante Messenger y
                  otras herramientas.
                </p>
                <h4>Formas de comunicación</h4>
                <ul className="lista-centrada">
                  <li>
                    <strong>Messenger:</strong> Sirve para enviar{" "}
                    <strong>mensajes privados</strong> a una o varias personas.
                    Puedes enviar texto, fotos, videos, notas de voz, emojis y
                    archivos.
                  </li>
                  <li>
                    <strong>Llamadas y videollamadas:</strong> Puedes hablar con
                    alguien en tiempo real, solo con audio o con cámara.
                  </li>
                  <li>
                    <strong>Chats grupales:</strong> Ideales para equipos de
                    trabajo, grupos escolares o familiares.
                  </li>
                </ul>
              </div>
              <figure className="media media-side">
                <img
                  src={messengerImg}
                  className="side-image"
                  alt="Messenger de Facebook"
                />
              </figure>
            </div>
            <p className="hint">
              Aunque el chat sea privado, sigue siendo importante ser respetuoso
              y no compartir información personal sensible.
            </p>
          </div>
        </article>
      </main>

      <section className="video-section">
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/XVYM5WLQMFw"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">2.6</span>
          Actividad práctica del módulo
        </h2>
        <ol>
          <li>
            Crea (o revisa) tu <strong>perfil de Facebook</strong> y verifica
            que tengas foto de perfil y de portada.
          </li>
          <li>
            Agrega como amigo a una persona que conozcas y envíale un{" "}
            <strong>mensaje por Messenger</strong> saludándola.
          </li>
          <li>
            Publica un <strong>estado sencillo</strong> (texto o foto) y pídele
            a alguien que reaccione y comente.
          </li>
          <li>
            Revisa las <strong>configuraciones de privacidad</strong> y coloca
            tus publicaciones para que solo tus amigos las vean.
          </li>
        </ol>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">2.7</span>
          Quiz: Comprueba lo aprendido
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className="q">
            <label>
              1) ¿Qué describe mejor la función del perfil en Facebook?
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="soloMensajes">
                  Es el lugar donde solo se guardan mensajes privados.
                </option>
                <option value="perfilIdentidad">
                  Es tu identidad pública: muestra tu información, fotos y lo que
                  compartes.
                </option>
                <option value="soloJuegos">
                  Es un área exclusiva para jugar y ver anuncios.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto: el perfil representa tu identidad dentro de Facebook."
                  : "❗ El perfil no es solo para mensajes ni juegos, sino tu identidad dentro de la red."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              2) ¿Para qué sirve la configuración de privacidad en Facebook?
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="decorar">
                  Solo cambia los colores y decoraciones del perfil.
                </option>
                <option value="privacidadControl">
                  Permite decidir quién puede ver tu información y tus
                  publicaciones.
                </option>
                <option value="borrarCuenta">
                  Sirve para borrar tu cuenta automáticamente.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto: la privacidad controla quién puede ver lo que compartes."
                  : "❗ No se trata de decorar ni borrar la cuenta, sino de controlar el acceso a tu información."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              3) ¿Qué acción realizas cuando quieres que alguien sea tu amigo en
              Facebook?
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="reaccionar">
                  Le das "Me gusta" a una publicación.
                </option>
                <option value="seguir">
                  Lo sigues sin enviar ninguna invitación.
                </option>
                <option value="solicitudAmistad">
                  Envías una solicitud de amistad para que la acepte o rechace.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto: la solicitud de amistad es el medio para conectar como amigos."
                  : "❗ Reaccionar o seguir no es lo mismo que enviar una solicitud de amistad."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              4) ¿Cuál es el propósito principal de las reacciones (Me gusta, Me
              encanta, etc.)?
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="reaccionesEmociones">
                  Expresar emociones o tu opinión sobre una publicación sin
                  escribir un comentario.
                </option>
                <option value="reaccionesBorrar">
                  Borrar automáticamente la publicación.
                </option>
                <option value="reaccionesPrivadas">
                  Enviar un mensaje privado al creador de la publicación.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto: las reacciones expresan cómo te sientes frente a una publicación."
                  : "❗ Las reacciones no borran publicaciones ni envían mensajes privados."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              5) ¿Qué herramienta de Facebook se usa principalmente para mensajes
              privados, llamadas y videollamadas?
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="biografia">
                  La sección de biografía en el perfil.
                </option>
                <option value="publicacionesMuro">
                  Las publicaciones en el muro.
                </option>
                <option value="messengerPrivado">
                  Messenger, que permite chatear, llamar y hacer videollamadas.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto: Messenger es la herramienta de comunicación privada de Facebook."
                  : "❗ La biografía y el muro son públicos, Messenger es para comunicación directa y privada."}
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
                ? "¡Excelente! Entendiste muy bien las funciones principales de Facebook. 🎉"
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