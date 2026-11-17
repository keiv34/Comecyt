// src/components/contenidos/modulo_1_contenido_5.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_1_contenido_5.css";

const API_URL = "http://localhost:4000";
const MODULO_ID = 1;
const NUM_CONTENIDO = 5;

export default function ContenidoGmailCategoriasEtiquetas() {
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // ⏱️ control de avance
  const [tiempoRestante, setTiempoRestante] = useState(120);
  const [timerTerminado, setTimerTerminado] = useState(false);
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const [gated, setGated] = useState(true); // ¿aplicamos bloqueo o no?

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
    console.log("🔥 SÍ ENTRA AL COMPONENTE Contenido5");
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

        const resp = await axios.post(`${API_URL}/api/alumno/progreso`, { correo });
        const modulosData = resp.data.modulos || [];
        setModulos(modulosData); // 👈 NUEVO

        const mod1 = modulosData.find((m) => m.modulo_id === MODULO_ID);

        if (mod1) {
          setTotalContenidos(mod1.total_contenidos); // 👈 NUEVO
          const prog = Number(mod1.progreso_actual || 0);

          if (prog >= NUM_CONTENIDO) {
            setGated(false);
            setTimerTerminado(true);
            setScrolledBottom(true);
          } else {
            setGated(true);
          }
        }
      } catch (err) {
        console.error("Error al obtener progreso:", err);
        showToast("No se pudo obtener tu progreso, pero puedes seguir leyendo.", "error");
      }
    };

    // al entrar, subimos hasta arriba
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    fetchProgreso();
  }, []);

  // ⏱️ Timer de 2 minutos SOLO si gated = true
  useEffect(() => {
    if (!gated) return; // sin bloqueo, no corremos timer

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

  // 📜 detectar scroll al final SOLO si gated = true
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

  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/modulo/1/contenido/4");
  };

  // ✅ CAMBIO 3: irSiguiente con fix para último contenido
  const handleQuizSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    let score = 0;
    if (form.get("q1") === "importantes") score++;
    if (form.get("q2") === "programados") score++;
    if (form.get("q3") === "todos") score++;
    if (form.get("q4") === "nueva-etiqueta") score++;
    if (form.get("q5") === "gest-etiquetas") score++;
    if (form.get("q6") === "promociones") score++;
    if (form.get("q7") === "notificaciones") score++;

    setQuizScore(score);
    setQuizAnswered(true);

    showToast(
      `Obtuviste ${score} de 7 respuestas correctas.`,
      score === 7 ? "success" : "info"
    );
  };

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
    <div className="gmailcats-container">
      {/* 🔔 TOAST GLOBAL */}
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      {/* ===== ENCABEZADO ===== */}
      <header className="gmailcats-header">
        <div className="header-inner">
          <div>
            <h1>Categorías y etiquetas en Gmail</h1>
            <p className="sub">
              Aprende a organizar tus correos con secciones y etiquetas
            </p>
          </div>
        </div>
      </header>

      {/* ===== INTRODUCCIÓN ===== */}
      <section className="intro-card">
        <h2 className="section-title">
          <span className="section-number">5.1</span>
          ¿Por qué usar categorías y etiquetas?
        </h2>
        <p>
          A medida que recibimos más mensajes, es fácil perder correos
          importantes entre notificaciones, publicidad y redes sociales. Gmail
          usa <strong>categorías</strong> y <strong>etiquetas</strong> para
          mantener la bandeja ordenada y permitirte encontrar tus mensajes con
          rapidez.
        </p>
        <p>
          Las <strong>categorías</strong> como{" "}
          <em>Promociones, Social o Notificaciones</em> ayudan a separar tipos
          de correos automáticamente. Las <strong>etiquetas</strong> (como
          "Escuela" o "Trabajo") las puedes crear tú para agrupar mensajes según
          tus necesidades.
        </p>
      </section>

      {/* ===== TARJETAS PRINCIPALES ===== */}
      <main className="content-grid">
        {/* 1️⃣ Categorías básicas del panel */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">5.2</span>
              Categorías básicas del panel
            </h3>
            <p className="card-sub">
              Estas opciones aparecen en el panel izquierdo y ayudan a ver los
              correos según su importancia o estado.
            </p>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <h4>¿Para qué sirve cada una?</h4>
                <ul className="lista-centrada">
                  <li>
                    <strong>Importantes:</strong> Gmail marca aquí mensajes que
                    considera relevantes (personas con las que hablas seguido,
                    temas frecuentes, etc.).
                  </li>
                  <li>
                    <strong>Programados:</strong> correos que ya redactaste,
                    pero que se enviarán más tarde en la fecha y hora que tú
                    elegiste.
                  </li>
                  <li>
                    <strong>Todos:</strong> muestra una lista de todos los
                    correos, incluyendo archivados. Es útil cuando no recuerdas
                    en qué carpeta está un mensaje.
                  </li>
                </ul>
              </div>

              <figure className="media">
                <div className="image-mock mock-list">
                  <p>⭐ Importantes</p>
                  <p>⏰ Programados</p>
                  <p>📩 Todos</p>
                </div>
                <figcaption>
                  Ejemplo de cómo se ven estas opciones en el panel izquierdo.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>

        {/* 2️⃣ Categorías automáticas */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">5.3</span>
              Categorías automáticas
            </h3>
            <p className="card-sub">
              Gmail clasifica algunos correos de forma automática para que la
              bandeja principal no se llene de avisos y publicidad.
            </p>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <h4>¿Qué incluye cada categoría?</h4>
                <ul className="lista-centrada">
                  <li>
                    <strong>Promociones:</strong> correos de tiendas, ofertas,
                    cupones, publicidad y boletines.
                  </li>
                  <li>
                    <strong>Social:</strong> notificaciones de redes sociales
                    como Facebook, Instagram, TikTok, YouTube, etc.
                  </li>
                  <li>
                    <strong>Notificaciones:</strong> alertas de compras, accesos
                    a cuentas, recordatorios y avisos automáticos.
                  </li>
                </ul>
              </div>

              <figure className="media">
                <div className="image-mock tabs-mock">
                  <div className="tabs-row">
                    <span className="tab tab-active">Principal</span>
                    <span className="tab">Social</span>
                    <span className="tab">Promociones</span>
                    <span className="tab">Notificaciones</span>
                  </div>
                  <p className="tabs-text">
                    Cada pestaña agrupa un tipo de correo diferente.
                  </p>
                </div>
                <figcaption>
                  Representación de las pestañas de categorías encima de los
                  correos.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>

        {/* 3️⃣ Etiquetas personalizadas */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">5.5</span>
              Etiquetas: crear tus propias categorías
            </h3>
            <p className="card-sub">
              Las etiquetas funcionan como carpetas que tú misma puedes
              inventar: Escuela, Trabajo, Recibos, Proyectos, etc.
            </p>
          </header>
          <div className="card-body">
            <div className="two-col">
              <div>
                <h4>Opciones principales</h4>
                <ul className="lista-centrada">
                  <li>
                    <strong>Gestionar etiquetas:</strong> abre una ventana donde
                    puedes ver todas las etiquetas, ocultarlas, cambiar nombres
                    o eliminarlas.
                  </li>
                  <li>
                    <strong>Nueva etiqueta:</strong> te permite crear una
                    carpeta nueva con el nombre que tú quieras.
                  </li>
                </ul>

                <h4>¿Cómo crear y usar una etiqueta?</h4>
                <ol className="steps-list">
                  <li>
                    Haz clic en <strong>+ Nueva etiqueta</strong>.
                  </li>
                  <li>
                    Escribe un nombre, por ejemplo <strong>Escuela</strong>.
                  </li>
                  <li>
                    Abre un correo y usa el botón de <strong>Etiqueta</strong>{" "}
                    para asignarlo a esa carpeta.
                  </li>
                </ol>
                <p className="hint">
                  Actividad sugerida: crear la etiqueta{" "}
                  <strong>"Tareas"</strong> y mover ahí los correos de la
                  escuela.
                </p>
              </div>

              <figure className="media">
                <div className="image-mock labels-mock">
                  <p>📂 Escuela</p>
                  <p>📂 Trabajo</p>
                  <p>📂 Pagos</p>
                  <p>＋ Nueva etiqueta…</p>
                </div>
                <figcaption>
                  Ejemplo de etiquetas personalizadas en el panel izquierdo.
                </figcaption>
              </figure>
            </div>
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
          <span className="section-number">5.6</span>
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
          <span className="section-number">5.7</span>
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
                ? "¡Excelente! Manejas muy bien categorías y etiquetas en Gmail."
                : "Puedes repasar las tarjetas del módulo y volver a intentarlo."}
            </p>
          </div>
        )}
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="contenido-footer">
        <div className="avance-mensaje">
          {gated && !timerTerminado && (
            <p>
              ⏳ Lee con calma este contenido. El botón{" "}
              <strong>Siguiente</strong> se habilitará en{" "}
              {formatearTiempo(tiempoRestante)}.
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