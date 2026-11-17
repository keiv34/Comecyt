// src/pages/contenido/modulo_5_contenido_4.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Clock, Trophy, XCircle } from "lucide-react";
import confetti from "canvas-confetti";
import '@/Css/modulo_5_contenido_4.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MODULO_ID = 5;
const NUM_CONTENIDO = 4;
const TIEMPO_JUEGO = 120;
const CALIFICACION_MINIMA = 2;

const Modulo5Contenido4 = () => {
    const navigate = useNavigate();

    const [timeLeft, setTimeLeft] = useState(TIEMPO_JUEGO);
    const [timerActive, setTimerActive] = useState(true);
    const [scrolledBottom, setScrolledBottom] = useState(false);
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [modoLibre, setModoLibre] = useState(false);
    const [totalContenidos, setTotalContenidos] = useState(4);
    const [progresoCargado, setProgresoCargado] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const questions = [
        {
            id: 1,
            question: "Recibes un correo de 'soporte@microsoft.com' que dice: 'Tu cuenta de Outlook será eliminada en 48 horas por inactividad. Haz clic aquí para mantener tu cuenta activa'. El correo tiene el logo de Microsoft y se ve profesional, pero cuando pasas el mouse sobre el botón, abajo en el navegador aparece: 'http://microsoft-seguridad.tk/verificar'. ¿Qué haces?",
            options: [
                "A) Doy clic porque no quiero perder mi correo y mis fotos de años",
                "B) Lo borro y no doy clic. El dominio.tk y 'microsoft-seguridad' no son de Microsoft. Entro directo a outlook.com desde mi navegador",
                "C) Le respondo al correo preguntando por qué van a eliminar mi cuenta",
                "D) Reenvío el correo a mis contactos para avisarles que Microsoft está borrando cuentas"
            ],
            correct: 1
        },
        {
            id: 2,
            question: "Te llega un correo de 'Paquetería DHL' con asunto: 'Paquete retenido en aduana'. El correo dice que tienes un paquete de Amazon que no pagó impuestos y que debes descargar el archivo 'Guia_Aduana.pdf.exe' para ver el monto a pagar y liberar tu paquete. Tú sí esperas un paquete de Amazon. ¿Qué haces?",
            options: [
                "A) Descargo el archivo porque sí estoy esperando un paquete y necesito saber cuánto pagar",
                "B) No descargo nada. Los archivos.exe son programas, no PDFs. Entro a Amazon o DHL directo con mi número de guía para verificar",
                "C) Le marco al número que viene en el correo para preguntar por mi paquete",
                "D) Le pido a mi hijo que lo descargue en su computadora para ver si es seguro"
            ],
            correct: 1
        },
        {
            id: 3,
            question: "Recibes un correo de 'RH@tuempresa.com' que dice: 'Actualización urgente de nómina. Por favor confirma tus datos bancarios en el siguiente formulario para recibir tu aguinaldo completo'. El correo viene del dominio de tu empresa y el remitente es el nombre de la contadora que sí trabaja ahí. El link te lleva a un Google Forms. ¿Qué haces?",
            options: [
                "A) Lleno el formulario, es de la empresa y necesito mi aguinaldo",
                "B) No lleno nada. Voy personalmente con RH o marco a la extensión de la contadora para confirmar si ellas mandaron ese correo",
                "C) Le contesto al correo confirmando que ya llené el formulario",
                "D) Lo ignoro, si es importante me buscarán en persona"
            ],
            correct: 1
        }
    ];

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
                const moduloActual = modulosData.find((m) => m.modulo_id === MODULO_ID);
                if (moduloActual) {
                    setTotalContenidos(moduloActual.total_contenidos);
                    if (moduloActual.progreso_actual >= NUM_CONTENIDO) setModoLibre(true);
                }
            } catch (err) {
                console.error("Error al cargar progreso:", err);
            } finally {
                setProgresoCargado(true);
            }
        };
        cargarProgreso();
    }, []);

    useEffect(() => {
        if (!progresoCargado) return;
        if (modoLibre) {
            setTimeLeft(0);
            setTimerActive(false);
            setScrolledBottom(true);
            return;
        }
        if (timerActive && timeLeft > 0 && !showResult) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setTimerActive(false);
        }
    }, [timeLeft, timerActive, showResult, modoLibre, progresoCargado]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.innerHeight + window.scrollY;
            const pageHeight = document.documentElement.offsetHeight;
            if (scrollPosition >= pageHeight - 50) setScrolledBottom(true);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleAnswer = (questionIdx, optionIdx) => {
        if (showResult) return;
        if (timeLeft === 0 && !modoLibre) return;
        setAnswers({ ...answers, [questionIdx]: optionIdx });
    };

    const handleFinish = () => {
        let newScore = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correct) newScore++;
        });
        setScore(newScore);
        setShowResult(true);
        setTimerActive(false);

        if (newScore >= CALIFICACION_MINIMA) {
            lanzarConfeti();
        }
    };

    const handleSiguiente = async () => {
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
            console.error("Error al avanzar:", err.response?.data || err);
            alert('Error de conexión al guardar progreso');
        } finally {
            setGuardando(false);
        }
    };

    const reintentar = () => {
        setAnswers({});
        setShowResult(false);
        setScore(0);
        setTimeLeft(TIEMPO_JUEGO);
        setTimerActive(true);
        setScrolledBottom(false);
    };

    const formatTime = (seconds) => {
        if (modoLibre) return "Modo Repaso 🔄";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const allAnswered = Object.keys(answers).length === 3;
    const aprobo = score >= CALIFICACION_MINIMA;
    const puedeAvanzar = modoLibre || (showResult && aprobo && scrolledBottom);
    const juegoBloqueado = showResult || (timeLeft === 0 && !modoLibre);

    if (!progresoCargado) {
        return (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen p-4 md:p-8">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#06b6d4' }}>
                    <p>Cargando reto...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="game-card">
                    <div className="game-header">
                        <h2>
                            <span>📧</span>
                            Reto 4: Correo Electrónico Experto
                        </h2>
                        <p>
                            Casos avanzados: dominios falsos, archivos.exe y suplantación interna. Tienes <strong>2 minutos</strong>.
                        </p>
                    </div>

                    <div className="mb-6 text-center">
                        <div className={`inline-block px-6 py-3 rounded-xl ${timeLeft < 30 && !modoLibre ? 'bg-red-500/20 border-red-400' : 'bg-cyan-500/20 border-cyan-400'} border-2`}>
                            <p className="text-white text-2xl font-bold" style={{ textShadow: '0 0 10px rgba(0, 217, 255, 0.5)' }}>
                                ⏰ {formatTime(timeLeft)}
                            </p>
                        </div>
                    </div>

                    {!showResult && (
                        <div className="space-y-6">
                            {questions.map((q, qIdx) => (
                                <div key={q.id} className="bg-slate-800/50 p-6 rounded-xl border border-cyan-500/30">
                                    <p className="text-white text-lg font-semibold mb-4 leading-relaxed">
                                        <span className="text-cyan-400">{qIdx + 1}.</span> {q.question}
                                    </p>
                                    <div className="space-y-3">
                                        {q.options.map((opt, oIdx) => {
                                            const isSelected = answers[qIdx] === oIdx;
                                            return (
                                                <button
                                                    key={oIdx}
                                                    onClick={() => handleAnswer(qIdx, oIdx)}
                                                    disabled={juegoBloqueado}
                                                    className={`option-btn ${isSelected ? 'selected' : ''}`}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!showResult && (timeLeft === 0 || allAnswered) && (
                        <button onClick={handleFinish} className="btn-finish-game">
                            {allAnswered ? '✅ TERMINAR Y VER RESULTADO' : '⏰ SE ACABÓ EL TIEMPO - VER RESULTADO'}
                        </button>
                    )}

                    {showResult && (
                        <div className="victory-message">
                            <div className="particles">
                                <div className="particle"></div>
                                <div className="particle"></div>
                                <div className="particle"></div>
                                <div className="particle"></div>
                                <div className="particle"></div>
                            </div>
                            {aprobo ? (
                                <>
                                    <Trophy size={80} color="#ffc107" />
                                    <h3>¡{score === 3 ? 'LEYENDA' : 'MUY BIEN'}!</h3>
                                    <p>Obtuviste {score} de 3 respuestas correctas</p>
                                </>
                            ) : (
                                <>
                                    <XCircle size={80} color="#dc3545" />
                                    <h3>ALERTA MÁXIMA</h3>
                                    <p>Obtuviste {score} de 3. Necesitas mínimo {CALIFICACION_MINIMA}/3</p>
                                </>
                            )}

                            <div className="mt-6 text-left bg-slate-900/50 p-4 rounded-lg">
                                <p className="text-cyan-400 font-bold mb-3">Respuestas correctas:</p>
                                {questions.map((q, idx) => (
                                    <p key={idx} className="text-gray-300 text-sm mb-2">
                                        <strong className={answers[idx] === q.correct ? 'text-green-400' : 'text-red-400'}>
                                            {idx + 1}. {answers[idx] === q.correct ? '✓' : '✗'}
                                        </strong> {q.options[q.correct]}
                                    </p>
                                ))}
                            </div>

                            {!aprobo && (
                                <button className="btn-reintentar mt-4" onClick={reintentar}>
                                    Reintentar
                                </button>
                            )}
                        </div>
                    )}

                    <footer className="contenido-footer mt-8">
                        <div className="avance-mensaje">
                            {timerActive && !showResult && (
                                <p className="avance-texto toast-info">
                                    <Clock size={16} style={{ marginRight: '8px' }} />
                                    Tienes {formatTime(timeLeft)} para responder.
                                </p>
                            )}
                            {showResult && !aprobo && (
                                <p className="avance-texto toast-error">
                                    ❌ Necesitas mínimo {CALIFICACION_MINIMA}/3 para aprobar.
                                </p>
                            )}
                            {showResult && aprobo && !scrolledBottom && !modoLibre && (
                                <p className="avance-texto toast-info">
                                    📜 Desliza hasta el final para habilitar "Finalizar"
                                </p>
                            )}
                            {puedeAvanzar && (
                                <p className="avance-texto toast-success">
                                    ✅ ¡Módulo 5 completado! Ya puedes volver al inicio.
                                </p>
                            )}
                        </div>

                        <div className="botones-nav">
                            <button className="btn-anterior" onClick={() => navigate(-1)}>
                                Anterior
                            </button>
                            <button
                                className={`btn-siguiente ${!puedeAvanzar || guardando ? "btn-disabled" : ""}`}
                                onClick={handleSiguiente}
                                disabled={guardando || !puedeAvanzar}
                            >
                                {guardando ? "Guardando..." : puedeAvanzar ? "Finalizar Módulo" : "Contenido Bloqueado 🔒"}
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Modulo5Contenido4;