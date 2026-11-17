// src/pages/contenido/modulo_1_contenido_23.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_4_contenido_2.css";

import igPaso1Img from "../../assets/igPaso1.png";
import igPaso2Img from "../../assets/igPaso2.png";
import igPaso3Img from "../../assets/igPaso3.png";
import igPaso4Img from "../../assets/igPaso4.png";
import igPaso5Img from "../../assets/igPaso5.png";
import igPaso6Img from "../../assets/igPaso6.png";
import igUsuarioBioImg from "../../assets/igUsuarioBio.png";
import igFotoPerfilImg from "../../assets/igFotoPerfil.png";
import igEnlacesContactoImg from "../../assets/igEnlacesContacto.png";
import igPrivacidadImg from "../../assets/igPrivacidad.png";

const API_URL = "http://localhost:4000";
const MODULO_ID = 4; // ✅ Es módulo 4
const NUM_CONTENIDO = 2;
const TOTAL_PREGUNTAS = 6;

export default function ContenidoInstagramConfiguracionInicial() {
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
  const [totalContenidos, setTotalContenidos] = useState(23);
  const [modulos, setModulos] = useState([]);

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido23");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500);
  };

  const correctAnswers = {
    q1: "registro",
    q2: "usuario",
    q3: "bio",
    q4: "foto",
    q5: "contacto",
    q6: "privacidad",
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

        const modulo = modulosData.find((m) => m.modulo_id === MODULO_ID);
        if (modulo) {
          setTotalContenidos(modulo.total_contenidos); // 👈 NUEVO
          const p = Number(modulo?.progreso_actual ?? 0);
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
      if (scrollPosition >= pageHeight - 80) setScrolledBottom(true);
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
      `Obtuviste ${score} de ${TOTAL_PREGUNTAS} respuestas correctas.`,
      score >= 5 ? "success" : "info"
    );
  };

  // 🔙 Anterior
  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/modulo/1/contenido/22"); // ✅ Va al contenido 22
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  if (!progresoCargado) {
    return (
      <div className="ig2-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#833ab4'
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
    <div className="ig2-container">
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="ig2-header">
        <div className="ig2-header-inner">
          <h1>Instagram: Configuración inicial de la cuenta</h1>
          <p className="sub">
            Aprende a registrarte, personalizar tu perfil, agregar contacto y
            definir tu privacidad para usar Instagram de forma segura y completa.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">2.0</span>
              ¿Qué veremos en Instagram?
            </h2>
          </header>

          <div className="card-body">
            <p>
              <strong>Instagram</strong> es una red social enfocada en contenido{" "}
              <strong>visual</strong>, donde puedes compartir <strong>fotos</strong>,{" "}
              <strong>videos</strong> y contenido corto como <strong>historias</strong>{" "}
              y <strong>reels</strong>. En este módulo aprenderás lo básico para usarla
              con confianza, ya sea para uso personal o para un proyecto/negocio.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">2.1</span>
              Registro e inicio de sesión
            </h2>
          </header>

          <div className="card-body">
            <p className="pasos-intro">
              Sigue cada paso con calma: primero lees el texto y luego miras la imagen
              de ejemplo.
            </p>

            <ul className="lista-pasos-img">
              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 1:</strong>
                </p>
                <p className="paso-texto">
                  Abre la tienda de aplicaciones en tu teléfono. En Android entra a{" "}
                  <strong>Play Store</strong>.
                  Escribe <strong>&quot;Instagram&quot;</strong> en el buscador y
                  verifica que sea la app oficial de (<strong>Instagram</strong> /{" "}
                  <strong>Meta</strong>) y da clic en el boton <strong>instalar</strong>.
                </p>

                <figure className="paso-figure">
                  <img
                    src={igPaso1Img}
                    alt="Búsqueda de Instagram en la tienda"
                    className="paso-img" />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 2:</strong>
                </p>
                <p className="paso-texto">
                  Pulsa en <strong>Instalar</strong> y espera a que termine la descarga y luego toca{" "}
                  <strong>Abrir</strong>.
                </p>
                <figure className="paso-figure">
                  <img
                    src={igPaso2Img}
                    alt="Instalación de Instagram"
                    className="paso-img"
                  />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 3:</strong>
                </p>
                <p className="paso-texto">
                  En la pantalla principal, selecciona <strong>Crear cuenta</strong> o{" "}
                  <strong>Registrarte</strong>. Elige si deseas iniciar sesión con{" "}
                  <strong>Facebook</strong>.
                </p>
                <figure className="paso-figure">
                  <img
                    src={igPaso3Img}
                    alt="Pantalla para crear cuenta en Instagram"
                    className="paso-img"
                  />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 4:</strong>
                </p>
                <p className="paso-texto">
                  Elige registrarte con tu número de teléfono o email, ingresa tus datos.
                  Crea una <strong>contraseña segura</strong> (mezcla letras y números),
                  ingresa un nombre de usuario.
                  Si Instagram envía un <strong>código de verificación</strong> por SMS
                  o correo, escríbelo para confirmar tu cuenta.
                </p>
                <figure className="paso-figure">
                  <img
                    src={igPaso4Img}
                    alt="Código de verificación y contraseña"
                    className="paso-img"
                  />
                </figure>
              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 5:</strong>
                </p>
                <p className="paso-texto">
                  Elige iniciar sesión con Facebook, selecciona <strong>"Continuar con Facebook"</strong>{" "}
                  la app te pedirá continuar con tu cuenta de Facebook y te guiará para crear una cuenta nueva
                  o enlazar con una existente.
                </p>
                <figure className="paso-figure">
                  <img
                    src={igPaso5Img}
                    alt="Código de verificación y contraseña"
                    className="paso-img"
                  />
                </figure>

              </li>

              <li className="paso-bloque">
                <p className="paso-titulo">
                  <strong>Paso 6:</strong>
                </p>
                <p className="paso-texto">
                  Para <strong>iniciar sesión</strong> después, abre Instagram y escribe
                  tu <strong>usuario o correo</strong> y tu <strong>contraseña</strong>.
                  Si activas la <strong>verificación en dos pasos</strong>, también te
                  pedirá un código adicional.
                </p>
                <figure className="paso-figure">
                  <img
                    src={igPaso6Img}
                    alt="Pantalla de inicio de sesión en Instagram"
                    className="paso-img"
                  />
                </figure>

              </li>
            </ul>

            <p className="hint">
              Tip: usa una contraseña que no uses en otras apps y activa verificación en
              dos pasos si la tienes disponible.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">2.2</span>
              Nombre de usuario y biografía
            </h2>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Tu <strong>nombre de usuario</strong> (por ejemplo:{" "}
                  <em>@mi_tienda</em>) es como te encuentran en Instagram. La{" "}
                  <strong>biografía</strong> es una descripción corta que explica
                  quién eres o qué ofreces.
                </p>

                <h3>Buenas prácticas</h3>
                <ul className="lista-simple">
                  <li>Que sea fácil de escribir y recordar.</li>
                  <li>Evita demasiados números o símbolos raros.</li>
                  <li>En la bio escribe: qué haces + ubicación + cómo contactarte.</li>
                </ul>
              </div>
              <figure className="media-side">
                <img src={igUsuarioBioImg} alt="Nombre de usuario y biografía" className="side-image" />
              </figure>

            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">2.3</span>
              Foto de perfil
            </h2>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  La <strong>foto de perfil</strong> es la primera impresión.
                  Debe verse clara incluso en tamaño pequeño.
                </p>

                <ul className="lista-simple">
                  <li>Si es cuenta personal: una foto nítida del rostro.</li>
                  <li>Si es negocio: logotipo simple y con buen contraste.</li>
                  <li>Evita fotos borrosas o con demasiado texto.</li>
                </ul>
                <p className="hint">
                  Tip: Usa una imagen cuadrada (1:1) y revisa que se vea bien dentro del círculo.
                </p>
              </div>
              <figure className="media-side">
                <img src={igFotoPerfilImg} alt="Cambiar foto de perfil" className="side-image" />
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">2.4</span>
              Enlaces y botones de contacto
            </h2>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Los <strong>enlaces</strong> y <strong>botones de contacto</strong>{" "}
                  facilitan que las personas te escriban o te encuentren. Esto es
                  especialmente útil si usas cuenta de creador o empresa.
                </p>

                <ul className="lista-simple">
                  <li>
                    Agrega un <strong>enlace</strong> (por ejemplo: catálogo, WhatsApp, web).
                  </li>
                  <li>
                    Configura <strong>correo</strong>, <strong>teléfono</strong> o <strong>ubicación</strong>.
                  </li>
                  <li>
                    Mantén el enlace actualizado (si cambias de número o página).
                  </li>
                </ul>
              </div>
              <figure className="media-side">
                <img src={igEnlacesContactoImg} alt="Enlaces y botones de contacto" className="side-image" />
              </figure>
            </div>
            <p className="hint">
              Tip: Si vendes, tener un enlace directo a WhatsApp o formulario de pedidos
              hace el proceso más rápido.
            </p>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">2.5</span>
              Opciones de privacidad (pública o privada)
            </h2>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Instagram permite configurar si tu cuenta es{" "}
                  <strong>pública</strong> o <strong>privada</strong>. Esta decisión
                  cambia quién puede ver tus publicaciones y quién puede seguirte.
                </p>

                <div className="privacy-grid">
                  <div className="privacy-item">
                    <h3>Cuenta pública</h3>
                    <ul className="lista-simple">
                      <li>Todos pueden ver tu perfil y publicaciones.</li>
                      <li>Ideal para creadores y negocios que quieren alcance.</li>
                      <li>Más exposición: debes cuidar lo que publicas.</li>
                    </ul>
                  </div>

                  <div className="privacy-item">
                    <h3>Cuenta privada</h3>
                    <ul className="lista-simple">
                      <li>Solo tus seguidores aprobados ven tu contenido.</li>
                      <li>Mejor para cuentas personales.</li>
                      <li>Más control: tú decides a quién aceptas.</li>
                    </ul>
                  </div>
                </div>
              </div>
              <figure className="media-side">
                <img src={igPrivacidadImg} alt="Opciones de privacidad" className="side-image" />
                <p className="hint">
                  Tip: Aunque tu cuenta sea pública, evita compartir datos sensibles.
                </p>
              </figure>
            </div>
          </div>
        </article>
      </main>

      <section className="video-section">
        <h2 className="section-title inline">
          <span className="section-number">2.6</span>
          Video: Configurar tu cuenta de Instagram
        </h2>
        <p className="video-hint">
          Mira un video corto para reforzar cómo editar perfil, poner foto y
          ajustar privacidad.
        </p>
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/zxspWqssG78"
            title="Configurar Instagram"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </section>

      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">2.7</span>
          Actividad práctica del tema
        </h2>
        <ol>
          <li>
            Crea (o simula) un perfil y escribe:
            <ul className="lista-simple">
              <li>Nombre de usuario.</li>
              <li>Biografía (máximo 3 renglones).</li>
              <li>Qué foto usarías y por qué.</li>
            </ul>
          </li>
          <li>
            Escribe qué enlace colocarías (WhatsApp, catálogo, sitio web) y por qué.
          </li>
          <li>
            Elige: ¿cuenta pública o privada? Explica tu decisión en 2–3 renglones.
          </li>
        </ol>
        <p className="hint">
          Procura que tu ejemplo sea realista (negocio local o perfil personal).
        </p>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">2.8</span>
          Quiz: Configuración inicial de Instagram
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              <span className="question-text">
                1) ¿Qué acción corresponde al registro o inicio de sesión?
              </span>
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="registro">
                  Crear cuenta o ingresar con usuario/correo y contraseña.
                </option>
                <option value="filtros">Cambiar filtros de fotos.</option>
                <option value="borrar">Borrar toda la app.</option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: registro/inicio de sesión es crear o ingresar con datos."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              <span className="question-text">
                2) ¿Para qué sirve el nombre de usuario?
              </span>
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="usuario">
                  Para que las personas te encuentren fácilmente (ej: @nombre).
                </option>
                <option value="soloFoto">Solo para subir fotos.</option>
                <option value="wifi">Para conectarte al WiFi.</option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: el usuario es tu identificador en Instagram."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              <span className="question-text">
                3) ¿Qué debe incluir una buena biografía?
              </span>
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="bio">
                  Qué haces, ubicación (opcional) y cómo contactarte.
                </option>
                <option value="contra">Tu contraseña completa.</option>
                <option value="tarjeta">Datos bancarios.</option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: nunca compartas contraseñas o datos sensibles."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              <span className="question-text">
                4) ¿Qué es lo más recomendable para una foto de perfil?
              </span>
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="foto">
                  Que sea clara y se vea bien en tamaño pequeño.
                </option>
                <option value="borrosa">Que sea borrosa para “misterio”.</option>
                <option value="muchoTexto">Que tenga demasiado texto.</option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: debe verse clara dentro del círculo."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              <span className="question-text">
                5) ¿Para qué sirven los enlaces y botones de contacto?
              </span>
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="contacto">
                  Para facilitar que te escriban o encuentren (correo, teléfono, ubicación).
                </option>
                <option value="juego">Para jugar dentro de Instagram.</option>
                <option value="bloquear">Para bloquear a todos.</option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: sirven para contacto y rapidez (sobre todo en negocio/creador)."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              <span className="question-text">
                6) ¿Qué diferencia principal hay entre cuenta pública y privada?
              </span>
              <select name="q6" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="privacidad">
                  Pública: todos ven tu contenido. Privada: solo seguidores aprobados.
                </option>
                <option value="igual">No hay diferencia.</option>
                <option value="soloColor">Solo cambia el color del perfil.</option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: la privacidad determina quién puede ver tus publicaciones."}
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
              Puntaje:{" "}
              <strong>
                {quizScore} / {TOTAL_PREGUNTAS}
              </strong>
            </p>
            <p className={quizScore >= 5 ? "ok" : "warn"}>
              {quizScore >= 5
                ? "¡Excelente! Ya sabes configurar tu cuenta correctamente. 🎉"
                : "Buen intento. Revisa las tarjetas y vuelve a intentar el quiz."}
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
            <p>✅ Ya habías llegado a este contenido. Puedes avanzar cuando lo necesites.</p>
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