// src/pages/contenido/modulo_1_contenido_28.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_4_contenido_7.css";

const API_URL = "http://localhost:4000";
const MODULO_ID = 4; // ✅ Es módulo 4
const NUM_CONTENIDO = 7;
const TOTAL_PREGUNTAS = 6;

export default function ContenidoInstagramSeguridadPrivacidad() {
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
  const [totalContenidos, setTotalContenidos] = useState(28);
  const [modulos, setModulos] = useState([]);

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido28");
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500);
  };

  const correctAnswers = {
    q1: "filtros",
    q2: "restringir",
    q3: "2fa",
    q4: "reportar",
    q5: "solicitudes",
    q6: "bloquear",
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
    navigate("/modulo/1/contenido/27"); // ✅ Va al contenido 27
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  if (!progresoCargado) {
    return (
      <div className="ig7-container">
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
    <div className="ig7-container">
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      <header className="ig7-header">
        <div className="ig7-header-inner">
          <h1>Instagram: Seguridad y privacidad</h1>
          <p className="sub">
            En este tema aprenderás a proteger tu cuenta.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">7</span>
              Controles de seguridad (en Instagram)
            </h2>
          </header>

          <div className="card-body">
            <p>
              En Instagram tú decides <strong>quién puede interactuar contigo</strong> y qué tanto
              control quieres tener. Esto es importante si tu cuenta es{" "}
              <strong>pública</strong>, si estás creciendo como{" "}
              <strong>creador</strong> o si usas Instagram para un{" "}
              <strong>negocio</strong>, porque pueden llegar mensajes o comentarios de personas
              desconocidas.
            </p>
            <p>
              La seguridad no se trata de “tener miedo”, sino de usar bien las opciones para evitar:
              <strong> acoso</strong>, <strong>spam</strong>, <strong>suplantación</strong> y
              <strong> robo de cuenta</strong>. Abajo verás cada herramienta con explicación clara y
              ejemplos reales.
            </p>

            <div className="note">
              <p className="note-text">
                <strong>Nota:</strong>{" "}Si algo te incomoda o se ve sospechoso: <strong>filtra</strong>,{" "}
                <strong>restringe</strong>, <strong>bloquea</strong> y/o{" "}
                <strong>reporta</strong>. Tú mandas en tu cuenta.
              </p>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">7.1</span>
              Control de comentarios y mensajes (DM)
            </h2>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Esta parte sirve para definir <strong>cómo pueden hablar contigo</strong>.
                  Instagram permite reducir comentarios ofensivos y controlar qué mensajes llegan a
                  tu bandeja principal. Esto ayuda mucho cuando:
                </p>

                <ul className="lista-simple">
                  <li>Tu cuenta es pública y te escriben desconocidos.</li>
                  <li>Publicas seguido y recibes muchos comentarios.</li>
                  <li>Te llega spam (links raros, “gana dinero”, etc.).</li>
                </ul>

                <h3>Lo más importante que puedes configurar</h3>
                <ul className="lista-simple">
                  <li>
                    <strong>Filtros automáticos:</strong> Instagram oculta comentarios ofensivos.
                  </li>
                  <li>
                    <strong>Palabras ocultas:</strong> tú agregas palabras que no quieres ver.
                  </li>
                  <li>
                    <strong>Solicitudes de mensajes:</strong> mensajes de desconocidos se van a una
                    sección aparte.
                  </li>
                  <li>
                    <strong>Quién puede enviarte DM:</strong> seguidores, todos, o ciertas
                    personas.
                  </li>
                </ul>
                <div className="steps">
                  <p className="steps-title">Ruta rápida (general):</p>
                  <ol className="lista-pasos">
                    <li>Ve a tu perfil → toca ☰ (menú).</li>
                    <li>Entra a <strong>Configuración y privacidad</strong>.</li>
                    <li>Busca <strong>Privacidad</strong> → Comentarios / Mensajes.</li>
                    <li>Activa filtros y ajusta quién puede enviarte mensajes.</li>
                  </ol>
                </div>
              </div>

              <figure className="mockup">
                <div className="phone">
                  <div className="phone-top">
                    <span className="dot" />
                    <span className="speaker" />
                  </div>

                  <div className="phone-header">
                    <div className="back">‹</div>
                    <div className="title">@tu_usuario</div>
                    <div className="menu">⋯</div>
                  </div>

                  <div className="screen">
                    <div className="panel">
                      <p className="panel-title">Privacidad</p>

                      <div className="row">
                        <span>Filtros automáticos</span>
                        <span className="pill on">ON</span>
                      </div>
                      <div className="row">
                        <span>Palabras ocultas</span>
                        <span className="pill on">ON</span>
                      </div>
                      <div className="row">
                        <span>Solicitudes de mensajes</span>
                        <span className="pill">Ver</span>
                      </div>
                      <div className="row">
                        <span>Quién puede enviarte DM</span>
                        <span className="pill">Editar</span>
                      </div>

                      <div className="mini-note">
                        Sugerencia: si recibes spam, usa “Solicitudes” y restringe cuentas.
                      </div>
                    </div>
                  </div>

                  <div className="phone-nav">
                    <span>⌂</span>
                    <span>🔍</span>
                    <span>＋</span>
                    <span>▶️</span>
                    <span>●</span>
                  </div>
                </div>

                <figcaption className="caption">
                  Pantalla de privacidad para comentarios y mensajes.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">7.2</span>
              Bloqueo y restricción de cuentas
            </h2>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Cuando alguien te molesta, insiste, acosa o te falta al respeto,
                  Instagram te da varias opciones. No todas hacen lo mismo:
                  algunas son “suaves” (para evitar conflicto) y otras cortan el contacto por completo.
                </p>

                <h3>¿Qué hace cada opción?</h3>
                <ul className="lista-simple">
                  <li>
                    <strong>Restringir:</strong> Es discreto. Los comentarios quedan ocultos y
                    mensajes van a solicitudes. Es ideal si no quieres conflicto.
                  </li>
                  <li>
                    <strong>Silenciar:</strong> Tú dejas de ver su contenido (historias o posts) sin bloquear.
                    Útil si solo te molesta verlo.
                  </li>
                  <li>
                    <strong>Bloquear:</strong> Es la opción fuerte. Esa persona no puede ver tu perfil,
                    enviarte mensajes ni comentar.
                  </li>
                </ul>

                <div className="warnbox">
                  <p className="warn-text">
                    <strong>¿Cuándo bloquear?</strong>{" "}Si hay amenazas, acoso repetido o te piden información personal lo mejor es <strong>bloquear</strong>. Es una medida de protección.
                  </p>
                </div>

                <div className="steps">
                  <p className="steps-title">Cómo hacerlo (rápido):</p>
                  <ol className="lista-pasos">
                    <li>Entra al perfil de la persona.</li>
                    <li>Toca los <strong>tres puntos (⋯)</strong>.</li>
                    <li>Elige: <strong>Restringir</strong>, <strong>Silenciar</strong> o <strong>Bloquear</strong>.</li>
                  </ol>
                </div>
              </div>

              <figure className="mockup">
                <div className="phone">
                  <div className="phone-top">
                    <span className="dot" />
                    <span className="speaker" />
                  </div>

                  <div className="phone-header">
                    <div className="back">‹</div>
                    <div className="title">@usuario_raro</div>
                    <div className="menu">⋯</div>
                  </div>

                  <div className="screen">
                    <div className="profile-mini">
                      <div className="avatar" />
                      <div className="stats">
                        <div><strong>12</strong><span>posts</span></div>
                        <div><strong>89</strong><span>seguidores</span></div>
                        <div><strong>210</strong><span>seguidos</span></div>
                      </div>
                    </div>

                    <div className="btnrow">
                      <span className="btn">Siguiendo</span>
                      <span className="btn">Mensaje</span>
                    </div>

                    <div className="panel">
                      <p className="panel-title">Opciones</p>
                      <div className="row"><span>Restringir</span><span className="pill">✓</span></div>
                      <div className="row"><span>Silenciar</span><span className="pill">…</span></div>
                      <div className="row danger"><span>Bloquear</span><span className="pill danger">!</span></div>
                      <div className="row"><span>Reportar</span><span className="pill">→</span></div>
                    </div>
                  </div>

                  <div className="phone-nav">
                    <span>⌂</span>
                    <span>🔍</span>
                    <span>＋</span>
                    <span>▶️</span>
                    <span>●</span>
                  </div>
                </div>

                <figcaption className="caption">
                  Menú para restringir / bloquear / reportar.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">7.3</span>
              Autenticación en dos pasos (2FA)
            </h2>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  La <strong>autenticación en dos pasos</strong> agrega una capa extra de seguridad.
                  Aunque alguien adivine tu contraseña, <strong>no podrá entrar</strong> sin un código.
                </p>

                <h3>¿Cómo funciona?</h3>
                <ul className="lista-simple">
                  <li>
                    Inicias sesión con tu contraseña (paso 1).
                  </li>
                  <li>
                    Instagram te pide un <strong>código extra</strong> (paso 2), que llega por app autenticadora o SMS.
                  </li>
                </ul>

                <div className="tip">
                  <p className="tip-title">Recomendación</p>
                  <p className="tip-text">
                    Es mejor usar una <strong>app autenticadora</strong> (más segura). También guarda tus{" "}
                    <strong>códigos de respaldo</strong> por si pierdes el teléfono.
                  </p>
                </div>

                <div className="steps">
                  <p className="steps-title">Pasos para activarlo:</p>
                  <ol className="lista-pasos">
                    <li>Perfil → ☰ → <strong>Configuración y privacidad</strong>.</li>
                    <li>Entra a <strong>Centro de cuentas</strong> o “Seguridad”.</li>
                    <li>Busca <strong>Autenticación en dos pasos</strong>.</li>
                    <li>Elige método (app autenticadora / SMS) y confirma.</li>
                  </ol>
                </div>
              </div>

              <figure className="mockup">
                <div className="phone">
                  <div className="phone-top">
                    <span className="dot" />
                    <span className="speaker" />
                  </div>

                  <div className="phone-header">
                    <div className="back">‹</div>
                    <div className="title">Seguridad</div>
                    <div className="menu">⋯</div>
                  </div>

                  <div className="screen">
                    <div className="panel">
                      <p className="panel-title">Autenticación en dos pasos</p>

                      <div className="row">
                        <span>App autenticadora</span>
                        <span className="pill on">ON</span>
                      </div>
                      <div className="row">
                        <span>SMS</span>
                        <span className="pill">OFF</span>
                      </div>

                      <div className="codebox">
                        <div className="code">••••••</div>
                        <div className="codehint">Código temporal</div>
                      </div>

                      <div className="mini-note">
                        Guarda códigos de respaldo para emergencias.
                      </div>
                    </div>
                  </div>

                  <div className="phone-nav">
                    <span>⌂</span>
                    <span>🔍</span>
                    <span>＋</span>
                    <span>▶️</span>
                    <span>●</span>
                  </div>
                </div>

                <figcaption className="caption">
                  Activación de 2FA con app autenticadora.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>

        <article className="card">
          <header className="card-head">
            <h2 className="section-title inline">
              <span className="section-number">7.4</span>
              Reporte de contenido inapropiado
            </h2>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <p>
                  Reportar sirve para avisar a Instagram cuando hay contenido que puede ser{" "}
                  <strong>dañino</strong> o <strong>inseguro</strong> (acoso, estafas, suplantación,
                  contenido violento, etc.). Reportar no es “ser exagerado”; es una herramienta para cuidarte.
                </p>

                <h3>¿Qué puedes reportar?</h3>
                <ul className="lista-simple">
                  <li><strong>Una cuenta</strong> (suplantación o acoso).</li>
                  <li><strong>Un post</strong> o <strong>reel</strong> (contenido inapropiado).</li>
                  <li><strong>Una historia</strong>.</li>
                  <li><strong>Un mensaje</strong> (DM con estafa, amenazas o links raros).</li>
                </ul>

                <div className="warnbox">
                  <p className="warn-text">
                    <strong>Regla rápida: </strong>Si hay riesgo o acoso: <strong>Bloquea + Reporta</strong>.
                    Si solo te incomoda: puedes <strong>Restringir</strong> o <strong>Silenciar</strong>.
                  </p>
                </div>

                <div className="steps">
                  <p className="steps-title">Cómo reportar:</p>
                  <ol className="lista-pasos">
                    <li>Abre el contenido o perfil.</li>
                    <li>Toca <strong>⋯</strong> (tres puntos).</li>
                    <li>Selecciona <strong>Reportar</strong>.</li>
                    <li>Elige el motivo (acoso, spam, suplantación, etc.) y envía.</li>
                  </ol>
                </div>
              </div>

              <figure className="mockup">
                <div className="phone">
                  <div className="phone-top">
                    <span className="dot" />
                    <span className="speaker" />
                  </div>

                  <div className="phone-header">
                    <div className="back">‹</div>
                    <div className="title">Reportar</div>
                    <div className="menu">✕</div>
                  </div>

                  <div className="screen">
                    <div className="panel">
                      <p className="panel-title">¿Qué está pasando?</p>

                      <div className="row"><span>Es spam</span><span className="pill">→</span></div>
                      <div className="row"><span>Acoso o bullying</span><span className="pill">→</span></div>
                      <div className="row"><span>Suplantación</span><span className="pill">→</span></div>
                      <div className="row"><span>Contenido inapropiado</span><span className="pill">→</span></div>

                      <div className="mini-note">
                        Instagram revisará el reporte. Si hay peligro inmediato, pide ayuda a un adulto/autoridad.
                      </div>
                    </div>
                  </div>

                  <div className="phone-nav">
                    <span>⌂</span>
                    <span>🔍</span>
                    <span>＋</span>
                    <span>▶️</span>
                    <span>●</span>
                  </div>
                </div>

                <figcaption className="caption">
                  Menú de reporte con motivos comunes.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>
      </main>

      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">7.5</span>
          Actividad práctica
        </h2>

        <ol>
          <li>
            Escribe 5 palabras que bloquearías en comentarios (ej: insultos o spam) y explica por qué.
          </li>
          <li>
            Describe un caso: ¿cuándo usarías <strong>Restringir</strong> y cuándo <strong>Bloquear</strong>?
            (2–3 renglones por cada uno).
          </li>
          <li>
            Redacta una mini “regla personal” para proteger tu cuenta (ej: no abrir links raros, activar 2FA, etc.).
          </li>
        </ol>
      </section>

      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">7.6</span>
          Quiz: Seguridad y privacidad
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className={`q ${quizAnswered ? feedback.q1 || "" : ""}`}>
            <label>
              <span className="question-text">
                1) ¿Qué opción ayuda a ocultar comentarios ofensivos o de spam automáticamente?
              </span>
              <select name="q1" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="filtros">Filtros automáticos / palabras ocultas</option>
                <option value="reels">Reels</option>
                <option value="historias">Historias</option>
              </select>
            </label>
            {quizAnswered && feedback.q1 && (
              <p className={`answer-feedback ${feedback.q1}`}>
                {feedback.q1 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: los filtros y palabras ocultas sirven para eso."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q2 || "" : ""}`}>
            <label>
              <span className="question-text">
                2) ¿Qué opción es discreta y manda mensajes/comentarios a control sin “pelea”?
              </span>
              <select name="q2" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="restringir">Restringir</option>
                <option value="publicar">Publicar</option>
                <option value="seguir">Seguir</option>
              </select>
            </label>
            {quizAnswered && feedback.q2 && (
              <p className={`answer-feedback ${feedback.q2}`}>
                {feedback.q2 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: restringir es la opción discreta."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q3 || "" : ""}`}>
            <label>
              <span className="question-text">
                3) ¿Para qué sirve la autenticación en dos pasos?
              </span>
              <select name="q3" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="2fa">Pedir un código extra además de la contraseña</option>
                <option value="likes">Tener más likes</option>
                <option value="filtros">Cambiar filtros</option>
              </select>
            </label>
            {quizAnswered && feedback.q3 && (
              <p className={`answer-feedback ${feedback.q3}`}>
                {feedback.q3 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: 2FA agrega un código extra para entrar."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q4 || "" : ""}`}>
            <label>
              <span className="question-text">
                4) ¿Qué acción corresponde a avisar a Instagram sobre acoso, spam o suplantación?
              </span>
              <select name="q4" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="reportar">Reportar</option>
                <option value="guardar">Guardar</option>
                <option value="editar">Editar bio</option>
              </select>
            </label>
            {quizAnswered && feedback.q4 && (
              <p className={`answer-feedback ${feedback.q4}`}>
                {feedback.q4 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: eso es reportar."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q5 || "" : ""}`}>
            <label>
              <span className="question-text">
                5) ¿Dónde suelen caer los mensajes de personas que no te siguen?
              </span>
              <select name="q5" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="solicitudes">Solicitudes de mensajes</option>
                <option value="feed">En el feed</option>
                <option value="historias">En historias</option>
              </select>
            </label>
            {quizAnswered && feedback.q5 && (
              <p className={`answer-feedback ${feedback.q5}`}>
                {feedback.q5 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: normalmente llegan como solicitudes."}
              </p>
            )}
          </div>

          <div className={`q ${quizAnswered ? feedback.q6 || "" : ""}`}>
            <label>
              <span className="question-text">
                6) Si alguien te amenaza o te pide códigos/contraseñas, ¿qué es lo más recomendable?
              </span>
              <select name="q6" required onChange={handleChange}>
                <option value="">Selecciona…</option>
                <option value="bloquear">Bloquear (y reportar si es necesario)</option>
                <option value="seguir">Seguir hablando</option>
                <option value="publicar">Publicar su mensaje</option>
              </select>
            </label>
            {quizAnswered && feedback.q6 && (
              <p className={`answer-feedback ${feedback.q6}`}>
                {feedback.q6 === "correct"
                  ? "✅ Correcto."
                  : "❗ Revisa: lo más seguro es bloquear y reportar."}
              </p>
            )}
          </div>

          <button type="submit" className="btn-primary">Calificar</button>
        </form>

        {quizAnswered && (
          <div className="quiz-result">
            <p>
              Puntaje: <strong>{quizScore} / {TOTAL_PREGUNTAS}</strong>
            </p>
            <p className={quizScore >= 5 ? "ok" : "warn"}>
              {quizScore >= 5
                ? "¡Excelente! Ya sabes proteger tu cuenta. 🔒✨"
                : "Vas bien. Revisa las tarjetas donde tuviste dudas y vuelve a intentar."}
            </p>
          </div>
        )}
      </section>

      <footer className="contenido-footer">
        <div className="avance-mensaje">
          {gated && !timerTerminado && (
            <p>
              ⏳ Lee el contenido. El botón <strong>Siguiente</strong> se habilitará
              en {formatearTiempo(tiempoRestante)}.
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
          <button className="btn-anterior" onClick={irAnterior}>← Anterior</button>
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