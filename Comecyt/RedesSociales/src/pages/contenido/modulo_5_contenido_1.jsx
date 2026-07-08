// src/pages/contenido/modulo_5_contenido_1.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Clock, FileText, Trophy, XCircle, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { useCourseProgress } from "@/hooks/useGuardarProgreso";
import "@/Css/modulo_5_contenido_1.css"; // Reutiliza el mismo CSS

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MODULO_ID = 5; // ✅ Es módulo 5
const NUM_CONTENIDO = 1; // ✅ Contenido 1 de módulo 5
const TIEMPO_JUEGO = 120; // 2:00 MINUTOS
const CALIFICACION_MINIMA = 4; // Mínimo 4/5 para aprobar

// ✅ RESPUESTAS CORRECTAS - CAMBIA ESTAS SEGÚN TU TEMA
const RESPUESTAS_CORRECTAS = {
    p1: "b",
    p2: "a",
    p3: "c",
    p4: "d",
    p5: "b"
};

function RetoFormularioModulo5_1() {
    const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_JUEGO);
    const [timerTerminado, setTimerTerminado] = useState(false);
    const [scrolledBottom, setScrolledBottom] = useState(false);
    const [modoLibre, setModoLibre] = useState(false);
    const [formularioEnviado, setFormularioEnviado] = useState(false);
    const [calificacion, setCalificacion] = useState(0);
    const [mostrarResultados, setMostrarResultados] = useState(false);
    const [totalContenidos, setTotalContenidos] = useState(15);
    const [modulos, setModulos] = useState([]);
    const [progresoCargado, setProgresoCargado] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const [respuestas, setRespuestas] = useState({
        p1: "",
        p2: "",
        p3: "",
        p4: "",
        p5: ""
    });

    const navigate = useNavigate();

    const {
        completarContenidoBackend,
        isActivityCompleted,
        guardarProgresoBackend
    } = useCourseProgress();

    const lanzarConfeti = () => {
        const duration = 3000;
        const end = Date.now() + duration;
        (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#28a745', '#007bff', '#ffc107'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#28a745', '#007bff', '#ffc107'] });
            if (Date.now() < end) requestAnimationFrame(frame);
        })();
    };

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
                setModulos(modulosData);
                const moduloActual = modulosData.find((m) => m.modulo_id === MODULO_ID);
                if (moduloActual) {
                    setTotalContenidos(moduloActual.total_contenidos);
                    if (moduloActual.progreso_actual > NUM_CONTENIDO) setModoLibre(true);
                }
            } catch (err) {
                console.error("Error al cargar progreso:", err);
                const progresoLocal = parseInt(localStorage.getItem("progresoUsuario")) || 0;
                if (progresoLocal >= NUM_CONTENIDO + 1) setModoLibre(true);
            } finally {
                setProgresoCargado(true);
            }
        };
        cargarProgreso();
    }, []);

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

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.innerHeight + window.scrollY;
            const pageHeight = document.documentElement.offsetHeight;
            if (scrollPosition >= pageHeight - 50) setScrolledBottom(true);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const todasContestadas = Object.values(respuestas).every(r => r !== "");
    const aprobo = calificacion >= CALIFICACION_MINIMA;
    const puedeAvanzar = modoLibre || (timerTerminado && scrolledBottom && formularioEnviado && aprobo);

    const formatearTiempo = (segundos) => {
        const m = Math.floor(segundos / 60);
        const s = segundos % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const handleRespuesta = (pregunta, valor) => {
        if (formularioEnviado) return;
        setRespuestas(prev => ({ ...prev, [pregunta]: valor }));
    };

    const enviarFormulario = () => {
    // 1. Esto se queda EXACTAMENTE IGUAL (tu validación)
    if (!todasContestadas) {
        alert("Por favor responde todas las preguntas antes de enviar");
        return;
    }

    let aciertos = 0;
    Object.keys(RESPUESTAS_CORRECTAS).forEach(key => {
        if (respuestas[key] === RESPUESTAS_CORRECTAS[key]) aciertos++;
    });

    setCalificacion(aciertos);
    setFormularioEnviado(true);
    setMostrarResultados(true);

    // 2. Aquí es donde se hace el ajuste:
    if (aciertos >= CALIFICACION_MINIMA) {
        lanzarConfeti();
        
        // CAMBIADO: Antes decía completeActivity, ahora usa la función real del hook
        completarContenidoBackend(MODULO_ID, NUM_CONTENIDO); 
    }
};

    const finalizarReto = async () => {
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
                if (NUM_CONTENIDO >= totalContenidos) {
                    navigate("/inicio");
                } else {
                    navigate(`/modulo/${MODULO_ID}/contenido/${NUM_CONTENIDO + 1}`);
                }
            } else {
                alert('Error al guardar progreso. Intenta de nuevo.');
            }
        } catch (err) {
            console.error("❌ Error guardando:", err.response?.data || err);
            alert('Error de conexión al guardar progreso');
        } finally {
            setGuardando(false);
        }
    };

    const reintentar = () => {
        setRespuestas({ p1: "", p2: "", p3: "", p4: "", p5: "" });
        setFormularioEnviado(false);
        setMostrarResultados(false);
        setCalificacion(0);
        setTiempoRestante(TIEMPO_JUEGO);
        setTimerTerminado(false);
    };

    if (!progresoCargado) {
        return (
            <div className="contenido-container">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#833ab4' }}>
                    <p>Cargando reto...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="contenido-container">
            <header className="contenido-header">
                <h1>RETO 1: Formulario de Conceptos</h1>
                <div className="timer-display">
                    <Clock size={20} />
                    <span className={tiempoRestante < 30 ? "tiempo-critico" : ""}>
                        {formatearTiempo(tiempoRestante)}
                    </span>
                </div>
            </header>

            <main className="contenido-body">
                <div className="game-card">
                    <div className="game-header">
                        <h2><FileText size={24} /> Responde las preguntas</h2>
                        <p>Completa el formulario. Necesitas {CALIFICACION_MINIMA}/5 para aprobar.</p>
                    </div>

                    <div className="formulario-container">
                        {/* PREGUNTA 1 */}
                        <div className={`pregunta-item ${formularioEnviado ? (respuestas.p1 === RESPUESTAS_CORRECTAS.p1 ? 'correcta' : 'incorrecta') : ''}`}>
                            <label>1. ¿Cuál es la unidad básica de información en computación?</label>
                            <select
                                value={respuestas.p1}
                                onChange={(e) => handleRespuesta('p1', e.target.value)}
                                disabled={formularioEnviado}
                            >
                                <option value="">Selecciona una opción</option>
                                <option value="a">Byte</option>
                                <option value="b">Bit</option>
                                <option value="c">Kilobyte</option>
                                <option value="d">Megabyte</option>
                            </select>
                            {mostrarResultados && (
                                <div className="feedback">
                                    {respuestas.p1 === RESPUESTAS_CORRECTAS.p1 ?
                                        <CheckCircle size={20} color="#28a745" /> :
                                        <XCircle size={20} color="#dc3545" />
                                    }
                                </div>
                            )}
                        </div>

                        {/* PREGUNTA 2 */}
                        <div className={`pregunta-item ${formularioEnviado ? (respuestas.p2 === RESPUESTAS_CORRECTAS.p2 ? 'correcta' : 'incorrecta') : ''}`}>
                            <label>2. ¿Qué tipo de software es Windows?</label>
                            <select
                                value={respuestas.p2}
                                onChange={(e) => handleRespuesta('p2', e.target.value)}
                                disabled={formularioEnviado}
                            >
                                <option value="">Selecciona una opción</option>
                                <option value="a">Sistema Operativo</option>
                                <option value="b">Software de aplicación</option>
                                <option value="c">Antivirus</option>
                                <option value="d">Navegador web</option>
                            </select>
                            {mostrarResultados && (
                                <div className="feedback">
                                    {respuestas.p2 === RESPUESTAS_CORRECTAS.p2 ?
                                        <CheckCircle size={20} color="#28a745" /> :
                                        <XCircle size={20} color="#dc3545" />
                                    }
                                </div>
                            )}
                        </div>

                        {/* PREGUNTA 3 */}
                        <div className={`pregunta-item ${formularioEnviado ? (respuestas.p3 === RESPUESTAS_CORRECTAS.p3 ? 'correcta' : 'incorrecta') : ''}`}>
                            <label>3. ¿Qué dispositivo almacena datos permanentemente?</label>
                            <select
                                value={respuestas.p3}
                                onChange={(e) => handleRespuesta('p3', e.target.value)}
                                disabled={formularioEnviado}
                            >
                                <option value="">Selecciona una opción</option>
                                <option value="a">RAM</option>
                                <option value="b">Cache</option>
                                <option value="c">Disco Duro</option>
                                <option value="d">Procesador</option>
                            </select>
                            {mostrarResultados && (
                                <div className="feedback">
                                    {respuestas.p3 === RESPUESTAS_CORRECTAS.p3 ?
                                        <CheckCircle size={20} color="#28a745" /> :
                                        <XCircle size={20} color="#dc3545" />
                                    }
                                </div>
                            )}
                        </div>

                        {/* PREGUNTA 4 */}
                        <div className={`pregunta-item ${formularioEnviado ? (respuestas.p4 === RESPUESTAS_CORRECTAS.p4 ? 'correcta' : 'incorrecta') : ''}`}>
                            <label>4. ¿Qué significa URL?</label>
                            <select
                                value={respuestas.p4}
                                onChange={(e) => handleRespuesta('p4', e.target.value)}
                                disabled={formularioEnviado}
                            >
                                <option value="">Selecciona una opción</option>
                                <option value="a">Universal Resource Link</option>
                                <option value="b">Uniform Resource Link</option>
                                <option value="c">Unified Resource Locator</option>
                                <option value="d">Uniform Resource Locator</option>
                            </select>
                            {mostrarResultados && (
                                <div className="feedback">
                                    {respuestas.p4 === RESPUESTAS_CORRECTAS.p4 ?
                                        <CheckCircle size={20} color="#28a745" /> :
                                        <XCircle size={20} color="#dc3545" />
                                    }
                                </div>
                            )}
                        </div>

                        {/* PREGUNTA 5 */}
                        <div className={`pregunta-item ${formularioEnviado ? (respuestas.p5 === RESPUESTAS_CORRECTAS.p5 ? 'correcta' : 'incorrecta') : ''}`}>
                            <label>5. ¿Cuál NO es un navegador web?</label>
                            <select
                                value={respuestas.p5}
                                onChange={(e) => handleRespuesta('p5', e.target.value)}
                                disabled={formularioEnviado}
                            >
                                <option value="">Selecciona una opción</option>
                                <option value="a">Chrome</option>
                                <option value="b">Photoshop</option>
                                <option value="c">Firefox</option>
                                <option value="d">Safari</option>
                            </select>
                            {mostrarResultados && (
                                <div className="feedback">
                                    {respuestas.p5 === RESPUESTAS_CORRECTAS.p5 ?
                                        <CheckCircle size={20} color="#28a745" /> :
                                        <XCircle size={20} color="#dc3545" />
                                    }
                                </div>
                            )}
                        </div>
                    </div>

                    {mostrarResultados && (
                        <div className={`victory-message ${aprobo ? 'aprobado' : 'reprobado'}`}>
                            {aprobo ? (
                                <>
                                    <Trophy size={56} color="#ffc107" />
                                    <h3>¡Aprobado! 🎉</h3>
                                    <p>Calificación: {calificacion}/5</p>
                                    <p>¡Excelente trabajo! Has ganado este reto.</p>
                                </>
                            ) : (
                                <>
                                    <XCircle size={56} color="#dc3545" />
                                    <h3>No aprobado 😔</h3>
                                    <p>Calificación: {calificacion}/5</p>
                                    <p>Necesitas mínimo {CALIFICACION_MINIMA}/5 para continuar.</p>
                                    <button className="btn-reintentar" onClick={reintentar}>
                                        Reintentar
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {!formularioEnviado && (
                        <button
                            className="btn-finish-game"
                            onClick={enviarFormulario}
                            disabled={!todasContestadas}
                        >
                            Enviar formulario ✅
                        </button>
                    )}
                </div>
            </main>

            <footer className="contenido-footer">
                <div className="avance-mensaje">
                    {!timerTerminado && !formularioEnviado && (
                        <p className="avance-texto toast-info">
                            <Clock size={16} style={{ marginRight: '8px' }} />
                            Tienes {formatearTiempo(tiempoRestante)} para completar el formulario.
                        </p>
                    )}

                    {!modoLibre && timerTerminado && !formularioEnviado && (
                        <p className="avance-texto toast-warning">
                            ⏰ El tiempo terminó. Envía tus respuestas para calificar.
                        </p>
                    )}

                    {formularioEnviado && !aprobo && (
                        <p className="avance-texto toast-error">
                            ❌ Necesitas {CALIFICACION_MINIMA}/5 para avanzar. Reintenta.
                        </p>
                    )}

                    {formularioEnviado && aprobo && !scrolledBottom && !modoLibre && (
                        <p className="avance-texto toast-info">
                            📜 Desliza hasta el final para habilitar "Siguiente"
                        </p>
                    )}

                    {puedeAvanzar && (
                        <p className="avance-texto toast-success">
                            ✅ ¡Excelente! Ya puedes pasar al siguiente reto
                        </p>
                    )}
                </div>

                <div className="botones-nav">
                    <button className="btn-anterior" onClick={() => navigate(-1)}>
                        Anterior
                    </button>
                    <button
                        className={`btn-siguiente ${!puedeAvanzar || guardando ? "btn-disabled" : ""}`}
                        onClick={finalizarReto}
                        disabled={guardando || !puedeAvanzar}
                    >
                        {guardando ? "Guardando..." : puedeAvanzar ? "Siguiente Reto" : "Contenido Bloqueado 🔒"}
                    </button>
                </div>
            </footer>
        </div>
    );
}

export default RetoFormularioModulo5_1;
