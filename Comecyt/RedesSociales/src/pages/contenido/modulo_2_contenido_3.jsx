// src/pages/contenido/modulo_1_contenido_11.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../Css/modulo_2_contenido_3.css";

import gruposImg from "../../assets/gruposImg.png";
import paginasImg from "../../assets/paginasImg.png";
import eventosImg from "../../assets/eventosImg.png";

const API_URL = import.meta.env.VITE_API_URL
const MODULO_ID = 2; // ✅ CORREGIDO: era 2
const NUM_CONTENIDO = 3;

export default function ModuloFacebookGruposPaginasEventos() {
  // 🔔 Notificaciones tipo toast
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  // ⏱️ control de avance
  const [tiempoRestante, setTiempoRestante] = useState(120);
  const [timerTerminado, setTimerTerminado] = useState(false);
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const [gated, setGated] = useState(true);
  const [progreso, setProgreso] = useState(0);

  // ✅ STATES AGREGADOS PARA FIX
  const [guardando, setGuardando] = useState(false);
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [totalContenidos, setTotalContenidos] = useState(6);

  const navigate = useNavigate();

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, 2500);
  };

  // 👉 cargar progreso para saber si aplicar bloqueo
  useEffect(() => {
    const fetchProgreso = async () => {
      try {
        const correo = localStorage.getItem("correo");
        const token = localStorage.getItem("token");
        if (!correo || !token) return;

        const resp = await axios.post(
          `${API_URL}/api/alumno/progreso`,
          { correo },
          { headers: { Authorization: `Bearer ${token}` } }
        );

       if (modulo) {
    setTotalContenidos(modulo.total_contenidos);
}

const p = Number(modulo?.progreso_actual ?? 0);

        const p = Number(modulo1?.progreso_actual ?? 0);
        setProgreso(p);
        setProgresoCargado(true);

        if (p > NUM_CONTENIDO) {
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
      } catch (err) {
        console.error("Error obteniendo progreso:", err);
        setProgresoCargado(true);
      }
    };

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    fetchProgreso();
  }, []);

  // ⏱️ Timer de 2 minutos SOLO si gated = true
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

  // 🔙 Anterior
  const irAnterior = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate("/contenidos/mod1_10");
  };

  // ✅ FUNCIÓN CORREGIDA - Ahora sí avanza al contenido 12
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
    <div className="fb-func-container">
      {/* 🔔 TOAST GLOBAL */}
      {toast.visible && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      {/* ===== ENCABEZADO ===== */}
      <header className="fb-func-header">
        <div className="fb-func-header-inner">
          <h1>Grupos, páginas y eventos en Facebook</h1>
          <p className="sub">
            Aprende a usar Facebook para crear comunidades, representar
            negocios o proyectos y organizar actividades con otras personas.
          </p>
        </div>
      </header>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main>
        <section className="content-grid">
          {/* 3.1 Grupos y comunidades */}
          <article className="card">
            <header className="card-head">
              <h2 className="section-title inline">
                <span className="section-number">3.1</span>
                Grupos y comunidades
              </h2>
            </header>
            <div className="card-body">
              <div className="two-col">
                <div>
                  <h3>¿Para qué sirven los grupos?</h3>
                  <p>
                    Un grupo de Facebook funciona como una{" "}
                    <strong>comunidad digital</strong>. Sirve para estudiar con
                    compañeros, organizar actividades de la escuela, compartir
                    noticias de un barrio o seguir un tema específico.
                  </p>
                  <h4>Creación de grupos</h4>
                  <p>
                    Cualquier usuario puede crear un grupo y decidir quién puede
                    entrar y participar.
                  </p>
                  <ul className="card-body">
                    <li>
                      En el menú de Facebook, haz clic en{" "}
                      <strong>Grupos</strong>.
                    </li>
                    <li>
                      Selecciona <strong>Crear grupo</strong>.
                    </li>
                    <li>
                      Escribe el <strong>nombre del grupo</strong> y elige el{" "}
                      <strong>nivel de privacidad</strong> (público o privado).
                    </li>
                    <li>
                      Agrega a tus miembros e incluye una{" "}
                      <strong>descripción</strong>.
                    </li>
                  </ul>

                  <h4>Tipos de grupos</h4>
                  <ul className="card-body">
                    <li>
                      <strong>Públicos:</strong> cualquier persona puede
                      encontrarlos y ver las publicaciones.
                    </li>
                    <li>
                      <strong>Privados:</strong> solo los miembros ven las
                      publicaciones; se debe enviar solicitud para entrar.
                    </li>
                  </ul>
                </div>

                <figure className="media-side">
                  <img src={gruposImg} className="side-image" alt="Grupos en Facebook" />
                </figure>
              </div>
              <h4>Interacción dentro de los grupos</h4>
              <p>
                Dentro de un grupo puedes publicar texto, fotos, enlaces,
                encuestas y archivos. También puedes reaccionar, comentar y
                participar en debates. Los administradores moderan el contenido
                y aceptan o rechazan nuevas solicitudes.
              </p>
            </div>
          </article>

          {/* 3.2 Páginas de Facebook */}
          <article className="card">
            <header className="card-head">
              <h2 className="section-title inline">
                <span className="section-number">3.2</span>
                Páginas de Facebook
              </h2>
              <p className="card-sub">
                Las páginas representan negocios, marcas, proyectos o figuras
                públicas y permiten llegar a muchas personas.
              </p>
            </header>

            <div className="card-body">
              <div className="two-col">
                <div>
                  <h3>¿Qué es una página de Facebook?</h3>
                  <p>
                    Una página es diferente a un perfil personal: está pensada
                    para <strong>organizaciones, comercios, escuelas, marcas</strong>{" "}
                    o <strong>personas públicas</strong> que quieren compartir
                    información con una audiencia amplia.
                  </p>

                  <h4>Creación de una página</h4>
                  <ol className="steps-list">
                    <li>
                      En el menú, haz clic en <strong>Páginas</strong>.
                    </li>
                    <li>
                      Selecciona <strong>Crear nueva página</strong>.
                    </li>
                    <li>
                      Escribe el <strong>nombre</strong>, elige una{" "}
                      <strong>categoría</strong> y agrega una{" "}
                      <strong>descripción</strong> corta.
                    </li>
                    <li>
                      Añade una <strong>foto de perfil</strong> y una{" "}
                      <strong>imagen de portada</strong>.
                    </li>
                  </ol>

                  <h4>Administración de páginas</h4>
                  <ul>
                    <li>
                      Publicar noticias, promociones o avisos importantes.
                    </li>
                    <li>
                      Responder mensajes y comentarios.
                    </li>
                    <li>
                      Asignar <strong>roles</strong> (administrador, editor,
                      moderador).
                    </li>
                  </ul>

                  <h4>Publicidad y estadísticas</h4>
                  <p>
                    Desde una página se pueden crear{" "}
                    <strong>anuncios pagados</strong> y ver{" "}
                    <strong>estadísticas</strong> de alcance e interacciones.
                  </p>
                </div>

                <figure className="media-side">
                  <img
                    src={paginasImg}
                    alt="Ejemplo de página de Facebook para un negocio o proyecto."
                    className="side-image"
                  />
                  <figcaption>
                    Ejemplo de página con foto, botón de contacto y publicaciones.
                  </figcaption>
                </figure>
              </div>
            </div>
          </article>

          {/* 3.3 Eventos */}
          <article className="card">
            <header className="card-head">
              <h2 className="section-title inline">
                <span className="section-number">3.3</span>
                Eventos en Facebook
              </h2>
              <p className="card-sub">
                Los eventos sirven para organizar reuniones, clases, talleres o
                actividades en línea o presenciales.
              </p>
            </header>

            <div className="card-body">
              <div className="two-col">
                <div>
                  <h3>¿Para qué sirven los eventos?</h3>
                  <p>
                    Un evento permite invitar a otras personas a una actividad
                    específica: reunión, conferencia, kermés o curso.
                  </p>

                  <h4>Pasos para crear un evento</h4>
                  <ol className="steps-list">
                    <li>
                      En el menú, entra a <strong>Eventos</strong>.
                    </li>
                    <li>
                      Haz clic en <strong>Crear evento</strong>.
                    </li>
                    <li>
                      Elige si será <strong>público</strong> o{" "}
                      <strong>privado</strong>.
                    </li>
                    <li>
                      Escribe <strong>nombre</strong>, <strong>fecha/hora</strong>, y{" "}
                      <strong>ubicación</strong>.
                    </li>
                    <li>
                      Agrega <strong>imagen</strong> y <strong>descripción</strong>.
                    </li>
                  </ol>

                  <h4>Invitaciones y confirmación</h4>
                  <ul>
                    <li>
                      Puedes invitar amigos, miembros de grupo o seguidores.
                    </li>
                    <li>
                      Las personas marcan <strong>Asistirán</strong>,{" "}
                      <strong>Interesadas</strong> o <strong>No asistirán</strong>.
                    </li>
                    <li>
                      El organizador puede enviar recordatorios y avisos.
                    </li>
                  </ul>
                </div>

                <figure className="media-side">
                  <img
                    src={eventosImg}
                    alt="Ejemplo de evento creado en Facebook"
                    className="side-image"
                  />
                  <figcaption>
                    Vista de un evento con nombre, fecha, lugar y opciones.
                  </figcaption>
                </figure>
              </div>
            </div>
          </article>
        </section>

        {/* ACTIVIDAD PRÁCTICA */}
        <section className="activities">
          <h2 className="section-title inline">
            Actividad práctica del módulo
          </h2>
          <ol>
            <li>
              En equipo, piensen en una <strong>comunidad</strong> que podrían
              crear.
            </li>
            <li>
              Diseñen el <strong>nombre del grupo</strong>, <strong>objetivo</strong> y privacidad.
            </li>
            <li>
              Elijan una <strong>idea de página</strong> y qué contenido publicarían.
            </li>
            <li>
              Imaginen un <strong>evento</strong> y anoten fecha, lugar e invitados.
            </li>
          </ol>
          <p className="hint">
            Recuerda: todo lo que compartas debe ser respetuoso y cuidar tu información personal.
          </p>
        </section>
      </main>

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
              👇 Desplázate hasta el final para habilitar <strong>Siguiente</strong>.
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
            className={`btn-siguiente ${!puedeAvanzar ? "btn-siguiente-locked" : ""}`}
            onClick={finalizarContenido}
            disabled={!puedeAvanzar || guardando}
          >
            {guardando ? "Guardando..." : puedeAvanzar ? "Siguiente →" : "Siguiente 🔒"}
          </button>
        </div>
      </footer>
    </div>
  );
}
