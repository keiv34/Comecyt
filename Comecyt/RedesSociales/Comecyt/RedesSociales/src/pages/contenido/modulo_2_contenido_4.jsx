// src/pages/contenido/modulo_1_contenido_12.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_2_contenido_4.css";


import Publicacion_fbImg from "../../assets/publicacion_fb.png"; // Minúscula
import Seguridad_fbImg from "../../assets/seguridad_fb.png";     // Minúscula
import Seguridad2_fbImg from "../../assets/seguridad2_fb.png";   // Minúscula
import RecuperarCon_fbImg from "../../assets/recuperarcon_fb.png"; // Minúscula
import Paso2_fbImg from "../../assets/paso2_fb.png";             // Minúscula

const API_URL = "http://localhost:4000";
const MODULO_ID = 2; // ✅ Es módulo 2
const NUM_CONTENIDO = 4;

export default function ModuloFacebookSeguridad() {
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
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido12");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  const correctAnswers = {
    q1: "amigos",
    q2: "privadoSoloMiembros",
    q3: "dondeHasIniciado",
    q4: "dosPasos",
    q5: "codigoSeguridad",
    q6: "actualizarDatos",
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
      `Obtuviste ${score} de 6 respuestas correctas.`,
      score >= 4 ? "success" : "info"
    );
  };

  // 🔙 Anterior
  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/modulo/2/contenido/11");
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  if (!progresoCargado) {
    return (
      <div className="fb-sec-container">
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
    <div className="fb-sec-container">
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="fb-sec-header">
        <div className="fb-sec-header-inner">
          <h1>Seguridad y configuración en Facebook</h1>
          <p className="sub">
            Aprende a proteger tu cuenta, controlar quién ve tus publicaciones y
            recuperar el acceso en caso de algún problema.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">4.1</span>
              Privacidad de publicaciones
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  La <strong>privacidad de publicaciones</strong> te permite
                  decidir quién puede ver lo que compartes: textos, fotos,
                  videos, enlaces o historias. Puedes elegir entre opciones
                  como <strong>Público</strong>, <strong>Amigos</strong>,{" "}
                  <strong>Solo yo</strong> o listas personalizadas.
                </p>

                <h3>Pasos para elegir la privacidad en una publicación nueva</h3>
                <ol className="steps-list numbered">
                  <li>Escribe tu publicación (texto, foto, video, etc.).</li>
                  <li>
                    Debajo de tu nombre, haz clic en el botón que dice{" "}
                    <strong>Público</strong>, <strong>Amigos</strong> u otra
                    opción.
                  </li>
                  <li>
                    Elige quién podrá ver la publicación:{" "}
                    <strong>Amigos</strong>, <strong>Público</strong>,{" "}
                    <strong>Solo yo</strong> u otra lista.
                  </li>
                  <li>Haz clic en <strong>Publicar</strong>.</li>
                </ol>

                <h3>
                  Pasos para cambiar la privacidad de una publicación ya hecha
                </h3>
                <ol className="steps-list numbered">
                  <li>
                    Entra a tu <strong>perfil</strong> y busca la publicación.
                  </li>
                  <li>
                    Haz clic en los <strong>tres puntos (…) </strong> de la
                    esquina de la publicación.
                  </li>
                  <li>
                    Selecciona la opción para{" "}
                    <strong>editar privacidad</strong>.
                  </li>
                  <li>
                    Elige la nueva opción de privacidad y guarda los cambios.
                  </li>
                </ol>
              </div>

              <figure className="media-side">
                <img
                  src={Publicacion_fbImg}
                  className="step-image"
                  alt="Ejemplo de privacidad en publicación de Facebook"
                />
              </figure>
            </div>
            <p className="hint">
              Antes de publicar, revisa siempre quién podrá ver el contenido,
              sobre todo si compartes fotos personales o información sensible.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">4.2</span>
              Control de accesos
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  El <strong>control de accesos</strong> permite revisar en qué
                  dispositivos está abierta tu cuenta, cerrar sesiones que no
                  reconoces y activar alertas cuando alguien inicie sesión en
                  un lugar nuevo.
                </p>

                <h3>Pasos para revisar dónde has iniciado sesión</h3>
                <ol className="steps-list numbered">
                  <li>
                    Entra al menú de{" "}
                    <strong>Configuración y privacidad</strong>.
                  </li>
                  <li>Haz clic en <strong>Configuración</strong>.</li>
                  <li>
                    Busca la sección{" "}
                    <strong>Seguridad e inicio de sesión</strong>.
                  </li>
                  <li>
                    En <strong>Dónde has iniciado sesión</strong> revisa la
                    lista de dispositivos y lugares.
                  </li>
                  <li>
                    Si ves algo que no reconoces, haz clic en los{" "}
                    <strong>tres puntos</strong> y elige{" "}
                    <strong>Cerrar sesión</strong>.
                  </li>
                </ol>

                <h3>Pasos para activar alertas y seguridad extra</h3>
                <ol className="steps-list numbered">
                  <li>
                    En <strong>Seguridad e inicio de sesión</strong>, busca
                    las opciones de{" "}
                    <strong>alertas de inicio de sesión</strong>.
                  </li>
                  <li>
                    Activa las notificaciones para que te avisen cuando
                    alguien utiliza tu cuenta.
                  </li>
                  <li>
                    En la misma sección, busca{" "}
                    <strong>Autenticación en dos pasos</strong> y haz clic en{" "}
                    <strong>Editar</strong>.
                  </li>
                  <li>
                    Elige un método (código por SMS o aplicación) y sigue las
                    instrucciones para activarlo.
                  </li>
                </ol>
              </div>

              <figure className="media-side">
                <img
                  src={Seguridad_fbImg}
                  className="step-image"
                  alt="Opciones de seguridad en Facebook"
                />
                <img
                  src={Seguridad2_fbImg}
                  className="step-image"
                  alt="Más ajustes de seguridad en Facebook"
                />
              </figure>
            </div>

            <p className="hint">
              Si activas la autenticación en dos pasos, aunque alguien sepa tu
              contraseña, necesitará también el código que llega a tu
              teléfono.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">4.3</span>
              Recuperación de cuenta
            </h2>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  La <strong>recuperación de cuenta</strong> es el proceso
                  para volver a entrar a Facebook cuando olvidas la
                  contraseña o no puedes acceder. Es muy importante tener
                  actualizado tu <strong>teléfono</strong> y{" "}
                  <strong>correo de recuperación</strong>.
                </p>

                <h3>
                  Pasos para recuperar tu cuenta si olvidaste la contraseña
                </h3>
                <ol className="steps-list numbered">
                  <li>
                    En la pantalla de inicio de sesión, haz clic en{" "}
                    <strong>¿Olvidaste tu contraseña?</strong>
                  </li>
                  <li>
                    Escribe tu <strong>correo</strong>,{" "}
                    <strong>teléfono</strong> o <strong>nombre</strong> para
                    buscar la cuenta.
                  </li>
                  <li>
                    Elige cómo recibir el{" "}
                    <strong>código de seguridad</strong> (SMS o correo).
                  </li>
                  <li>
                    Revisa el mensaje, escribe el código en Facebook y haz
                    clic en <strong>Continuar</strong>.
                  </li>
                  <li>
                    Crea una <strong>nueva contraseña segura</strong> y
                    guárdala en un lugar seguro.
                  </li>
                </ol>

                <h3>Pasos para actualizar tus datos de recuperación</h3>
                <ol className="steps-list numbered">
                  <li>
                    Entra a <strong>Configuración y privacidad</strong> &gt;{" "}
                    <strong>Configuración</strong>.
                  </li>
                  <li>
                    Ve a la sección de <strong>Contacto</strong> o{" "}
                    <strong>Información personal</strong>.
                  </li>
                  <li>
                    Agrega o actualiza tu <strong>correo</strong> y{" "}
                    <strong>número de teléfono</strong>.
                  </li>
                  <li>
                    Confirma los datos siguiendo el enlace o código que te
                    envía Facebook.
                  </li>
                </ol>
              </div>

              <figure className="media-side">
                <img
                  src={Paso2_fbImg}
                  className="step-image"
                  alt="Pantalla de recuperación de Facebook"
                />
                <img
                  src={RecuperarCon_fbImg}
                  className="step-image"
                  alt="Opciones para recuperar la contraseña"
                />
              </figure>
            </div>

            <p className="hint">
              Mantener actualizado tu teléfono y correo de recuperación es la
              mejor forma de no perder tu cuenta.
            </p>
          </div>
        </article>
      </main>

      <section className="video-section">
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/WvmvZ_l7BX4"
            title="Seguridad en Facebook"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">4.4</span>
          Quiz: Seguridad y configuración
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              1) Si quieres que solo tus contactos vean una publicación,
              ¿qué opción de privacidad debes elegir?
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="publico">Público.</option>
                <option value="amigos">Amigos.</option>
                <option value="soloYo">Solo yo.</option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto: la opción “Amigos” permite que solo tus contactos vean la publicación."
                  : "❗ Si quieres que solo tus contactos vean la publicación, debes elegir la opción “Amigos”, no Público ni Solo yo."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              2) ¿Qué característica distingue principalmente a un{" "}
              <strong>grupo privado</strong>?
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="cualquieraEntra">
                  Cualquier persona puede entrar y ver las publicaciones.
                </option>
                <option value="privadoSoloMiembros">
                  Solo los miembros aceptados pueden ver las publicaciones.
                </option>
                <option value="soloAdministradorPublica">
                  Solo el administrador puede escribir mensajes.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto: en un grupo privado solo los miembros aprobados pueden ver el contenido."
                  : "❗ En un grupo privado las publicaciones no son públicas; solo las ven los miembros aceptados."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              3) ¿Qué opción debes revisar para saber desde qué dispositivos
              está abierta tu cuenta?
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="configNotificaciones">
                  Configuración de notificaciones.
                </option>
                <option value="dondeHasIniciado">
                  Sección “Dónde has iniciado sesión” en Seguridad e inicio de
                  sesión.
                </option>
                <option value="bloqueoUsuarios">
                  Lista de personas bloqueadas.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto: en “Dónde has iniciado sesión” ves los dispositivos con tu cuenta abierta."
                  : "❗ Para revisar dispositivos activos debes ir a “Seguridad e inicio de sesión” y luego a “Dónde has iniciado sesión”."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              4) ¿Qué medida aumenta más la seguridad de tu cuenta además de
              la contraseña?
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="fotoPerfil">
                  Cambiar la foto de perfil cada mes.
                </option>
                <option value="dosPasos">
                  Activar la autenticación en dos pasos (código extra en el teléfono).
                </option>
                <option value="masAmigos">
                  Agregar a muchas personas como amigos.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto: la autenticación en dos pasos agrega una capa extra de seguridad."
                  : "❗ Cambiar la foto o agregar amigos no protege tu cuenta; la seguridad aumenta con la autenticación en dos pasos."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              5) Si olvidaste tu contraseña, ¿qué suele enviarte Facebook para
              que recuperes el acceso?
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="codigoSeguridad">
                  Un código de seguridad por SMS o correo.
                </option>
                <option value="listaAmigos">
                  Una lista de todos tus amigos.
                </option>
                <option value="nuevaCuenta">
                  La obligación de crear una cuenta nueva.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto: normalmente se envía un código de seguridad para confirmar que eres tú."
                  : "❗ Facebook no te obliga a crear otra cuenta; primero intenta recuperar la cuenta con un código de seguridad."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              6) ¿Por qué es importante mantener actualizado tu teléfono o
              correo de recuperación en Facebook?
              <select name="q6" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="decorarPerfil">
                  Porque cambia el diseño del perfil.
                </option>
                <option value="actualizarDatos">
                  Porque se usan para enviarte códigos si necesitas recuperar la cuenta.
                </option>
                <option value="masPublicidad">
                  Porque así recibes más anuncios y publicidad.
                </option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto: si tus datos están actualizados, Facebook puede ayudarte a recuperar la cuenta."
                  : "❗ El teléfono y el correo de recuperación sirven para que puedas recuperar tu cuenta, no para decorar el perfil ni recibir más publicidad."}
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
              Puntaje: <strong>{quizScore} / 6</strong>
            </p>
            <p className={quizScore === 6 ? "ok" : "warn"}>
              {quizScore === 6
                ? "¡Excelente! Manejas muy bien la seguridad y configuración básica de Facebook. 🎉"
                : "Buen trabajo. Revisa las tarjetas de seguridad y vuelve a intentarlo si quieres mejorar tu puntaje."}
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
