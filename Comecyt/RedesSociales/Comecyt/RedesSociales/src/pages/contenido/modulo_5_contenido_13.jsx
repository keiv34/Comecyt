// src/pages/contenido/modulo_5_contenido_13.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { Trophy, XCircle } from "lucide-react";
import confetti from "canvas-confetti";
import '@/Css/modulo_5_contenido_13.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MODULO_ID = 5;
const NUM_CONTENIDO = 13;
const TIEMPO_JUEGO = 120;
const CALIFICACION_MINIMA = 6;

const Modulo5Contenido13 = () => {
    const navigate = useNavigate();

    const [timeLeft, setTimeLeft] = useState(TIEMPO_JUEGO);
    const [timerActive, setTimerActive] = useState(true);
    const [scrolledBottom, setScrolledBottom] = useState(false);
    const [foundWords, setFoundWords] = useState([]);
    const [selectedCells, setSelectedCells] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [modoLibre, setModoLibre] = useState(false);
    const [totalContenidos, setTotalContenidos] = useState(16);
    const [progresoCargado, setProgresoCargado] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const words = [
        'SMISHING',
        'SMS',
        'LINK',
        'BANCO',
        'PAQUETE',
        'PREMIO',
        'URGENTE',
        'BLOQUEAR'
    ];

    const grid = [
        ['S', 'M', 'I', 'S', 'H', 'I', 'N', 'G', 'P', 'B'],
        ['S', 'M', 'S', 'L', 'I', 'N', 'K', 'A', 'R', 'L'],
        ['P', 'A', 'Q', 'U', 'E', 'T', 'E', 'Q', 'E', 'O'],
        ['P', 'R', 'E', 'M', 'I', 'O', 'U', 'U', 'M', 'Q'],
        ['U', 'R', 'G', 'E', 'N', 'T', 'E', 'E', 'I', 'U'],
        ['B', 'A', 'N', 'C', 'O', 'S', 'M', 'S', 'O', 'E'],
        ['B', 'L', 'O', 'Q', 'U', 'E', 'A', 'R', 'Q', 'A'],
        ['X', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'R'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'A', 'S', 'D'],
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']
    ];

    const wordPositions = {
        'SMISHING': [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7]],
        'SMS': [[1, 0], [1, 1], [1, 2]],
        'LINK': [[1, 3], [1, 4], [1, 5], [1, 6]],
        'PAQUETE': [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6]],
        'PREMIO': [[3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5]],
        'URGENTE': [[4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6]],
        'BANCO': [[5, 0], [5, 1], [5, 2], [5, 3], [5, 4]],
        'BLOQUEAR': [[6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7]]
    };

    const lanzarConfeti = () => {
        const end = Date.now() + 3000;
        (function frame() {
            confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
            confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
            if (Date.now() < end) requestAnimationFrame(frame);
        })();
    };

    useEffect(() => {
        const correo = localStorage.getItem("correo");
        const token = localStorage.getItem("token");
        if (!correo) { setProgresoCargado(true); return; }
        const cargarProgreso = async () => {
            try {
                const res = await axios.post(`${API_URL}/api/alumno/progreso`, { correo },
                    token ? { headers: { Authorization: `Bearer ${token}` } } : {}
                );
                const moduloActual = (res.data.modulos || []).find(m => m.modulo_id === MODULO_ID);
                if (moduloActual) {
                    setTotalContenidos(moduloActual.total_contenidos);
                    if (moduloActual.progreso_actual >= NUM_CONTENIDO) setModoLibre(true);
                }
            } catch (err) { console.error(err); }
            finally { setProgresoCargado(true); }
        };
        cargarProgreso();
    }, []);

    useEffect(() => {
        if (!progresoCargado) return;
        if (modoLibre) { setTimeLeft(0); setTimerActive(false); setScrolledBottom(true); return; }
        if (timerActive && timeLeft > 0 && !showResult) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setTimerActive(false);
            if (!showResult) handleFinish();
        }
    }, [timeLeft, timerActive, showResult, modoLibre, progresoCargado]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 50) setScrolledBottom(true);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleCellClick = (row, col) => {
        if (showResult || (timeLeft === 0 && !modoLibre)) return;
        const cellKey = `${row}-${col}`;
        const newSelected = [...selectedCells, cellKey];
        setSelectedCells(newSelected);
        for (let word of words) {
            if (foundWords.includes(word)) continue;
            const positions = wordPositions[word];
            if (!positions) continue;
            const allSelected = positions.every(([r, c]) => newSelected.includes(`${r}-${c}`));
            if (allSelected) {
                const newFound = [...foundWords, word];
                setFoundWords(newFound);
                setSelectedCells([]);
                if (newFound.length >= words.length) { setTimeout(handleFinish, 100); }
                break;
            }
        }
    };

    const handleFinish = () => {
        setShowResult(true);
        setTimerActive(false);
        if (foundWords.length >= CALIFICACION_MINIMA) lanzarConfeti();
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
            console.error(err.response?.data || err);
            alert('Error de conexión al guardar progreso');
        } finally {
            setGuardando(false);
        }
    };

    const reintentar = () => {
        setFoundWords([]); setSelectedCells([]); setShowResult(false);
        setTimeLeft(TIEMPO_JUEGO); setTimerActive(true); setScrolledBottom(false);
    };

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    const isCellSelected = (r, c) => selectedCells.includes(`${r}-${c}`);
    const isCellFound = (r, c) => foundWords.some(w => wordPositions[w]?.some(([rr, cc]) => rr === r && cc === c));

    const aprobo = foundWords.length >= CALIFICACION_MINIMA;
    const puedeAvanzar = modoLibre || (showResult && aprobo && scrolledBottom);

    if (!progresoCargado) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#06b6d4' }}>Cargando reto...</div>;

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="game-card">
                    <div className="game-header">
                        <h2><span>💬</span> Reto 13: Sopa - SMS/Smishing</h2>
                        <p>Encuentra <strong>8 palabras</strong> sobre estafas por SMS y smishing. Tienes <strong>2 minutos</strong>.</p>
                    </div>

                    <div className="mb-6 text-center">
                        <div className={`inline-block px-6 py-3 rounded-xl ${timeLeft < 30 && !modoLibre ? 'bg-red-500/20 border-red-400' : 'bg-cyan-500/20 border-cyan-400'} border-2`}>
                            <p className="text-white text-2xl font-bold">⏰ {modoLibre ? "Modo Repaso 🔄" : formatTime(timeLeft)}</p>
                        </div>
                    </div>

                    {!showResult && (
                        <>
                            <div className="words-list">
                                <p className="words-title">Palabras a encontrar: {foundWords.length}/8</p>
                                <div className="words-container">
                                    {words.map(word => (
                                        <span key={word} className={`word-badge ${foundWords.includes(word) ? 'found' : ''}`}>
                                            {word}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="word-grid">
                                {grid.map((row, rowIdx) => (
                                    <div key={rowIdx} className="grid-row">
                                        {row.map((letter, colIdx) => (
                                            <button
                                                key={colIdx}
                                                onClick={() => handleCellClick(rowIdx, colIdx)}
                                                disabled={showResult || (timeLeft === 0 && !modoLibre)}
                                                className={`grid-cell ${isCellFound(rowIdx, colIdx) ? 'found' : isCellSelected(rowIdx, colIdx) ? 'selected' : ''}`}
                                            >
                                                {letter}
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {foundWords.length >= CALIFICACION_MINIMA && (
                                <button onClick={handleFinish} className="btn-finish-game">
                                    ✅ TERMINAR - Encontraste {foundWords.length} palabras
                                </button>
                            )}
                        </>
                    )}

                    {showResult && (
                        <div className="victory-message">
                            {aprobo ? (
                                <>
                                    <Trophy size={80} color="#ffc107" />
                                    <h3>¡{foundWords.length === 8 ? 'EXPERTO' : 'MUY BIEN'}!</h3>
                                    <p>Encontraste {foundWords.length} de 8 palabras</p>
                                </>
                            ) : (
                                <>
                                    <XCircle size={80} color="#dc3545" />
                                    <h3>ALERTA</h3>
                                    <p>Encontraste {foundWords.length} de 8. Necesitas mínimo {CALIFICACION_MINIMA}/8</p>
                                </>
                            )}
                            <div className="mt-6 text-left bg-slate-900/50 p-4 rounded-lg">
                                <p className="text-cyan-400 font-bold mb-3">Palabras clave de SMS/Smishing:</p>
                                {words.map(word => (
                                    <p key={word} className="text-gray-300 text-sm mb-1">
                                        <strong className={foundWords.includes(word) ? 'text-green-400' : 'text-red-400'}>
                                            {foundWords.includes(word) ? '✓' : '✗'}
                                        </strong> {word}
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
                            {timerActive && !showResult && <p className="avance-texto toast-info">⏰ {formatTime(timeLeft)} para encontrar las palabras.</p>}
                            {showResult && !aprobo && <p className="avance-texto toast-error">❌ Necesitas {CALIFICACION_MINIMA}/8 para aprobar.</p>}
                            {showResult && aprobo && !scrolledBottom && !modoLibre && <p className="avance-texto toast-info">📜 Desliza hasta el final para habilitar "Siguiente"</p>}
                            {puedeAvanzar && <p className="avance-texto toast-success">✅ ¡Reto superado! Ya puedes avanzar.</p>}
                        </div>
                        <div className="botones-nav">
                            <button className="btn-anterior" onClick={() => navigate(-1)}>Anterior</button>
                            <button className={`btn-siguiente ${!puedeAvanzar || guardando ? "btn-disabled" : ""}`}
                                onClick={handleSiguiente} disabled={guardando || !puedeAvanzar}>
                                {guardando ? "Guardando..." : puedeAvanzar ? "SIGUIENTE CONTENIDO →" : "Contenido Bloqueado 🔒"}
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Modulo5Contenido13;