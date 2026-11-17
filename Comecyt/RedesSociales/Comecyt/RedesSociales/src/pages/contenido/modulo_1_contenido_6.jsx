import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_1_contenido_6.css";

const MODULO_ID = 1;
const NUM_CONTENIDO = 6;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function ContenidoGmailBarraYPaginacion() {
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // 🔐 control de avance
  const [tiempoRestante, setTiempoRestante] = useState(120); // 2 minutos
  const [timerTerminado, setTimerTerminado] = useState(false);
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const [gated, setGated] = useState(true);
  const [progreso, setProgreso] = useState(0);

  // 🔔 Notificaciones tipo toast
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info", // "success" | "error" | "info"
  });

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  };

  // 🧠 obtener progreso del alumno para saber si aplica timer o no
  useEffect(() => {
    const fetchProgreso = async () => {
      try {
        const correo = localStorage.getItem("correo");
        if (!correo) {
          console.error("🚨 No hay correo en localStorage");
          showToast("Inicia sesión de nuevo", "error");
          setProgresoCargado(true);
          return;
        }

        const res = await axios.post(
          `${API_URL}/api/alumno/progreso`,
          { correo }
        );

        const datosMod1 = res.data.modulos.find(
          (m) => m.modulo_id === MODULO_ID
        );
        const p = Number(datosMod1?.progreso_actual ?? 0);
        setProgreso(p);

        // 👉 regla: solo bloqueamos con timer cuando el progreso
        // aún NO ha pasado este contenido (p <= NUM_CONTENIDO)
        if (p > NUM_CONTENIDO) {
          // Ya lo superó → sin timer ni scroll obligatorio
          setGated(false);
          setTimerTerminado(true);
          setScrolledBottom(true);
        } else {
          // Viene por primera vez (o todavía no llega) → se aplica bloqueo
          setGated(true);
        }
      } catch (err) {
        console.error("Error obteniendo progreso:", err.response?.data || err);
        showToast(
          "No se pudo obtener tu progreso, pero puedes seguir leyendo.",
          "error"
        );
      } finally {
        setProgresoCargado(true);
      }
    };

    fetchProgreso();
  }, []);

  // ⏱️ Timer de 2 minutos (solo si está bloqueado)
  useEffect(() => {
    if (!gated) return; // si no hay bloqueo, no corremos el timer

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

  // 📜 Detectar si ya se scrolleó al final
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

  // 🔙 botón Anterior
  const irAnterior = () => {
    navigate("/modulo/1/contenido/5");
  };

  // ⏭️ botón Siguiente (actualiza progreso y navega)
  const irSiguiente = async () => {
    if (!puedeAvanzar) return;

    setGuardando(true);
    try {
      const correo = localStorage.getItem("correo");
      if (correo) {
        await axios.post(
          `${API_URL}/api/alumno/progreso/actualizar`,
          {
            correo,
            modulo_id: MODULO_ID,
            progreso_actual: NUM_CONTENIDO + 1, // ✅ CORREGIDO: era numero_contenido
          }
        );
        localStorage.setItem("progreso_mod1", "7");
      }
      navigate("/modulo/1/contenido/7"); // ✅ CORREGIDO: ruta nueva
    } catch (err) {
      console.error("Error al actualizar progreso:", err.response?.data || err);
      showToast(
        "No se pudo guardar tu avance, pero puedes continuar.",
        "error"
      );
      navigate("/modulo/1/contenido/7");
    } finally {
      setGuardando(false);
    }
  };

  // 📝 Quiz
  const handleQuizSubmit = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    let score = 0;
    if (form.get("q1") === "seleccion") score++;
    if (form.get("q2") === "refrescar") score++;
    if (form.get("q3") === "trespuntos") score++;
    if (form.get("q4") === "ordenar") score++;
    if (form.get("q5") === "contador") score++;
    if (form.get("q6") === "siguiente") score++;
    if (form.get("q7") === "anterior") score++;

    setQuizScore(score);
    setQuizAnswered(true);

    // 🔔 Notificación de resultado
    showToast(
      `Obtuviste ${score} de 7 respuestas correctas.`,
      score === 7 ? "success" : "info"
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
    <div className="gmailtools-container">
      {/* 🔔 TOAST GLOBAL */}
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      {/* ===== ENCABEZADO ===== */}
      <header className="gmailtools-header">
        <div className="header-inner">
          <div>
            <h1>Barra de herramientas y navegación de correos</h1>
            <p className="sub">
              Seleccionar mensajes, actualizar la bandeja y moverse entre
              páginas
            </p>
          </div>
        </div>
      </header>

      {/* ===== INTRODUCCIÓN ===== */}
      <section className="intro-card">
        <h2 className="section-title">
          <span className="section-number">6.1</span>
          ¿Para qué sirve la barra sobre la bandeja?
        </h2>
        <p>
          Encima de la lista de correos de Gmail hay una{" "}
          <strong>barra de herramientas</strong> con iconos y opciones. Desde
          allí puedes seleccionar varios mensajes, actualizarlos, aplicar
          acciones y cambiar cómo se muestran.
        </p>
        <p>
          En la esquina derecha también aparece la{" "}
          <strong>navegación de páginas</strong>, que indica cuántos correos
          estás viendo y te permite avanzar o retroceder para ver mensajes más
          antiguos.
        </p>
        <p className="hint">
          Dominar estas opciones ayuda a <strong>ahorrar tiempo</strong> y a
          mantener la bandeja <strong>ordenada</strong> sin entrar a cada
          mensaje uno por uno.
        </p>
      </section>

      {/* ===== TARJETAS ===== */}
      <main className="content-grid">
        {/* 1️⃣ Barra de herramientas sobre la bandeja */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">6.2</span>
              Barra de herramientas sobre la bandeja
            </h3>
            <p className="card-sub">
              Aparece encima de la lista de correos y permite hacer acciones
              generales.
            </p>
          </header>
          <div className="card-body">
            <div className="two-col">
              {/* texto */}
              <div>
                <h4>Elementos principales</h4>
                <ul className="lista-centrada">
                  <li>
                    <strong>Casilla de selección múltiple:</strong> sirve para
                    marcar uno o varios correos al mismo tiempo. Al seleccionar,
                    se activan botones como <em>Eliminar</em>,{" "}
                    <em>Archivar</em> o <em>Marcar como leído</em>.
                  </li>
                  <li>
                    <strong>Ícono de actualizar (refrescar):</strong> vuelve a
                    cargar la bandeja para comprobar si han llegado correos
                    nuevos o si hubo cambios.
                  </li>
                  <li>
                    <strong>Más opciones (tres puntos verticales):</strong>{" "}
                    abre un menú con acciones adicionales, como{" "}
                    <em>Marcar como importante</em>, <em>Bloquear</em> o{" "}
                    <em>Reportar spam</em>.
                  </li>
                  <li>
                    <strong>Opciones de ordenamiento y filtrado:</strong>{" "}
                    permiten mostrar primero los no leídos, ver solo mensajes
                    con archivos adjuntos o cambiar la forma en que se organiza
                    la lista.
                  </li>
                </ul>
                <p className="hint">
                  Enséñales a los alumnos que no todo se hace dentro del correo:
                  muchas tareas se realizan desde esta barra.
                </p>
              </div>

              {/* simulación visual */}
              <figure className="media">
                <div className="image-mock toolbar-mock">
                  <div className="toolbar-left">
                    <span className="checkbox-square">☐</span>
                    <span className="toolbar-icon">⟳</span>
                    <span className="toolbar-icon">⋮</span>
                  </div>
                  <div className="toolbar-right">
                    <span className="toolbar-pill">Ordenar</span>
                    <span className="toolbar-pill">Solo no leídos</span>
                  </div>
                </div>
                <figcaption>
                  Representación simplificada de la barra sobre la bandeja de
                  entrada.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>

        {/* 2️⃣ Navegación de correos (paginación) */}
        <article className="card">
          <header className="card-head">
            <h3 className="section-title inline">
              <span className="section-number">6.3</span>
              Navegación de correos (paginación)
            </h3>
            <p className="card-sub">
              Cuando hay muchos correos, Gmail los muestra en varias páginas.
            </p>
          </header>
          <div className="card-body">
            <div className="two-col">
              {/* texto */}
              <div>
                <h4>Elementos de la navegación</h4>
                <ul className="lista-centrada">
                  <li>
                    <strong>Contador de correos:</strong> indica qué correos
                    estás viendo, por ejemplo <em>1–50 de 216</em>. Los primeros
                    números son la página actual; el último es el total de
                    mensajes.
                  </li>
                  <li>
                    <strong>Flechas de navegación:</strong> permiten ir a la
                    página siguiente o anterior. La flecha derecha muestra
                    correos más nuevos o más viejos según el orden actual; la
                    izquierda regresa a la página anterior.
                  </li>
                </ul>
                <p className="hint">
                  Es útil para mostrar a los alumnos que, aunque no vean todos
                  los correos en pantalla, <strong>siguen allí</strong> y se
                  pueden recorrer por páginas.
                </p>
              </div>

              {/* simulación visual */}
              <figure className="media">
                <div className="image-mock pagination-mock">
                  <span className="page-text">1–50 de 216</span>
                  <div className="page-buttons">
                    <button type="button" className="page-btn">
                      ◀️
                    </button>
                    <button type="button" className="page-btn">
                      ▶️
                    </button>
                  </div>
                </div>
                <figcaption>
                  Ejemplo del contador y las flechas para moverse entre páginas
                  de correos.
                </figcaption>
              </figure>
            </div>
          </div>
        </article>
      </main>

      {/* ===== ACTIVIDAD ===== */}
      <section className="activities">
        <h2 className="section-title inline">
          <span className="section-number">6.4</span>
          Actividad práctica del módulo
        </h2>
        <ol>
          <li>
            Abre tu bandeja de entrada en Gmail y localiza la{" "}
            <strong>casilla de selección múltiple</strong>.
          </li>
          <li>
            Selecciona 3 correos y marca todos como{" "}
            <strong>leídos o no leídos</strong> desde la barra superior.
          </li>
          <li>
            Haz clic en el ícono de <strong>actualizar</strong> y verifica si
            aparecen cambios nuevos.
          </li>
          <li>
            Abre el menú de <strong>tres puntos</strong> y revisa qué opciones
            adicionales muestra (no es necesario aplicar ninguna).
          </li>
          <li>
            Observa el texto del <strong>contador</strong> (por ejemplo:
            1–50 de 216) y explica qué significa.
          </li>
          <li>
            Usa las <strong>flechas</strong> para ir a la página siguiente y
            luego regresa a la anterior.
          </li>
        </ol>
      </section>

      {/* ===== QUIZ ===== */}
      <section className="quiz">
        <h2 className="section-title inline">
          <span className="section-number">6.5</span>
          Quiz: Barra de herramientas y navegación
        </h2>

        <form className="quiz-form" onSubmit={handleQuizSubmit}>
          <div className="q">
            <label>
              1) ¿Para qué sirve la casilla de selección múltiple?
              <select name="q1" required>
                <option value="">Selecciona…</option>
                <option value="abrir">Abrir un solo correo</option>
                <option value="seleccion">
                  Marcar varios correos al mismo tiempo
                </option>
                <option value="buscar">Buscar correos</option>
              </select>
            </label>
          </div>

          <div className="q">
            <label>
              2) ¿Qué hace el ícono de actualizar?
              <select name="q2" required>
                <option value="">Selecciona…</option>
                <option value="borrar">Borra todos los correos</option>
                <option value="refrescar">
                  Vuelve a cargar la bandeja para ver cambios nuevos
                </option>
                <option value="enviar">
                  Envía los correos que están en borradores
                </option>
              </select>
            </label>
          </div>

          <div className="q">
            <label>
              3) El botón de tres puntos verticales sirve para…
              <select name="q3" required>
                <option value="">Selecciona…</option>
                <option value="trespuntos">
                  Ver más opciones como marcar importante o bloquear
                </option>
                <option value="adjuntar">Adjuntar archivos</option>
                <option value="responder">Responder al correo</option>
              </select>
            </label>
          </div>

          <div className="q">
            <label>
              4) ¿Qué permiten hacer las opciones de ordenamiento y filtrado?
              <select name="q4" required>
                <option value="">Selecciona…</option>
                <option value="ordenar">
                  Cambiar cómo se muestran los correos (no leídos primero, con
                  adjuntos, etc.)
                </option>
                <option value="cambiar-tema">Cambiar el fondo de Gmail</option>
                <option value="cerrar-sesion">
                  Cerrar sesión en la cuenta
                </option>
              </select>
            </label>
          </div>

          <div className="q">
            <label>
              5) ¿Qué indica el texto “1–50 de 216”?
              <select name="q5" required>
                <option value="">Selecciona…</option>
                <option value="contador">
                  Que estás viendo los correos 1 al 50 de un total de 216
                </option>
                <option value="hora">La hora del último correo</option>
                <option value="tamano">
                  El tamaño de los archivos adjuntos
                </option>
              </select>
            </label>
          </div>

          <div className="q">
            <label>
              6) ¿Para qué sirve la flecha derecha de navegación?
              <select name="q6" required>
                <option value="">Selecciona…</option>
                <option value="anterior">Ir a la página anterior</option>
                <option value="siguiente">Ir a la página siguiente</option>
                <option value="inicio">Volver al inicio de Gmail</option>
              </select>
            </label>
          </div>

          <div className="q">
            <label>
              7) ¿Qué hace la flecha izquierda de navegación?
              <select name="q7" required>
                <option value="">Selecciona…</option>
                <option value="notificaciones">
                  Abrir la bandeja de notificaciones
                </option>
                <option value="siguiente">Ir a la página siguiente</option>
                <option value="anterior">Regresar a la página anterior</option>
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
                ? "¡Excelente! Manejas muy bien la barra de herramientas y la navegación."
                : "Puedes repasar las tarjetas y volver a intentarlo."}
            </p>
          </div>
        )}
      </section>

      {/* ===== FOOTER AVANCE ===== */}
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
            Anterior
          </button>
          <button
            className="btn-siguiente"
            onClick={irSiguiente}
            disabled={!puedeAvanzar || guardando}
          >
            {guardando ? "Guardando..." : "Siguiente"}
          </button>
        </div>
      </footer>
    </div>
  );
}