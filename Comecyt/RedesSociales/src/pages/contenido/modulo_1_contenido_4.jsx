// src/components/contenidos/modulo_1_contenido_4.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_1_contenido_4.css";

import redactarImg from "../../assets/redactarImg.png";
//import formatoImg from "../../assets/formatoImg.png";

const MODULO_ID = 1;
const NUM_CONTENIDO = 4;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ContenidoGmailPanelYRedaccion() {
  // ---- estados generales ----
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const [tiempoRestante, setTiempoRestante] = useState(120);
  const [timerTerminado, setTimerTerminado] = useState(false);
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const [saltarseRestricciones, setSaltarseRestricciones] = useState(false);

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
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido4");
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

        const mod1 = modulosData.find((m) => m.modulo_id === MODULO_ID);

        if (mod1) {
          setTotalContenidos(mod1.total_contenidos); // 👈 NUEVO
          if (mod1.progreso_actual >= NUM_CONTENIDO) {
            setSaltarseRestricciones(true);
            setTimerTerminado(true);
            setScrolledBottom(true);
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

  // ================== TIMER 2 MIN ==================
  useEffect(() => {
    if (!progresoCargado) return;
    if (saltarseRestricciones) return;

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
  }, [saltarseRestricciones, progresoCargado]);

  // ================== SCROLL AL FINAL ==================
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

  const puedeAvanzar = (saltarseRestricciones || timerTerminado) && scrolledBottom;

  const formatearTiempo = (segundos) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ================== NAVEGACIÓN ==================
  const irAnterior = () => {
    navigate("/modulo/1/contenido/3");
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  // ================== QUIZ ==================
  const handleQuizSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    let score = 0;
    if (form.get("q1") === "recibidos") score++;
    if (form.get("q2") === "asunto") score++;
    if (form.get("q3") === "clip") score++;
    if (form.get("q4") === "borradores") score++;
    if (form.get("q5") === "listas") score++;
    if (form.get("q6") === "cco") score++;
    if (form.get("q7") === "spam") score++;

    setQuizScore(score);
    setQuizAnswered(true);

    showToast(
      `Obtuviste ${score} de 7 respuestas correctas.`,
      score === 7 ? "success" : "info"
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

  // ================== JSX ==================


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
    <div className="gmailpanel-container">
      {/* 🔔 TOAST GLOBAL */}
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      {/* ===== ENCABEZADO ===== */}
      <header className="gmailpanel-header">
        <div className="header-inner">
          <div>
            <h1>Panel lateral y redacción de correos en Gmail</h1>
            <p className="sub">
              Botón Redactar, formato del mensaje y carpetas principales
            </p>
          </div>
        </div>
      </header>

      {/* ===== INTRODUCCIÓN ===== */}
      <section className="intro-card">
        <h2 className="section-title">
          <span className="section-number">4.1</span>
          Uso del correo electrónico
        </h2>
        <p>
          El correo electrónico es una herramienta que permite enviar y recibir
          mensajes por internet de manera rápida y segura. Gmail es uno de los
          servicios de correo más usados en el mundo por su facilidad y por
          todas las funciones que ofrece.
        </p>
      </section>

      {/* ===== CONTENIDO PRINCIPAL (TARJETAS) ===== */}
      <main className="content-grid">
        {/* 1️⃣ Panel lateral izquierdo */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">4.2</span>
              Panel lateral izquierdo
            </h3>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <p className="card-sub">
                  Es la zona donde encuentras las opciones principales para
                  manejar tu correo.
                </p>
                <h4>¿Qué hay en el panel?</h4>
                <ul className="lista-centrada">
                  <li>
                    <strong>Recibidos:</strong> correos que te llegan.{" "}
                  </li>
                  <li>
                    <strong>Enviados:</strong> correos que has enviado.{" "}
                  </li>
                  <li>
                    <strong>Borradores:</strong> mensajes sin terminar.
                  </li>
                  <li>
                    <strong>Spam:</strong> correos sospechosos o no deseados.{" "}
                  </li>
                  <li>
                    <strong>Papelera:</strong> mensajes eliminados.
                  </li>
                  <li>
                    <strong>Redactar:</strong> botón para crear un correo nuevo.{" "}
                  </li>
                </ul>
                <p className="hint">
                  Si no encuentras un correo, revisa también{" "}
                  <strong>Spam</strong> y <strong>Papelera</strong>.
                </p>
              </div>

              <figure className="media">
                <div className="image-mock">
                  <p>
                    <strong>✉ Redactar</strong>
                  </p>
                  <p>📥 Recibidos</p>
                  <p>📤 Enviados</p>
                  <p>📝 Borradores</p>
                  <p>🚫 Spam</p>
                  <p>🗑 Papelera</p>
                </div>
                <figcaption>
                  Representación simplificada del panel lateral izquierdo.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>

        {/* 2️⃣ Botón Redactar */}
        <article className="card card-compose">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">4.3</span>
              Botón "Redactar" (crear un correo nuevo)
            </h3>
          </header>

          <div className="card-body">
            <div className="two-col two-col-compose">
              <div className="compose-copy">
                <h4>Campos principales</h4>
                <ul className="lista-centrada">
                  <li>
                    <strong>Para:</strong> correo del destinatario.
                  </li>
                  <li>
                    <strong>CC:</strong> copia visible para otras personas.
                  </li>
                  <li>
                    <strong>CCO:</strong> copia oculta (nadie lo ve).
                  </li>
                  <li>
                    <strong>Asunto:</strong> título corto del mensaje.
                  </li>
                  <li>
                    <strong>Cuerpo del mensaje:</strong> texto principal.
                  </li>
                </ul>

                <p className="hint">
                  Un <strong>buen asunto</strong> ayuda a que la otra persona
                  entienda el mensaje sin abrirlo.
                </p>
              </div>

              <figure className="compose-figure">
                <div className="compose-frame">
                  <img
                    src={redactarImg}
                    alt="Ventana de redacción"
                    className="compose-image"
                  />
                </div>
                <figcaption>Ejemplo de la ventana de redacción.</figcaption>
              </figure>
            </div>
          </div>
        </article>

        {/* 3️⃣ Opciones de formato */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">4.4</span>
              Opciones de formato
            </h3>
            <p className="card-sub">
              Sirven para darle estilo al texto y que sea más fácil de leer.
            </p>
          </header>

          <div className="card-body">
            <div className="two-col-2">
              <div>
                <h4>Estilos básicos</h4>
                <ul className="lista-centrada">
                  <li>
                    <strong>Negritas:</strong> Destacar palabras importantes.
                  </li>
                  <li>
                    <strong>Cursivas:</strong> Marcar ideas o citas.
                  </li>
                  <li>
                    <strong>Subrayado:</strong> Enfatizar algo importante.
                  </li>
                  <li>
                    <strong>Color de fuente:</strong> Cambiar el color del
                    texto.
                  </li>
                  <li>
                    <strong>Resaltado:</strong> Fondo como marcador.
                  </li>
                  <li>
                    <strong>Alineación:</strong> Izquierda, centro o derecha.
                  </li>
                  <li>
                    <strong>Listas:</strong> Viñetas o listas numeradas.
                  </li>
                </ul>
              </div>

              <div>
                <h4>Herramientas adicionales</h4>
                <ul className="lista-centrada">
                  <li>
                    📎 <strong>Adjuntar archivos:</strong> subir documentos,
                    fotos, PDFs, etc.
                  </li>
                  <li>
                    🔗 <strong>Insertar enlace:</strong> agregar direcciones web
                    clicables.
                  </li>
                  <li>
                    😊 <strong>Emoticonos:</strong> insertar caritas y símbolos.
                  </li>
                  <li>
                    🟩 <strong>Google Drive:</strong> añadir archivos
                    almacenados en Drive.
                  </li>
                  <li>
                    🖼 <strong>Insertar imágenes:</strong> poner fotos dentro
                    del mensaje.
                  </li>
                </ul>
                <p className="hint">
                  Ejemplo: enviar un correo con un <strong>PDF adjunto</strong>{" "}
                  y un <strong>enlace</strong> a una página web.
                </p>
              </div>
            </div>
          </div>

          <div>
            <figure className="compose-figure">
              <div className="compose-frame">
                
              </div>
              <figcaption>Ejemplo del formato en Gmail.</figcaption>
            </figure>
          </div>
        </article>

        {/* 5️⃣ Acciones finales + carpetas */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">4.5</span>
              Acciones finales
            </h3>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <ul className="lista-centrada">
                  <li>
                    <strong>Enviar:</strong> manda el correo inmediatamente.
                  </li>
                  <li>
                    <strong>Programar envío:</strong> elegir día y hora para
                    enviarlo.
                  </li>
                  <li>
                    <strong>Guardar como borrador:</strong> guardar el correo
                    para terminarlo después.
                  </li>
                </ul>
              </div>
              <figure className="media">
                <div className="image-mock">
                  <p>
                    📤 <strong>Enviar</strong>
                  </p>
                  <p>⏰ Programar envío</p>
                  <p>📝 Guardar como borrador</p>
                </div>
                <figcaption>
                  Ejemplo: Opciones de envío antes de salir del correo.
                </figcaption>
              </figure>
            </div>

            <p className="hint">
              Actividad: redacta un correo y en lugar de enviarlo,{" "}
              <strong>guárdalo como borrador</strong>. Luego entra a{" "}
              <strong>Borradores</strong> y termina el mensaje antes de
              enviarlo.
            </p>
          </div>
        </article>
      </main>

      {/* 🎥 VIDEO - CORREGIDO */}
      <section className="video-section">
        <h3 className="section-title inline">Video explicativo</h3>
        <div className="video-wrapper" style={{
          position: 'relative',
          paddingBottom: '56.25%',
          height: 0,
          overflow: 'hidden',
          maxWidth: '800px',
          margin: '20px auto',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <iframe
            src="https://www.youtube.com/embed/qbWWy_s0iQI"
            title="Barra superior de Gmail - Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: '12px'
            }}
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
          <span className="section-number">4.5</span>
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
          <span className="section-number">4.6</span>
          Quiz: Comprueba lo aprendido
        </h2>

        <form onSubmit={handleQuizSubmit} className="quiz-form">
          <div className="q">
            <label>
              1) ¿En qué carpeta se guardan los mensajes que te llegan?
              <select name="q1" required>
                <option value="">Selecciona…</option>
                <option value="enviados">Enviados</option>
                <option value="recibidos">Recibidos</option>
                <option value="borradores">Borradores</option>
              </select>
            </label>
          </div>

          <div className="q">
            <label>
              2) ¿Qué campo del correo sirve como título del mensaje?
              <select name="q2" required>
                <option value="">Selecciona…</option>
                <option value="para">Para</option>
                <option value="asunto">Asunto</option>
                <option value="cuerpo">Cuerpo del mensaje</option>
              </select>
            </label>
          </div>

          <div className="q">
            <label>
              3) ¿Qué herramienta utilizas para adjuntar archivos?
              <select name="q3" required>
                <option value="">Selecciona…</option>
                <option value="emoticonos">Emoticonos</option>
                <option value="clip">Ícono de clip</option>
                <option value="borrador">Guardar como borrador</option>
              </select>
            </label>
          </div>

          <div className="q">
            <label>
              4) ¿En qué carpeta se guardan los correos sin terminar?
              <select name="q4" required>
                <option value="">Selecciona…</option>
                <option value="recibidos">Recibidos</option>
                <option value="borradores">Borradores</option>
                <option value="spam">Spam</option>
              </select>
            </label>
          </div>

          <div className="q">
            <label>
              5) ¿Qué opción sirve para organizar información en puntos o
              números?
              <select name="q5" required>
                <option value="">Selecciona…</option>
                <option value="alineacion">Alineación</option>
                <option value="color">Color de texto</option>
                <option value="listas">Listas</option>
              </select>
            </label>
          </div>

          <div className="q">
            <label>
              6) ¿Qué campo permite enviar una copia oculta a alguien?
              <select name="q6" required>
                <option value="">Selecciona…</option>
                <option value="cc">CC</option>
                <option value="cco">CCO</option>
                <option value="para">Para</option>
              </select>
            </label>
          </div>

          <div className="q">
            <label>
              7) ¿Dónde suelen ir a parar los correos sospechosos?
              <select name="q7" required>
                <option value="">Selecciona…</option>
                <option value="papelera">Papelera</option>
                <option value="spam">Spam</option>
                <option value="recibidos">Recibidos</option>
              </select>
            </label>
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
                ? "¡Excelente! Dominas por completo este módulo 💪📧"
                : "Puedes repasar las tarjetas del módulo y volver a intentarlo 😉"}
            </p>
          </div>
        )}
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="contenido-footer">
        <div className="avance-mensaje">
          {!saltarseRestricciones && !timerTerminado && (
            <p>
              ⏳ Lee con calma este contenido. El botón{" "}
              <strong>Siguiente</strong> se habilitará en{" "}
              {formatearTiempo(tiempoRestante)}.
            </p>
          )}

          {!saltarseRestricciones && timerTerminado && !scrolledBottom && (
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
