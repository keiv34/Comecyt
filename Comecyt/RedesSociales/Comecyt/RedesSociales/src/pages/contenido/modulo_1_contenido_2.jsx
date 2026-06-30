import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_1_contenido_2.css";

import requisitosImg from "../../assets/placeholder.png";
import paso1Img from "../../assets/paso1.png";
import paso2Img from "../../assets/paso2.png";
import paso3Img from "../../assets/paso3.png";
import paso4Img from "../../assets/paso4.png";
import paso5Img from "../../assets/paso5.png";
import paso5_1Img from "../../assets/paso5_1.png";
import paso6Img from "../../assets/paso6.png";
import paso7Img from "../../assets/paso7.png";
import paso8Img from "../../assets/paso8.png";
import paso9Img from "../../assets/paso9.png";
import paso10Img from "../../assets/paso10.png";

const MODULO_ID = 1;
const NUM_CONTENIDO = 2;
const API_URL = "http://localhost:4000";

export default function ContenidoCrearCorreoGmail() {
  // 👉 Quiz
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState({});

  // 👉 Navegación / restricciones
  const [tiempoRestante, setTiempoRestante] = useState(120);
  const [timerTerminado, setTimerTerminado] = useState(false);
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const [modoLibre, setModoLibre] = useState(false);

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

  // ✅ FIX: Console.log solo 1 vez
  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido2");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  // ✅ CAMBIO 2: useEffect modificado con setModulos y setTotalContenidos
  useEffect(() => {
    const correo = localStorage.getItem("correo");
    if (!correo) {
      setProgresoCargado(true);
      return;
    }

    const cargarProgreso = async () => {
      try {
        const res = await axios.post(`${API_URL}/api/alumno/progreso`, { correo });
        const modulosData = res.data.modulos || [];
        setModulos(modulosData); // 👈 NUEVO

        const modulo1 = modulosData.find((m) => m.modulo_id === MODULO_ID);

        if (modulo1) {
          setTotalContenidos(modulo1.total_contenidos); // 👈 NUEVO
          if (modulo1.progreso_actual >= NUM_CONTENIDO) {
            setModoLibre(true);
          }
        }
      } catch (err) {
        console.error("Error al obtener progreso:", err);
        showToast("No se pudo obtener tu progreso, pero puedes continuar.", "error");
      } finally {
        setProgresoCargado(true);
      }
    };

    cargarProgreso();
  }, []);

  // 2️⃣ Timer de 2 minutos (si no está en modo libre)
  useEffect(() => {
    if (!progresoCargado) return;

    if (modoLibre) {
      setTiempoRestante(0);
      setTimerTerminado(true);
      setScrolledBottom(true);
      return;
    }

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
  }, [modoLibre, progresoCargado]);

  // 3️⃣ Detectar scroll hasta el fondo
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

  const puedeAvanzar = timerTerminado && scrolledBottom;

  const formatearTiempo = (segundos) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const irAnterior = () => {
    navigate("/modulo/1/contenido/1");
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  // 4️⃣ Lógica del quiz
  const handleQuizSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const correctAnswers = {
      q1: "pagina",
      q2: "usuario",
      q3: "telefono",
      q4: "segura",
      q5: "aceptar",
      q6: "servicios",
      q7: "no-compartir",
    };

    let score = 0;
    const feedback = {};

    Object.entries(correctAnswers).forEach(([key, value]) => {
      const userAnswer = form.get(key);
      const isCorrect = userAnswer === value;
      feedback[key] = isCorrect;
      if (isCorrect) score++;
    });

    setQuizScore(score);
    setQuizFeedback(feedback);
    setQuizAnswered(true);

    showToast(
      `Obtuviste ${score} de 7 respuestas correctas.`,
      score >= 5 ? "success" : "info"
    );
  };

  if (!progresoCargado) {
    return (
      <div className="gmailcreate-container">
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
    <div className="gmailcreate-container">
      {/* 🔔 TOAST GLOBAL */}
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      {/* ===== ENCABEZADO ===== */}
      <header className="gmailcreate-header">
        <div className="header-inner">
          <div>
            <h1>Crear una cuenta de correo en Gmail</h1>
          </div>
        </div>
      </header>

      {/* ===== INTRODUCCIÓN ===== */}
      <section className="intro-card">
        <h2 className="section-title">
          <span className="section-number">2.1</span>
          ¿Por qué crear un correo electrónico?
        </h2>
        <p>
          Tener una cuenta de correo electrónico en Gmail permite acceder a
          muchos servicios: recibir mensajes, registrarse en plataformas
          escolares, usar Google Classroom, Drive, YouTube y más. Es como tu{" "}
          <strong>identidad digital</strong> en el mundo de Google.
        </p>
        <p>
          Crear una cuenta es gratuito, solo necesitas un dispositivo con
          internet y un número de celular para verificarla.
        </p>
      </section>

      {/* ===== TARJETAS PRINCIPALES ===== */}
      <main className="content-grid">
        {/* 1️⃣ Requisitos previos */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">2.2</span>
              Antes de empezar: ¿Qué necesitas?
            </h3>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <ul className="lista-centrada">
                  <li>
                    Un <strong>dispositivo con internet</strong>: computadora,
                    tableta o celular.
                  </li>
                  <li>
                    Un <strong>número de teléfono activo</strong>: recibe
                    mensajes SMS para verificar la cuenta.
                  </li>
                  <li>
                    Un <strong>nombre de usuario</strong> que quieras usar, por
                    ejemplo: <em>juan.alumno123</em>.
                  </li>
                  <li>
                    Una <strong>contraseña segura</strong> que puedas recordar,
                    pero que no sea fácil de adivinar.
                  </li>
                </ul>
                <p className="hint">
                  Tip: Evita usar como contraseña el nombre, la fecha de
                  nacimiento o datos muy obvios.
                </p>
              </div>
              <figure className="media media-side">
                <img
                  src={requisitosImg}
                  alt="Elementos necesarios para crear una cuenta de Gmail"
                  className="side-image"
                />
                <figcaption>
                  Elementos recomendados antes de iniciar el registro.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>

        {/* 3️⃣ Recomendaciones de seguridad */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">2.3</span>
              Buenas prácticas de seguridad
            </h3>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <h4>Cuida tu cuenta</h4>
                <ul className="lista-centrada">
                  <li>
                    No compartas tu <strong>contraseña</strong> con nadie.
                  </li>
                  <li>
                    Usa una contraseña con{" "}
                    <strong>letras, números y símbolos</strong>.
                  </li>
                  <li>
                    Activa un <strong>correo de recuperación</strong> o revisa
                    que tu número esté actualizado.
                  </li>
                  <li>
                    Cierra sesión en computadoras que no son tuyas.
                  </li>
                </ul>
              </div>
              <figure className="media">
                <div className="image-mock security-mock">
                  <p>🔒 Contraseña segura</p>
                  <p>📱 Teléfono de recuperación</p>
                  <p>📧 Correo alternativo</p>
                  <p>🚫 No compartir la contraseña</p>
                </div>
                <figcaption>
                  Puntos clave para mantener segura la cuenta de Gmail.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>

        {/* 2️⃣ Paso a paso para crear la cuenta */}
        <article className="card card-steps">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">2.4</span>
              Pasos para crear una cuenta en Gmail
            </h3>
            <p className="card-sub">
              Sigue cada paso con calma: primero lees el texto y luego miras la
              imagen de ejemplo.
            </p>
          </header>

          <div className="card-body steps-body">
            {/* Paso 1 */}
            <section className="step-block">
              <h4 className="step-title">Paso 1:</h4>
              <p>
                Abre el navegador que usas normalmente. Por ejemplo{" "}
                <strong>Google Chrome</strong>, <strong>Edge</strong> o el que
                tengas instalado.
              </p>

              <figure className="step-figure">
                <img
                  src={paso1Img}
                  alt="Navegador abierto listo para escribir la dirección"
                  className="step-image"
                />
                <figcaption>Ejemplo del navegador abierto.</figcaption>
              </figure>
            </section>

            {/* Paso 2 */}
            <section className="step-block">
              <h4 className="step-title">Paso 2:</h4>
              <p>
                En la barra de direcciones escribe{" "}
                <strong>www.gmail.com</strong> y presiona <kbd>Enter</kbd>.
              </p>
              <figure className="step-figure">
                <img
                  src={paso2Img}
                  alt="Barra de direcciones con www.gmail.com"
                  className="step-image"
                />
                <figcaption>Escribiendo la dirección de Gmail.</figcaption>
              </figure>
            </section>

            {/* Paso 3 */}
            <section className="step-block">
              <h4 className="step-title">Paso 3:</h4>
              <p>
                Cuando cargue la página de Gmail, haz clic en la opción{" "}
                <strong>Crear una cuenta</strong>, en la parte superior derecha.
              </p>

              <figure className="step-figure">
                <img
                  src={paso3Img}
                  alt="Botón Crear una cuenta resaltado en la página de Gmail"
                  className="step-image"
                />
                <figcaption>
                  Ubicación del botón <strong>Crear una cuenta</strong>.
                </figcaption>
              </figure>
            </section>

            {/* Paso 4 */}
            <section className="step-block">
              <h4 className="step-title">Paso 4:</h4>
              <p>
                Se abrirá la ventana de inicio de sesión. Haz clic en{" "}
                <strong>Crear cuenta</strong> y elige la opción que mejor se
                adapte a ti (por ejemplo, <em>Para mí</em>).
              </p>

              <figure className="step-figure">
                <img
                  src={paso4Img}
                  alt="Ventana de inicio de sesión con la opción Crear cuenta"
                  className="step-image"
                />
                <figcaption>
                  Opción <strong>Crear cuenta</strong> en la pantalla de acceso.
                </figcaption>
              </figure>
            </section>

            {/* Paso 5 */}
            <section className="step-block">
              <h4 className="step-title">Paso 5:</h4>
              <p>
                Completa el formulario con tu <strong>nombre</strong> y{" "}
                <strong>apellido</strong>, tal como quieres que aparezcan en tu
                cuenta. Completa tus datos de{" "}
                <strong>nacimiento y género</strong>.
              </p>

              <figure className="step-figure">
                <img
                  src={paso5Img}
                  alt="Formulario donde se escriben nombre y apellido"
                  className="step-image"
                />
                <figcaption>Campos de nombre y apellido.</figcaption>
              </figure>
              <figure className="step-figure">
                <img
                  src={paso5_1Img}
                  alt="Formulario donde se escriben nacimiento y género"
                  className="step-image"
                />
                <figcaption>Campos de nacimiento y género.</figcaption>
              </figure>
            </section>

            {/* Paso 6 */}
            <section className="step-block">
              <h4 className="step-title">Paso 6:</h4>
              <p>
                Elige el <strong>nombre de usuario</strong> que tendrá tu
                correo, por ejemplo{" "}
                <em>nombre.apellido@gmail.com</em>. Debe ser único.
              </p>

              <figure className="step-figure">
                <img
                  src={paso6Img}
                  alt="Campo para escribir el nombre de usuario del correo"
                  className="step-image"
                />
                <figcaption>Elección del nombre de usuario.</figcaption>
              </figure>
            </section>

            {/* Paso 7 */}
            <section className="step-block">
              <h4 className="step-title">Paso 7:</h4>
              <p>
                Crea una <strong>contraseña segura</strong> y escríbela dos
                veces: en <em>Contraseña</em> y en <em>Confirmación</em>. Luego
                haz clic en <strong>Siguiente</strong>.
              </p>

              <figure className="step-figure">
                <img
                  src={paso7Img}
                  alt="Campos de contraseña y confirmación"
                  className="step-image"
                />
                <figcaption>
                  Contraseña y confirmación de contraseña.
                </figcaption>
              </figure>
            </section>

            {/* Paso 8 */}
            <section className="step-block">
              <h4 className="step-title">Paso 8:</h4>
              <p>
                Añade tu <strong>número de teléfono</strong>, escribe el código
                de 6 dígitos que llega por SMS.
              </p>

              <figure className="step-figure">
                <img
                  src={paso8Img}
                  alt="Pantalla de verificación con código y datos personales"
                  className="step-image"
                />
                <figcaption>Verificación con código.</figcaption>
              </figure>
            </section>

            {/* Paso 9 */}
            <section className="step-block">
              <h4 className="step-title">Paso 9:</h4>
              <p>
                Revisa los <strong>Términos de servicio</strong> y la{" "}
                <strong>Política de privacidad de Google</strong>. Si estás de
                acuerdo, haz clic en <strong>Estoy de acuerdo</strong>.
              </p>

              <figure className="step-figure">
                <img
                  src={paso9Img}
                  alt="Pantalla con los términos de servicio de Google"
                  className="step-image"
                />
                <figcaption>Aceptar términos y condiciones.</figcaption>
              </figure>
            </section>

            {/* Paso 10 */}
            <section className="step-block">
              <p className="hint">
                Al finalizar todos los pasos, se abrirá la página principal de
                Gmail: ya tendrás tu <strong>nueva cuenta de correo</strong>{" "}
                lista para usar.
              </p>
              <figure className="step-figure">
                <img
                  src={paso10Img}
                  alt="Ventana principal de Gmail"
                  className="step-image"
                />
                <figcaption>Ventana principal de Gmail.</figcaption>
              </figure>
            </section>
          </div>
        </article>
      </main>

      {/* ===== VIDEO EXPLICATIVO ===== */}
      <section className="video-section">
        <h3 className="section-title inline">Video explicativo</h3>

        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/ejB485itEqw"
            title="¿Cómo crear una cuenta de Gmail?"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      {/* ===== ACTIVIDAD ===== */}
      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">2.5</span>
          Actividad práctica del módulo
        </h2>
        <ol>
          <li>
            En equipo, escriban en una hoja los <strong>datos</strong> que usarán
            para crear una cuenta (nombre, usuario, teléfono, contraseña).
          </li>
          <li>
            Con apoyo de un adulto, entren a la página de{" "}
            <strong>Crear cuenta de Google</strong> y sigan los pasos del módulo.
          </li>
          <li>
            Completen el formulario hasta llegar a la nueva{" "}
            <strong>bandeja de Gmail</strong>.
          </li>
          <li>
            Identifiquen qué otros servicios pueden usar ahora (Drive, YouTube,
            Classroom, etc.).
          </li>
          <li>
            Comenten en grupo por qué es importante{" "}
            <strong>no compartir</strong> la contraseña con nadie.
          </li>
        </ol>
      </section>

      {/* ===== QUIZ ===== */}
      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">2.6</span>
          Quiz: ¿recuerdas los pasos para crear tu correo?
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className="q">
            <label>
              1) ¿Cuál es uno de los primeros pasos para crear una cuenta de
              Gmail?
              <select name="q1" required>
                <option value="">Selecciona…</option>
                <option value="abrir-gmail">
                  Abrir directamente la bandeja de entrada
                </option>
                <option value="pagina">
                  Entrar a la página de crear cuenta de Google
                </option>
                <option value="borrar-correos">
                  Borrar correos antiguos primero
                </option>
              </select>
            </label>
            {quizAnswered && (
              <p
                className={
                  quizFeedback.q1 ? "answer-correct" : "answer-wrong"
                }
              >
                {quizFeedback.q1
                  ? "✔ Correcto. Primero se entra a la página de creación de cuenta."
                  : "✖ Incorrecto. Debes entrar a la página de crear cuenta de Google."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              2) ¿Qué representa el nombre de usuario que eliges?
              <select name="q2" required>
                <option value="">Selecciona…</option>
                <option value="clave">
                  Solo es una clave interna que nadie ve
                </option>
                <option value="usuario">
                  Es la dirección de correo que usarás (por ejemplo,
                  usuario@gmail.com)
                </option>
                <option value="apodo">
                  Solo es un apodo para entrar a YouTube
                </option>
              </select>
            </label>
            {quizAnswered && (
              <p
                className={
                  quizFeedback.q2 ? "answer-correct" : "answer-wrong"
                }
              >
                {quizFeedback.q2
                  ? "✔ Correcto. El usuario se convierte en tu dirección de correo."
                  : "✖ Incorrecto. El nombre de usuario es tu dirección de correo."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              3) ¿Qué dato ayuda a recuperar tu cuenta si olvidas la contraseña?
              <select name="q3" required>
                <option value="">Selecciona…</option>
                <option value="color-favorito">Tu color favorito</option>
                <option value="telefono">
                  Un número de teléfono o correo de recuperación
                </option>
                <option value="pais">
                  El país donde estás usando internet
                </option>
              </select>
            </label>
            {quizAnswered && (
              <p
                className={
                  quizFeedback.q3 ? "answer-correct" : "answer-wrong"
                }
              >
                {quizFeedback.q3
                  ? "✔ Correcto. El número o correo de recuperación sirve para recuperar la cuenta."
                  : "✖ Incorrecto. El dato útil para recuperar la cuenta es el teléfono o correo alterno."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              4) ¿Cómo debe ser una buena contraseña?
              <select name="q4" required>
                <option value="">Selecciona…</option>
                <option value="simple">Muy corta y fácil, como 1234</option>
                <option value="nombre">
                  Igual que tu nombre y tu fecha de nacimiento
                </option>
                <option value="segura">
                  Con letras, números y, si se puede, algún símbolo
                </option>
              </select>
            </label>
            {quizAnswered && (
              <p
                className={
                  quizFeedback.q4 ? "answer-correct" : "answer-wrong"
                }
              >
                {quizFeedback.q4
                  ? "✔ Correcto. Una buena contraseña combina distintos tipos de caracteres."
                  : "✖ Incorrecto. La contraseña debe ser segura y combinar letras, números y símbolos."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              5) ¿Qué debes hacer con los términos y condiciones de Google?
              <select name="q5" required>
                <option value="">Selecciona…</option>
                <option value="ignorarlos">Ignorarlos siempre</option>
                <option value="aceptar">
                  Leerlos y luego aceptarlos para continuar
                </option>
                <option value="borrarlos">
                  Borrarlos antes de seguir
                </option>
              </select>
            </label>
            {quizAnswered && (
              <p
                className={
                  quizFeedback.q5 ? "answer-correct" : "answer-wrong"
                }
              >
                {quizFeedback.q5
                  ? "✔ Correcto. Es importante leer y aceptar los términos antes de usar la cuenta."
                  : "✖ Incorrecto. Debes leer y aceptar los términos para crear la cuenta."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              6) Después de crear tu cuenta de Gmail, ¿a qué otros servicios
              puedes acceder?
              <select name="q6" required>
                <option value="">Selecciona…</option>
                <option value="solo-gmail">Solo a Gmail</option>
                <option value="servicios">
                  A otros servicios como Drive, YouTube y Classroom
                </option>
                <option value="ninguno">A ningún otro servicio</option>
              </select>
            </label>
            {quizAnswered && (
              <p
                className={
                  quizFeedback.q6 ? "answer-correct" : "answer-wrong"
                }
              >
                {quizFeedback.q6
                  ? "✔ Correcto. La misma cuenta sirve para varios servicios de Google."
                  : "✖ Incorrecto. Con tu cuenta puedes usar otros servicios como Drive y YouTube."}
              </p>
            )}
          </div>

          <div className="q">
            <label>
              7) ¿Cuál es una buena práctica de seguridad?
              <select name="q7" required>
                <option value="">Selecciona…</option>
                <option value="pegar">
                  Escribir la contraseña en un papel y pegarla en la pared
                </option>
                <option value="no-compartir">
                  No compartir tu contraseña con nadie
                </option>
                <option value="contar-amigos">
                  Contársela a tus amigos de confianza
                </option>
              </select>
            </label>
            {quizAnswered && (
              <p
                className={
                  quizFeedback.q7 ? "answer-correct" : "answer-wrong"
                }
              >
                {quizFeedback.q7
                  ? "✔ Correcto. La contraseña es personal y no debe compartirse."
                  : "✖ Incorrecto. Lo más seguro es no compartir la contraseña con nadie."}
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
              Puntaje: <strong>{quizScore} / 7</strong>
            </p>
            <p className={quizScore === 7 ? "ok" : "warn"}>
              {quizScore === 7
                ? "¡Excelente! Comprendes muy bien cómo crear y cuidar tu cuenta de Gmail."
                : "Buen trabajo. Puedes repasar los pasos y volver a intentarlo."}
            </p>
          </div>
        )}
      </section>

      {/* ===== NAVEGACIÓN ENTRE CONTENIDOS ===== */}
      <footer className="contenido-footer">
        <div className="avance-mensaje">
          {!timerTerminado && !modoLibre && (
            <p>
              ⏳ Lee el contenido. El botón <strong>Siguiente</strong> se
              habilitará en {formatearTiempo(tiempoRestante)}.
            </p>
          )}
          {timerTerminado && !scrolledBottom && (
            <p>
              👇 Desplázate hasta el final de la página para habilitar el botón
              <strong> Siguiente</strong>.
            </p>
          )}
          {puedeAvanzar && (
            <p>✅ Ya puedes continuar al siguiente contenido.</p>
          )}
          {modoLibre && (
            <p>✅ Ya habías visto este contenido. Puedes avanzar cuando quieras.</p>
          )}
        </div>

        <div className="botones-nav">
          <button className="btn-anterior" onClick={irAnterior}>
            Anterior
          </button>
          <button
            className={`btn-siguiente ${!puedeAvanzar || guardando ? "btn-disabled" : ""}`}
            onClick={finalizarContenido}
            disabled={guardando || !puedeAvanzar}
          >
            {guardando ? "Guardando..." : "Siguiente"}
          </button>
        </div>
      </footer>
    </div>
  );
}
