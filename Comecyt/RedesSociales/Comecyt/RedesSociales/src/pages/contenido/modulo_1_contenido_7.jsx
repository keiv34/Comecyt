// src/components/contenidos/modulo_1_contenido_7.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_1_contenido_7.css";

import fotoPerfilImg from "../../assets/foto-perfil.png";
import temaImg from "../../assets/tema.png";
import firmaImg from "../../assets/firma.png";
import notificacionesImg from "../../assets/notificaciones.png";
import notificaciones2Img from "../../assets/notificaciones2.png";
import seguridadImg from "../../assets/seguridad.png";

const API_URL = "http://localhost:4000";
const MODULO_ID = 1;
const NUM_CONTENIDO = 7;

export default function ContenidoConfigGmail() {
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState({});

  // 🔐 control de avance
  const [tiempoRestante, setTiempoRestante] = useState(120);
  const [timerTerminado, setTimerTerminado] = useState(false);
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const [gated, setGated] = useState(true);
  const [progreso, setProgreso] = useState(0);

  // ✅ CAMBIO 1: States nuevos para el fix
  const [totalContenidos, setTotalContenidos] = useState(8);
  const [modulos, setModulos] = useState([]);

  // 🔔 Notificaciones tipo toast
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info", // "success" | "error" | "info"
  });

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido7");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  };

  // ✅ CAMBIO 2: useEffect modificado con setModulos y setTotalContenidos
  useEffect(() => {
    const fetchProgreso = async () => {
      try {
        const correo = localStorage.getItem("correo");
        if (!correo) return;

        const res = await axios.post(
          `${API_URL}/api/alumno/progreso`,
          { correo }
        );

        const modulosData = res.data.modulos || [];
        setModulos(modulosData); // 👈 NUEVO

        const datosMod1 = modulosData.find(
          (m) => m.modulo_id === MODULO_ID
        );

        if (datosMod1) {
          setTotalContenidos(datosMod1.total_contenidos); // 👈 NUEVO
          const p = Number(datosMod1.progreso_actual ?? 0);
          setProgreso(p);

          if (p >= NUM_CONTENIDO) {
            setGated(false);
            setTimerTerminado(true);
            setScrolledBottom(true);
          } else if (p === NUM_CONTENIDO) {
            setGated(true);
          } else {
            setGated(false);
            setTimerTerminado(true);
            setScrolledBottom(true);
          }
        }
      } catch (err) {
        console.error("Error obteniendo progreso:", err);
        showToast(
          "No se pudo obtener tu progreso, pero puedes seguir leyendo.",
          "error"
        );
      }
    };

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    fetchProgreso();
  }, []);

  useEffect(() => {
    if (!gated) return;

    setTiempoRestante(120);
    setTimerTerminado(false);

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
  }, [gated]);

  useEffect(() => {
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
  }, []);

  const puedeAvanzar = !gated || (timerTerminado && scrolledBottom);

  const formatearTiempo = (segundos) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/modulo/1/contenido/6");
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  const handleQuizSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    let score = 0;
    const fb = {};

    if (form.get("q1") === "foto") {
      score++;
      fb.q1 = true;
    } else fb.q1 = false;

    if (form.get("q2") === "tema") {
      score++;
      fb.q2 = true;
    } else fb.q2 = false;

    if (form.get("q3") === "firma") {
      score++;
      fb.q3 = true;
    } else fb.q3 = false;

    if (form.get("q4") === "notificaciones") {
      score++;
      fb.q4 = true;
    } else fb.q4 = false;

    if (form.get("q5") === "dospasos") {
      score++;
      fb.q5 = true;
    } else fb.q5 = false;

    setQuizScore(score);
    setQuizFeedback(fb);
    setQuizAnswered(true);

    showToast(
      `Obtuviste ${score} de 5 respuestas correctas.`,
      score === 5 ? "success" : "info"
    );
  };


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
    <div className="gmailconfig-container">
      {/* 🔔 TOAST GLOBAL */}
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      {/* ===== ENCABEZADO ===== */}
      <header className="gmailconfig-header">
        <div className="header-inner">
          <div>
            <h1>Configuración y personalización de tu correo Gmail</h1>
            <p className="sub">
              Cambiar apariencia, datos personales, seguridad y notificaciones.
            </p>
          </div>
        </div>
      </header>

      {/* ===== INTRODUCCIÓN ===== */}
      <section className="intro-card">
        <h2 className="section-title">
          <span className="section-number">7.1</span>
          ¿Por qué personalizar tu correo?
        </h2>
        <p>
          Configurar Gmail te permite que tu correo sea{" "}
          <strong>más seguro, claro y fácil de usar</strong>. Puedes elegir cómo
          se ve tu bandeja de entrada, qué nombre aparece cuando envías
          mensajes, qué notificaciones recibes y cómo proteger tu cuenta.
        </p>
        <p>
          A continuación veremos las opciones básicas de{" "}
          <strong>personalización y seguridad</strong> que toda persona debería
          conocer al usar su cuenta de Gmail.
        </p>
      </section>

      {/* ===== TARJETAS PRINCIPALES ===== */}
      <main className="content-grid">
        {/* 1️⃣ Foto de perfil */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">7.2</span>
              Foto de perfil de la cuenta
            </h3>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <h4>¿Para qué sirve?</h4>
                <ul className="lista-centrada">
                  <li>
                    Permite que otras personas{" "}
                    <strong>te reconozcan</strong> fácilmente.
                  </li>
                  <li>
                    Se muestra en tus correos, en Google Meet, Classroom y otros
                    servicios.
                  </li>
                </ul>

                <h4>¿Cómo cambiarla?</h4>
                <ol className="steps-list">
                  <li>Haz clic en tu foto o inicial, arriba a la derecha.</li>
                  <li>
                    Elige la opción{" "}
                    <strong>"Gestionar tu cuenta de Google"</strong>.
                  </li>
                  <li>
                    En <strong>"Información personal"</strong>, selecciona{" "}
                    <strong>"Añadir imagen de perfil"</strong> y sube una imagen
                    desde tu dispositivo.
                  </li>
                </ol>
              </div>
              <figure className="config-figure">
                <div className="config-frame">
                  <img
                    src={fotoPerfilImg}
                    alt="Cambiar la foto de perfil en Gmail"
                    className="config-image"
                  />
                </div>
                <figcaption>Ventana para cambiar la foto de perfil.</figcaption>
              </figure>
            </div>
          </div>
        </article>

        {/* 2️⃣ Tema y apariencia */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">7.3</span>
              Cambiar el tema y la apariencia de Gmail
            </h3>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <h4>¿Para qué sirve?</h4>
                <p>
                  Te permite personalizar el{" "}
                  <strong>fondo y los colores</strong> de tu bandeja de entrada,
                  para que se vea más cómoda y agradable.
                </p>

                <h4>¿Cómo hacerlo?</h4>
                <ol className="steps-list">
                  <li>
                    Haz clic en el ícono de <strong>configuración (⚙)</strong>.
                  </li>
                  <li>
                    Selecciona <strong>"Ver toda la configuración"</strong>.
                  </li>
                  <li>
                    En la sección <strong>"Temas"</strong>, elige el fondo o
                    color que más te guste y guarda los cambios.
                  </li>
                </ol>
              </div>

              <figure className="config-figure">
                <div className="config-frame">
                  <img
                    src={temaImg}
                    alt="Cambiar tema de Gmail"
                    className="config-image"
                  />
                </div>
                <figcaption>
                  Vista de la opción de temas para personalizar el fondo.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>

        {/* 3️⃣ Firma automática */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">7.4</span>
              Firma automática en los correos
            </h3>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <h4>¿Para qué sirve?</h4>
                <p>
                  Agrega un texto automático al final de cada correo, como tu{" "}
                  <strong>nombre, grupo, cargo o teléfono</strong>.
                </p>

                <h4>¿Cómo crear una firma?</h4>
                <ol className="steps-list">
                  <li>
                    Entra a <strong>⚙ → Ver toda la configuración</strong>.
                  </li>
                  <li>
                    En la pestaña <strong>"General"</strong>, baja hasta{" "}
                    <strong>"Firma"</strong>.
                  </li>
                  <li>
                    Escribe tu firma y guarda los cambios. Ejemplo:{" "}
                    <em>"Fernanda – Docente · San Felipe del Progreso"</em>.
                  </li>
                </ol>
              </div>

              <figure className="config-figure">
                <div className="config-frame">
                  <img
                    src={firmaImg}
                    alt="Configurar la firma en Gmail"
                    className="config-image"
                  />
                </div>
                <figcaption>
                  Área de configuración donde se escribe la firma.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>

        {/* 4️⃣ Notificaciones y vista de bandeja */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">7.5</span>
              Notificaciones y organización de la bandeja
            </h3>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <h4>Notificaciones</h4>
                <ul className="lista-centrada">
                  <li>
                    Desde la configuración puedes activar las{" "}
                    <strong>notificaciones de escritorio</strong>.
                  </li>
                  <li>
                    Puedes elegir recibir avisos solo de{" "}
                    <strong>correos importantes</strong>.
                  </li>
                </ul>

                <h4>Vista de la bandeja de entrada</h4>
                <ul className="lista-centrada">
                  <li>
                    Puedes elegir entre vista{" "}
                    <strong>predeterminada, compacta o cómoda</strong>.
                  </li>
                  <li>
                    También puedes usar bandejas por{" "}
                    <strong>Prioritarios, Social, Promociones</strong>, etc.
                  </li>
                </ul>
              </div>

              <figure className="config-figure">
                <div className="config-frame">
                  <img
                    src={notificaciones2Img}
                    alt="Configurar notificaciones en Gmail"
                    className="config-image"
                  />
                  <img
                    src={notificacionesImg}
                    alt="Vista de notificaciones en Gmail"
                    className="config-image"
                  />
                </div>
              </figure>
            </div>
          </div>
        </article>

        {/* 5️⃣ Seguridad: verificación en dos pasos */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">7.6</span>
              Seguridad básica: verificación en dos pasos
            </h3>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <h4>¿Para qué sirve?</h4>
                <p>
                  Protege tu cuenta para que nadie pueda entrar aunque sepa tu{" "}
                  <strong>contraseña</strong>. Google pedirá un{" "}
                  <strong>código adicional</strong> que llega a tu teléfono.
                </p>

                <h4>¿Cómo activarla?</h4>
                <ol className="steps-list">
                  <li>
                    Haz clic en tu foto →{" "}
                    <strong>"Gestionar tu cuenta de Google"</strong>.
                  </li>
                  <li>
                    Ve a la sección <strong>"Seguridad"</strong>.
                  </li>
                  <li>
                    En <strong>"Verificación en dos pasos"</strong>, sigue las
                    instrucciones para registrar tu teléfono.
                  </li>
                </ol>
              </div>

              <figure className="config-figure">
                <div className="config-frame">
                  <img
                    src={seguridadImg}
                    alt="Verificación en dos pasos"
                    className="config-image"
                  />
                </div>
              </figure>
            </div>
          </div>
        </article>
      </main>

      {/* ===== VIDEO EXPLICATIVO ===== */}
      <section className="video-section">
        <h3 className="section-title inline">Video explicativo</h3>
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/ejB485itEqw"
            title="Video: configuración básica de Gmail"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      {/* ===== ACTIVIDAD PRÁCTICA ===== */}
      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">7.7</span>
          Actividad práctica
        </h2>
        <ol>
          <li>
            Cambia el <strong>tema</strong> de tu bandeja de entrada por uno que
            te guste.
          </li>
          <li>
            Crea una <strong>firma</strong> con tu nombre y grupo o cargo.
          </li>
          <li>
            Activa o revisa las <strong>notificaciones</strong> de correo.
          </li>
          <li>
            Entra a tu <strong>Cuenta de Google</strong> y busca la sección de{" "}
            <strong>Seguridad</strong>.
          </li>
        </ol>
      </section>

      {/* ===== QUIZ ===== */}
      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">7.8</span>
          Quiz: Comprueba lo aprendido
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className="q">
            <label>
              1) ¿Qué opción te permite cambiar la imagen que aparece en tu
              cuenta?
              <select name="q1" required>
                <option value="">Selecciona…</option>
                <option value="tema">Cambiar tema</option>
                <option value="foto">Foto de perfil</option>
                <option value="firma">Firma automática</option>
              </select>
            </label>
            {quizAnswered && (
              <p className={quizFeedback.q1 ? "ans-correct" : "ans-wrong"}>
                {quizFeedback.q1
                  ? "✔ Correcto: la foto de perfil es la imagen que te identifica."
                  : "✘ No exactamente. La opción correcta es “Foto de perfil”."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              2) ¿Dónde cambias el fondo y los colores de tu bandeja?
              <select name="q2" required>
                <option value="">Selecciona…</option>
                <option value="firma">Firma</option>
                <option value="tema">Temas</option>
                <option value="dospasos">Verificación en dos pasos</option>
              </select>
            </label>
            {quizAnswered && (
              <p className={quizFeedback.q2 ? "ans-correct" : "ans-wrong"}>
                {quizFeedback.q2
                  ? "✔ Muy bien. Los temas cambian la apariencia de Gmail."
                  : "✘ Revisa la tarjeta de “Temas y apariencia”."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              3) ¿Qué herramienta agrega un texto automático al final de tus
              correos?
              <select name="q3" required>
                <option value="">Selecciona…</option>
                <option value="firma">Firma automática</option>
                <option value="notificaciones">Notificaciones</option>
                <option value="foto">Foto de perfil</option>
              </select>
            </label>
            {quizAnswered && (
              <p className={quizFeedback.q3 ? "ans-correct" : "ans-wrong"}>
                {quizFeedback.q3
                  ? "✔ Exacto. La firma aparece en todos tus correos."
                  : "✘ La respuesta correcta es “Firma automática”."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              4) ¿Qué sección ajusta los avisos cuando llega un correo?
              <select name="q4" required>
                <option value="">Selecciona…</option>
                <option value="notificaciones">Notificaciones</option>
                <option value="tema">Temas</option>
                <option value="foto">Foto de perfil</option>
              </select>
            </label>
            {quizAnswered && (
              <p className={quizFeedback.q4 ? "ans-correct" : "ans-wrong"}>
                {quizFeedback.q4
                  ? "✔ Correcto. Desde notificaciones decides qué avisos recibir."
                  : "✘ La opción correcta es “Notificaciones”."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              5) ¿Qué opción mejora la seguridad pidiendo un código extra además
              de la contraseña?
              <select name="q5" required>
                <option value="">Selecciona…</option>
                <option value="firma">Firma</option>
                <option value="tema">Temas</option>
                <option value="dospasos">Verificación en dos pasos</option>
              </select>
            </label>
            {quizAnswered && (
              <p className={quizFeedback.q5 ? "ans-correct" : "ans-wrong"}>
                {quizFeedback.q5
                  ? "✔ Muy bien. La verificación en dos pasos protege tu cuenta."
                  : "✘ La respuesta correcta es “Verificación en dos pasos”."}
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
                ? "¡Excelente! Manejas muy bien la configuración básica de Gmail 🎉"
                : "Puedes repasar las tarjetas del módulo y volver a intentarlo 😉"}
            </p>
          </div>
        )}
      </section>

      {/* ===== FOOTER AVANCE (IGUAL QUE EN EL 6) ===== */}
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