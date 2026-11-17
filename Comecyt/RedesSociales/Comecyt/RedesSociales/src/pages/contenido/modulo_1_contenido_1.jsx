import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Clock, BookOpen, Mail, Layout, Video } from "lucide-react";

import "../../Css/modulo_1_contenido_1.css";

const MODULO_ID = 1;
const NUM_CONTENIDO = 1;
const API_URL = "http://localhost:4000";

function Contenido1() {
  const [tiempoRestante, setTiempoRestante] = useState(120);
  const [timerTerminado, setTimerTerminado] = useState(false);
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const [modoLibre, setModoLibre] = useState(false);
  const [toast, setToast] = useState("");
  const [totalContenidos, setTotalContenidos] = useState(8);
  const [modulos, setModulos] = useState([]);

  const navigate = useNavigate();
  const [progresoCargado, setProgresoCargado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // 1. Carga de progreso inicial + datos del módulo
  useEffect(() => {
    const correo = localStorage.getItem("correo");
    const token = localStorage.getItem("token");
    if (!correo) {
      setProgresoCargado(true);
      return;
    }

    const cargarProgreso = async () => {
      try {
        const res = await axios.post(
          `${API_URL}/api/alumno/progreso`,
          { correo },
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        const modulosData = res.data.modulos || [];
        setModulos(modulosData);

        const moduloActual = modulosData.find((m) => m.modulo_id === MODULO_ID);

        if (moduloActual) {
          setTotalContenidos(moduloActual.total_contenidos);
          if (moduloActual.progreso_actual >= NUM_CONTENIDO) setModoLibre(true);
        }
      } catch (err) {
        console.error("Error al cargar progreso:", err);
        const progresoLocal = parseInt(localStorage.getItem("progresoUsuario")) || 0;
        if (progresoLocal >= NUM_CONTENIDO) setModoLibre(true);
      } finally {
        setProgresoCargado(true);
      }
    };
    cargarProgreso();
  }, []);

  // 2. Lógica del Temporizador
  useEffect(() => {
    if (!progresoCargado) return;
    if (modoLibre) {
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
  }, [modoLibre, progresoCargado]);

  // 3. Lógica de Scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 100;

      if (scrollPosition >= threshold) {
        setScrolledBottom(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 4. Condición para habilitar botón
  const puedeAvanzar = modoLibre || (timerTerminado && scrolledBottom);

  const formatearTiempo = (segundos) => {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const finalizarContenido = async () => {
    if (!puedeAvanzar) return;
    setGuardando(true);
    const correo = localStorage.getItem("correo");
    const token = localStorage.getItem("token");

    try {
      if (correo) {
        const response = await axios.post(
          `${API_URL}/api/alumno/progreso/actualizar`,
          {
            correo,
            modulo_id: MODULO_ID,
            contenido_id: NUM_CONTENIDO,  // era progreso_actual
          },
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );

        console.log('💾 Respuesta BD:', response.data);

        // ✅ Fix: checar success, no solo progreso_actual
        if (response.data?.success) {
          window.scrollTo(0, 0);
          navigate(`/modulo/${MODULO_ID}/contenido/${NUM_CONTENIDO + 1}`);
        } else {
          console.log('❌ Error en respuesta:', response.data);
          setToast('Error al guardar progreso. Intenta de nuevo.');
          setTimeout(() => setToast(""), 3000);
        }
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
    <div className="contenido-container">
      <header className="contenido-header">
        <h1>Introducción al correo electrónico</h1>
      </header>

      <main className="contenido-body">
        <section className="intro">
          <p>
            El correo electrónico (también conocido como <strong>e-mail</strong>) es un servicio de mensajería digital que
            permite enviar y recibir mensajes a través de redes informáticas.
          </p>
        </section>

        <section className="contenido-section">
          <h2><Mail size={20} style={{ marginRight: '10px' }} /> Definición</h2>
          <p>
            Este servicio funciona bajo el modelo de "almacenamiento y reenvío". Los mensajes se envían a un servidor que
            los guarda hasta que el destinatario se conecta y los descarga.
          </p>
        </section>

        <section className="contenido-section">
          <h2><Layout size={20} style={{ marginRight: '10px' }} /> Estructura de una dirección</h2>
          <ul>
            <li><strong>La parte local:</strong> Es el nombre del usuario (ejemplo: <em>nombreusuario</em>).</li>
            <li><strong>El dominio:</strong> Identifica al proveedor (ejemplo: <em>gmail.com, outlook.com</em>).</li>
          </ul>
        </section>

        <section className="contenido-section">
          <h2><BookOpen size={20} style={{ marginRight: '10px' }} /> Objetivos de aprendizaje</h2>
          <p className="subtitulo-obj">Al finalizar este tema, podrás:</p>
          <ul>
            <li>Navegar por la interfaz de <strong>ÁGORA</strong>.</li>
            <li>Identificar tus módulos activos.</li>
            <li>Entender el funcionamiento básico del correo electrónico.</li>
          </ul>
        </section>

        <div className="video-container">
          <h3><Video size={20} style={{ marginRight: '10px' }} /> Tutorial de Navegación</h3>
          <div className="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/qbWWy_s0iQI"
              title="Video Explicativo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </main>

      <footer className="contenido-footer">
        <div className="avance-mensaje">
          {!puedeAvanzar ? (
            <div className="toast-info">
              <Clock size={16} style={{ marginRight: '8px' }} />
              <span>
                {!timerTerminado
                  ? `Habilitando botón en ${formatearTiempo(tiempoRestante)}...`
                  : "¡Tiempo cumplido! Desliza hasta el final 👇"}
              </span>
            </div>
          ) : (
            <div className="toast-success">
              ✅ ¡Contenido completado! Ya puedes avanzar.
            </div>
          )}
        </div>

        {toast && <div className="toast-error">{toast}</div>}

        <div className="botones-nav">
          <button className="btn-anterior" onClick={() => navigate("/contenidos")}>
            Volver al Temario
          </button>

          <button
            className={`btn-siguiente ${!puedeAvanzar || guardando ? "btn-disabled" : "btn-active"}`}
            onClick={finalizarContenido}
            disabled={guardando || !puedeAvanzar}
          >
            {guardando ? "Guardando..." : puedeAvanzar ? "Siguiente ➔" : "Contenido Bloqueado 🔒"}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default Contenido1;