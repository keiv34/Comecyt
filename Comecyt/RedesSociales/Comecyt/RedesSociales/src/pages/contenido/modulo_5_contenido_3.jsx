// src/pages/contenido/modulo_5_contenido_3.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Clock, Trophy, XCircle } from "lucide-react";
import confetti from "canvas-confetti";
import '@/Css/modulo_5_contenido_3.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MODULO_ID = 5;
const NUM_CONTENIDO = 3;
const TIEMPO_JUEGO = 120;
const CALIFICACION_MINIMA = 2;

const Modulo5Contenido3 = () => {
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
            question: "Recibes un mensaje en Facebook de un 'amigo' que dice: 'Hola! ¿Me ayudas? Estoy en el hospital y necesito $2,000 urgente para medicinas, te los regreso mañana. Depósitame a esta cuenta'. No lo veías hace años. ¿Qué haces?",
            options: [
                "A) Le deposito porque es mi amigo y está en emergencia",
                "B) Le marco directo a su celular o le pregunto por video llamada para confirmar que es él",
                "C) Le digo que sí pero que me espere a mañana para conseguir el dinero",
                "D) Lo ignoro porque seguro es mentira"
            ],
            correct: 1
        },
        {
            id: 2,
            question: "Te llega una notificación: 'WhatsApp Business - Tu cuenta será suspendida en 24 horas. Verifica tu número aquí: www.whatsapp-verificacion.tk'. ¿Cuál es la señal más obvia de fraude?",
            options: [
                "A) Que WhatsApp nunca manda notificaciones, siempre es por SMS",
                "B) Que el dominio.tk no es oficial de WhatsApp y piden verificar por un link externo",
                "C) Que 24 horas es muy poco tiempo para suspender una cuenta",
                "D) Que WhatsApp Business es solo para empresas, no para usuarios normales"
            ],
            correct: 1
        },
        {
            id: 3,
            question: "Un perfil de Instagram con tu foto y nombre te empieza a seguir. Te manda DM: 'Hola, soy tu primo Juan, cambié de número. ¿Me pasas tu WhatsApp?'. Tú no tienes primo Juan. ¿Qué haces?",
            options: [
                "A) Le paso mi WhatsApp, a lo mejor es un familiar que no recuerdo",
                "B) Le pregunto datos personales para ver si de verdad es mi familia",
                "C) Lo bloqueo y reporto, es un perfil falso intentando sacar mi información",
                "D) Ignoro el mensaje pero no lo bloqueo por si acaso"
            ],
            correct: 2
        }
    ];

    const lanzarConfeti = () => {
        const duration = 3000;
        const end = Date.now() + duration;
        (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#22d3ee', '#10b981', '#3b82f6'] });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#22d3ee', '#10b981', '#3b82f6'] });
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
            if (scrollPosition >= pageHeight - 60) setScrolledBottom(true);
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
                            <span>📱</span>
                            Reto 3: Redes Sociales Seguras
                        </h2>
                        <p>
                            Analiza estos 3 casos de fraude en redes sociales. Tienes <strong>2 minutos</strong> para responder.
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
                        <>
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
                                        <h3>¡{score === 3 ? 'PERFECTO' : 'MUY BIEN'}!</h3>
                                        <p>Obtuviste {score} de 3 respuestas correctas</p>
                                    </>
                                ) : (
                                    <>
                                        <XCircle size={80} color="#dc3545" />
                                        <h3>SIGUE PRACTICANDO</h3>
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
                        </>
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
                                    📜 Desliza hasta el final para habilitar "Siguiente"
                                </p>
                            )}
                            {puedeAvanzar && (
                                <p className="avance-texto toast-success">
                                    ✅ ¡Reto superado! Ya puedes avanzar.
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
                                {guardando ? "Guardando..." : puedeAvanzar ? "SIGUIENTE CONTENIDO →" : "Contenido Bloqueado 🔒"}
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Modulo5Contenido3;