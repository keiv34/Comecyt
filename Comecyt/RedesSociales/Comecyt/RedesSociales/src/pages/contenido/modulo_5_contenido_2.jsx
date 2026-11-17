// src/pages/contenido/modulo_5_contenido_2.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Clock, FileText, Trophy, XCircle, CheckCircle } from "lucide-react";
import confetti from "canvas-confetti";
import '@/Css/modulo_5_contenido_2.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MODULO_ID = 5;
const NUM_CONTENIDO = 2;
const TIEMPO_JUEGO = 120;
const CALIFICACION_MINIMA = 2;

const Modulo5Contenido2 = () => {
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
            question: "Recibes un correo que dice: 'BANCO - Urgente actualizar datos'. No esperabas nada del banco y el correo viene de 'banco-seguridad@gmail.com'. El link dice 'www.banco-seguro.tk/actualizar'. ¿Qué haces?",
            options: [
                "A) Le doy click porque es urgente y no quiero que bloqueen mi cuenta",
                "B) Lo borro sin abrir y marco directo al número oficial del banco que viene en mi tarjeta",
                "C) Le contesto al correo pidiendo más información para confirmar si es real",
                "D) Reenvío el correo a mi familia para preguntarles si ellos saben qué hacer"
            ],
            correct: 1
        },
        {
            id: 2,
            question: "Te llega un correo de 'CFE' diciendo que tienes un adeudo de $3,450 y que si no pagas hoy te cortan la luz. Incluye un PDF adjunto llamado 'Factura_Urgente.pdf' y un link para pagar. ¿Cuál es la señal más clara de que es fraude?",
            options: [
                "A) Que el monto es muy alto y yo siempre pago puntual",
                "B) Que CFE nunca manda correos, siempre son cartas físicas",
                "C) Que el correo viene de un dominio raro como @cfe-mexico.net y pide abrir un PDF sospechoso",
                "D) Que me dan solo 1 día para pagar, eso no es normal"
            ],
            correct: 2
        },
        {
            id: 3,
            question: "Abres un correo de 'Amazon' que dice que ganaste un iPhone 15. Solo tienes que 'confirmar tu dirección y pagar $99 de envío' en un link. El correo tiene el logo de Amazon pero la dirección es 'ofertas-amazon2024@hotmail.com'. ¿Qué haces?",
            options: [
                "A) Pago los $99 rápido, es una ganga y Amazon es empresa seria",
                "B) Busco en Google 'Amazon ganó iPhone' para ver si es promoción real",
                "C) Lo reporto como phishing y lo borro, Amazon no regala iPhones por correo",
                "D) Le pregunto a mi hijo si él cree que es real antes de pagar"
            ],
            correct: 2
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
                const progresoLocal = parseInt(localStorage.getItem("progresoUsuario")) || 0;
                if (progresoLocal >= NUM_CONTENIDO) setModoLibre(true);
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
        if ((timeLeft === 0 && !modoLibre) || showResult) return;
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
    const juegoBloqueado = (timeLeft === 0 && !modoLibre) || showResult;

    if (!progresoCargado) {
        return (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen p-4 md:p-8">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#00d9ff' }}>
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
                        <h2 className="!text-white">
                            <span>📧</span>
                            Reto 2: Correo Electrónico Seguro
                        </h2>
                        <p className="!text-slate-300">
                            Analiza estos 3 casos reales de correos fraudulentos. Tienes <strong>2 minutos</strong> para responder.
                        </p>
                    </div>

                    <div className="mb-6 text-center">
                        <div className={`inline-block px-6 py-3 rounded-xl ${(timeLeft < 30 && !modoLibre) ? 'bg-red-500/20 border-red-400' : 'bg-cyan-500/20 border-cyan-400'} border-2`}>
                            <p className="!text-white text-2xl font-bold" style={{ textShadow: '0 0 10px rgba(0, 217, 255, 0.5)' }}>
                                ⏰ {formatTime(timeLeft)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 mb-8">
                        {questions.map((q, qIdx) => (
                            <div key={q.id} className="bg-slate-800/90 p-6 rounded-xl border border-cyan-500/40 shadow-inner">
                                <p className="!text-white text-lg font-semibold mb-4 leading-relaxed">
                                    <span className="!text-cyan-400 font-bold">{qIdx + 1}.</span> {q.question}
                                </p>
                                <div className="space-y-3">
                                    {q.options.map((opt, oIdx) => {
                                        const esSeleccionada = answers[qIdx] === oIdx;
                                        return (
                                            <button
                                                key={oIdx}
                                                onClick={() => handleAnswer(qIdx, oIdx)}
                                                disabled={juegoBloqueado}
                                                className={`w-full text-left p-4 rounded-lg border-2 transition-all !opacity-100 ${esSeleccionada
                                                    ? 'bg-cyan-500/30 border-cyan-400 !text-white shadow-lg shadow-cyan-500/30 font-semibold'
                                                    : 'bg-slate-700/60 border-slate-600 !text-slate-200 hover:border-cyan-500/50 hover:bg-slate-700'
                                                    } ${juegoBloqueado ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                style={{ color: esSeleccionada ? '#ffffff' : '#e2e8f0' }}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

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
                                    <h3 className="!text-white">¡{score === 3 ? 'PERFECTO' : 'MUY BIEN'}!</h3>
                                    <p className="!text-slate-100">Obtuviste {score} de 3 respuestas correctas</p>
                                </>
                            ) : (
                                <>
                                    <XCircle size={80} color="#dc3545" />
                                    <h3 className="!text-white">SIGUE PRACTICANDO</h3>
                                    <p className="!text-slate-100">Obtuviste {score} de 3. Necesitas mínimo {CALIFICACION_MINIMA}/3</p>
                                </>
                            )}

                            <div className="mt-6 text-left bg-slate-900/80 p-4 rounded-lg border border-slate-700">
                                <p className="!text-cyan-400 font-bold mb-3">Respuestas correctas:</p>
                                {questions.map((q, idx) => (
                                    <p key={idx} className="!text-slate-300 text-sm mb-2">
                                        <strong className={answers[idx] === q.correct ? '!text-green-400' : '!text-red-400'}>
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
                </div>
            </div>

            <footer className="contenido-footer mt-8">
                <div className="avance-mensaje">
                    {timerActive && !showResult && (
                        <p className="avance-texto toast-info">
                            <Clock size={16} style={{ marginRight: '8px' }} />
                            Tienes {formatTime(timeLeft)} para responder las preguntas de opción múltiple.
                        </p>
                    )}

                    {!modoLibre && timeLeft === 0 && !showResult && (
                        <p className="avance-texto toast-warning">
                            ⏰ El tiempo terminó. Envía tus respuestas para calificar.
                        </p>
                    )}

                    {showResult && !aprobo && (
                        <p className="avance-texto toast-error">
                            ❌ Necesitas mínimo {CALIFICACION_MINIMA}/3 para aprobar este reto. ¡Vuelve a intentarlo!
                        </p>
                    )}

                    {showResult && aprobo && !scrolledBottom && !modoLibre && (
                        <p className="avance-texto toast-info">
                            📜 Desliza hasta el final de la pantalla para habilitar el botón "Siguiente"
                        </p>
                    )}

                    {puedeAvanzar && (
                        <p className="avance-texto toast-success">
                            ✅ ¡Reto superado con éxito! Ya puedes avanzar al siguiente contenido.
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
                        {guardando ? "Guardando..." : puedeAvanzar ? "Siguiente Reto" : "Contenido Bloqueado 🔒"}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Modulo5Contenido2;