// src/components/contenidos/modulo_1_contenido_3.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_1_contenido_3.css";

const MODULO_ID = 1;
const NUM_CONTENIDO = 3;
const API_URL = "http://localhost:4000";

export default function ContenidoGmailTopBar() {
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
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido3");
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

  // ⏱️ Timer de 2 minutos
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

  // 📜 Detectar scroll al final
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

  const puedeAvanzar = (modoLibre || timerTerminado) && scrolledBottom;

  const formatearTiempo = (segundos) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const irAnterior = () => {
    navigate("/modulo/1/contenido/2");
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  // 🧩 Quiz
  const handleQuizSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    let score = 0;
    if (form.get("q1") === "logo") score += 1;
    if (form.get("q2") === "has:attachment") score += 1;
    if (form.get("q3") === "cuadricula") score += 1;

    setQuizScore(score);
    setQuizAnswered(true);

    showToast(
      `Obtuviste ${score} de 3 respuestas correctas.`,
      score === 3 ? "success" : "info"
    );
  };

  // ================== CONTENIDO ==================


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
    <div className="gmailtopbar-container">
      {/* 🔔 TOAST GLOBAL */}
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      {/* ===== ENCABEZADO ===== */}
      <header className="gmailtopbar-header">
        <div className="header-inner">
          <div>
            <h1>Interfaz principal de Gmail</h1>
            <p className="sub">Barra superior de navegación</p>
          </div>
        </div>
      </header>

      {/* ===== INTRODUCCIÓN ===== */}
      <section className="intro-card">
        <h2 className="section-title">
          <span className="section-number">3.1</span>
          Interfaz principal
        </h2>
        <p>
          La interfaz principal de Gmail es el punto de acceso central para
          gestionar el correo electrónico de Google. En la parte superior se
          encuentra la <strong>barra de navegación</strong>, donde el usuario
          puede identificar la plataforma, buscar mensajes, acceder a la
          configuración, obtener ayuda, abrir otras aplicaciones de Google y
          gestionar su perfil personal.
        </p>
        <p>
          Gracias a esta barra es posible moverse de forma rápida, sencilla y
          eficiente dentro de la cuenta, lo que favorece una{" "}
          <strong>mejor organización y productividad</strong> en la comunicación
          digital.
        </p>
      </section>

      {/* ===== DEMO VISUAL ===== */}
      <section className="demo">
        <h2 className="section-title">Vista general de la barra superior</h2>

        <div className="demo-bar">
          <button className="logo-area" title="Logo de Gmail (clic simulado)">
            <span className="m-letter">M</span>
            <span className="brand">Gmail</span>
          </button>

          <div className="search-area">
            <input
              type="text"
              placeholder="Buscar en el correo"
              aria-label="Buscar en el correo"
            />
            <button className="icon-btn" title="Buscar">
              🔍
            </button>
          </div>

          <div className="quick-icons">
            <button className="icon-btn" title="Configuración">
              ⚙
            </button>
            <button className="icon-btn" title="Ayuda">
              ❓
            </button>
            <button className="icon-btn" title="Aplicaciones de Google">
              <span className="grid9" aria-hidden>
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className="dot" />
                ))}
              </span>
            </button>
            <button className="avatar" title="Perfil de usuario">
              JZ
            </button>
          </div>
        </div>

        <p className="demo-note">
          *Esta barra te ayudará a identificar cada elemento antes de usarlo en
          Gmail real.*
        </p>
      </section>

      {/* ===== SECCIONES PRINCIPALES ===== */}
      <main className="content-grid">
        {/* 1️⃣ Logo de Gmail */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">3.2</span>
              Logo de Gmail
            </h3>
          </header>

          <div className="card-body">
            <div className="two-col">
              <div>
                <h4>¿Qué es y para qué sirve?</h4>
                <p>
                  El logo se ubica en la esquina superior izquierda y funciona
                  como acceso directo a la{" "}
                  <strong>bandeja de entrada principal</strong>. Es el "botón de
                  inicio" de Gmail.
                </p>

                <h4>Pasos para utilizarlo</h4>
                <ul className="lista-centrada">
                  <li>
                    Haz clic en el <strong>logo de Gmail</strong>.
                  </li>
                  <li>
                    Regresarás a la <strong>vista principal</strong> desde
                    cualquier sección (Enviados, Borradores, Spam, etc.).
                  </li>
                </ul>

                <p className="hint">
                  Tip: cuando te "pierdas" entre muchas pantallas, el logo es la
                  forma más rápida de <strong>volver al inicio</strong>.
                </p>
              </div>

              <figure className="media">
                <div className="image-mock image-logo">
                  <span className="image-logo-m">M</span>
                  <span className="image-logo-text">Gmail</span>
                </div>
                <figcaption>
                  Representación del logo en la parte izquierda de la barra.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>

        {/* 2️⃣ Barra de búsqueda */}
        <article className="card card-search">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">3.3</span>
              Barra de búsqueda de correos
            </h3>
          </header>

          <div className="card-body">
            <div className="two-col two-col-search">
              <div>
                <h4>¿Qué es y para qué sirve?</h4>
                <p>
                  Es el <strong>buscador interno</strong> de tu bandeja. Permite
                  encontrar correos, contactos, archivos adjuntos o palabras
                  clave para no revisar uno por uno.
                </p>

                <figure className="media media-search">
                  <div className="image-mock image-search">
                    <div className="mock-input">
                      <span className="mock-search-icon">🔍</span>
                      <span className="mock-placeholder">
                        Buscar en el correo
                      </span>
                    </div>
                    <div className="mock-filters">
                      <span>from:profe</span>
                      <span>has:attachment</span>
                    </div>
                  </div>
                </figure>

                <h4>Pasos para utilizarla</h4>
                <ul className="lista-centrada">
                  <li>
                    Haz clic en el cuadro <em>"Buscar en el correo"</em>.
                  </li>
                  <li>
                    Escribe el <strong>remitente</strong>, el{" "}
                    <strong>asunto</strong>, una <strong>palabra clave</strong>{" "}
                    o una <strong>fecha</strong>.
                  </li>
                  <li>
                    Presiona <kbd>Enter</kbd> o el ícono de la{" "}
                    <strong>lupa</strong>.
                  </li>
                </ul>
              </div>

              <div className="right-col-search">
                <div className="filters-panel">
                  <h4>Filtros avanzados útiles</h4>
                  <ul className="filters-search">
                    <li>
                      <code>from:usuario@correo.com</code>
                      <p className="filter-help">
                        Muestra solo los correos{" "}
                        <strong>enviados por esa persona</strong>.
                      </p>
                    </li>
                    <li>
                      <code>to:destinatario@correo.com</code>
                      <p className="filter-help">
                        Muestra los correos que{" "}
                        <strong>tú enviaste</strong> a ese destinatario.
                      </p>
                    </li>
                    <li>
                      <code>has:attachment</code>
                      <p className="filter-help">
                        Filtra los mensajes que{" "}
                        <strong>incluyen archivos adjuntos</strong> (PDF,
                        imágenes, documentos, etc.).
                      </p>
                    </li>
                  </ul>

                  <p className="hint">
                    Combinar filtros ahorra mucho tiempo.{" "}
                    <strong>Ejemplo:</strong>
                    <br />
                    <code>from:profe has:attachment</code> → correos del profe
                    que tengan archivos adjuntos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* 3️⃣ Íconos de acciones rápidas */}
        <article className="card card-infographic">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">3.4</span>
              Íconos de acciones rápidas
            </h3>
            <p className="card-sub">
              Están en la parte derecha de la barra superior y te dan acceso
              rápido a funciones importantes de tu cuenta.
            </p>
          </header>

          <div className="card-body">
            <div className="infographic-cols">
              {/* CONFIGURACIÓN */}
              <section className="info-col info-col--config">
                <div className="info-icon-wrapper">
                  <span className="info-icon">⚙</span>
                </div>
                <div className="info-body">
                  <h4 className="info-title">CONFIGURACIÓN</h4>
                  <ul className="info-list">
                    <li>
                      Sirve para <strong>personalizar Gmail</strong>:
                      apariencia, tema, vista de la bandeja, firmas, respuestas
                      automáticas, etc.
                    </li>
                    <li>
                      Desde aquí también controlas opciones más avanzadas como{" "}
                      <strong>filtros, etiquetas y reenvío de correos</strong>.
                    </li>
                    <li>
                      Paso básico: haz clic en <strong>⚙</strong> y luego en{" "}
                      <em>"Ver toda la configuración"</em> para explorar todas
                      las pestañas.
                    </li>
                  </ul>
                </div>
              </section>

              {/* AYUDA */}
              <section className="info-col info-col--help">
                <div className="info-icon-wrapper">
                  <span className="info-icon">❓</span>
                </div>
                <div className="info-body">
                  <h4 className="info-title">AYUDA</h4>
                  <ul className="info-list">
                    <li>
                      Muestra <strong>artículos, guías y tutoriales</strong>{" "}
                      oficiales de Google sobre Gmail.
                    </li>
                    <li>
                      Es útil cuando tienes dudas o algún problema con el correo
                      y quieres una <strong>explicación paso a paso</strong>.
                    </li>
                    <li>
                      Paso básico: haz clic en <strong>❓</strong> y elige{" "}
                      <em>"Ayuda"</em> para buscar un tema o{" "}
                      <em>"Enviar comentarios"</em> si quieres reportar algo.
                    </li>
                  </ul>
                </div>
              </section>

              {/* APLICACIONES */}
              <section className="info-col info-col--apps">
                <div className="info-icon-wrapper">
                  <span className="info-icon">
                    <span className="grid9 mini-grid">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <span key={i} className="dot" />
                      ))}
                    </span>
                  </span>
                </div>
                <div className="info-body">
                  <h4 className="info-title">APLICACIONES DE GOOGLE</h4>
                  <ul className="info-list">
                    <li>
                      Abre rápidamente{" "}
                      <strong>Drive, Calendar, Docs, Meet</strong> y muchas
                      otras apps conectadas a tu cuenta.
                    </li>
                    <li>
                      Facilita trabajar con tus correos junto a tus{" "}
                      <strong>documentos, archivos y eventos</strong>.
                    </li>
                    <li>
                      Paso básico: haz clic en la{" "}
                      <strong>cuadrícula de 9 puntos</strong>, elige la
                      aplicación y se abrirá en una nueva pestaña.
                    </li>
                  </ul>
                </div>
              </section>

              {/* PERFIL */}
              <section className="info-col info-col--profile">
                <div className="info-icon-wrapper">
                  <span className="info-icon">🙂</span>
                </div>
                <div className="info-body">
                  <h4 className="info-title">PERFIL DE USUARIO</h4>
                  <ul className="info-list">
                    <li>
                      Muestra tu <strong>identidad en Google</strong> (nombre,
                      foto, correo principal).
                    </li>
                    <li>
                      Desde aquí puedes <strong>cambiar de cuenta</strong>,
                      revisar opciones de{" "}
                      <strong>seguridad y privacidad</strong> y cerrar sesión.
                    </li>
                    <li>
                      Paso básico: haz clic en tu{" "}
                      <strong>foto o inicial</strong> y luego en{" "}
                      <em>"Gestionar tu Cuenta de Google"</em> o en{" "}
                      <strong>Cerrar sesión</strong>.
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </article>
      </main>

      {/* 🎥 VIDEO */}
      <section className="video-section">
        <h3 className="section-title inline">Video explicativo</h3>
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/qbWWy_s0iQI"
            title="Barra superior de Gmail - Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <p className="video-note">
          Puedes reemplazar este video por uno propio copiando la URL de YouTube
          en el atributo <code>src</code> del iframe.
        </p>
      </section>

      {/* 🧩 ACTIVIDADES */}
      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">3.5</span>
          Pon en práctica lo aprendido
        </h2>
        <ol>
          <li>Entra a Gmail y vuelve a la bandeja principal usando el logo.</li>
          <li>
            Busca un correo con la palabra <strong>"factura"</strong> usando la
            barra de búsqueda.
          </li>
          <li>
            Aplica el filtro <code>has:attachment</code> y observa cuántos
            correos tienen archivos adjuntos.
          </li>
          <li>
            Desde <strong>Configuración</strong>, cambia el tema de tu bandeja.
          </li>
          <li>
            Abre <strong>Google Calendar</strong> desde el menú de aplicaciones
            y revisa un evento.
          </li>
        </ol>
      </section>

      {/* ✅ QUIZ */}
      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">3.6</span>
          Quiz: Comprueba tu comprensión
        </h2>

        <form onSubmit={handleQuizSubmit} className="quiz-form">
          <div className="q">
            <label>
              1) ¿Qué elemento te regresa a la bandeja de entrada principal?
              <select name="q1" required>
                <option value="">Selecciona…</option>
                <option value="volver">Botón Atrás del navegador</option>
                <option value="logo">Logo de Gmail</option>
                <option value="perfil">Perfil de usuario</option>
              </select>
            </label>
          </div>

          <div className="q">
            <label>
              2) ¿Qué filtro muestra sólo correos con adjuntos?
              <select name="q2" required>
                <option value="">Selecciona…</option>
                <option value="has:attachment">has:attachment</option>
                <option value="with:file">with:file</option>
                <option value="attach:yes">attach:yes</option>
              </select>
            </label>
          </div>

          <div className="q">
            <label>
              3) ¿Qué icono abre otras aplicaciones de Google?
              <select name="q3" required>
                <option value="">Selecciona…</option>
                <option value="cuadricula">Cuadrícula de 9 puntos</option>
                <option value="engranaje">Engranaje</option>
                <option value="signo">Signo de interrogación</option>
              </select>
            </label>
          </div>

          <button className="btn-primary" type="submit">
            Calificar
          </button>
        </form>

        {quizAnswered && (
          <div className="quiz-result">
            <p>
              Puntaje: <strong>{quizScore} / 3</strong>
            </p>
            <p className={quizScore === 3 ? "ok" : "warn"}>
              {quizScore === 3
                ? "¡Excelente! Dominas la barra superior."
                : "Revisa las secciones y vuelve a intentarlo."}
            </p>
          </div>
        )}
      </section>

      {/* FOOTER IGUAL QUE EN 1 Y 2 */}
      <footer className="contenido-footer">
        <div className="avance-mensaje">
          {!modoLibre && !timerTerminado && (
            <p>
              ⏳ Lee con calma este contenido. El botón{" "}
              <strong>Siguiente</strong> se habilitará en{" "}
              {formatearTiempo(tiempoRestante)}.
            </p>
          )}

          {!modoLibre && timerTerminado && !scrolledBottom && (
            <p>
              👇 Desplázate hasta el final de la página para habilitar el botón{" "}
              <strong>Siguiente</strong>.
            </p>
          )}

          {puedeAvanzar && (
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