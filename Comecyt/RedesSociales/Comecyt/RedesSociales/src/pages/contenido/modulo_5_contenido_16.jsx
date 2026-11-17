// src/pages/contenido/modulo_5_contenido_16.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Download, Heart, Home, Sparkles, CheckCircle, BookOpen } from "lucide-react";
import '@/Css/ModuloFinal.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MODULO_ID = 5;
const NUM_CONTENIDO = 16;

export default function Modulo5Contenido16Agradecimiento() {
    const navigate = useNavigate();
    const [alumno, setAlumno] = useState(null);
    const [generandoCert, setGenerandoCert] = useState(false);
    const [certDescargado, setCertDescargado] = useState(false);

    const correo = localStorage.getItem("correo");
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!correo) {
            navigate("/login");
            return;
        }

        const cargarDatos = async () => {
            try {
                const headers = token ? { Authorization: `Bearer ${token}` } : {};

                const resAlumno = await axios.post(`${API_URL}/api/alumno/datos`, { correo }, { headers });
                setAlumno(resAlumno.data.alumno);

                // Marcar contenido 16 como completado
                await axios.post(`${API_URL}/api/alumno/progreso/actualizar`, {
                    correo,
                    modulo_id: MODULO_ID,
                    progreso_actual: NUM_CONTENIDO
                }, { headers });

            } catch (error) {
                console.error("Error al cargar:", error);
            }
        };

        cargarDatos();
    }, [correo, navigate, token]);

    const descargarCertificado = async () => {
        if (!alumno) return;

        setGenerandoCert(true);
        try {
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const response = await axios.post(
                `${API_URL}/api/certificados/generar`,
                {
                    alumno_id: alumno.alumno_id,
                    nombre: alumno.nombre,
                    apellido: alumno.apellido,
                    correo: alumno.correo,
                    modulo_id: 5,
                    nombreModulo: "Curso Completo de Redes Sociales y Ciberseguridad ÁGORA"
                },
                { responseType: 'blob', headers }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificado_AGORA_${alumno.nombre}_${alumno.apellido}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setCertDescargado(true);
        } catch (err) {
            console.error("Error al generar certificado:", err);
            alert("Error al generar el certificado. Intenta de nuevo.");
        } finally {
            setGenerandoCert(false);
        }
    };

    if (!alumno) {
        return (
            <div className="modulo-final-loading">
                <div className="spinner"></div>
                <p>Cargando...</p>
            </div>
        );
    }

    return (
        <div className="modulo-final-container">
            <div className="confeti-animation">🎉✨🎊</div>

            <div className="graduacion-card">
                <div className="trofeo-icon">
                    <Heart size={80} color="#EF4444" />
                </div>

                <h1 className="titulo-graduacion">
                    ¡Gracias por confiar en ÁGORA, {alumno.nombre}! 💙
                </h1>

                <div className="mensaje-felicitacion">
                    <p className="texto-principal">
                        Has llegado al final de este increíble viaje de aprendizaje
                    </p>

                    <div className="texto-agradecimiento-largo">
                        <p>
                            Desde el equipo ÁGORA queremos expresar nuestro más profundo agradecimiento por tu dedicación,
                            constancia y compromiso durante todo este proceso formativo. Sabemos que cada hora invertida,
                            cada lección completada y cada reto superado representó un esfuerzo real de tu parte, y eso
                            nos llena de orgullo. Has demostrado que el aprendizaje digital no tiene edad ni barreras cuando
                            existe la voluntad de crecer. Durante estos cinco módulos exploraste el mundo del correo electrónico,
                            dominaste Facebook y Marketplace, aprendiste a gestionar WhatsApp Business, conquistaste Instagram
                            y pusiste a prueba tus conocimientos en los retos finales. Cada contenido fue diseñado pensando en
                            ti, en tus necesidades reales como emprendedor, estudiante o profesional que busca adaptarse al mundo
                            digital actual. Tu participación activa en esta plataforma nos motiva a seguir creando contenido de
                            calidad, accesible y transformador. Recuerda que este certificado no es solo un documento, es el
                            testimonio de tu capacidad para aprender, adaptarte y evolucionar. La ciberseguridad y el manejo
                            profesional de redes sociales son habilidades que te acompañarán toda la vida. Sigue practicando,
                            sigue explorando y sobre todo, sigue compartiendo este conocimiento con tu comunidad. ÁGORA siempre
                            será tu casa digital. TECNOLOGICO ESTUDIOS SUPERIORES DE SAN FELIPE DEL PROGRESO.
                        </p>
                    </div>

                    <div className="logros-lista">
                        <div className="logro-item">
                            <CheckCircle size={24} color="#22c55e" />
                            <span>5 Módulos completados</span>
                        </div>
                        <div className="logro-item">
                            <CheckCircle size={24} color="#22c55e" />
                            <span>33 Contenidos dominados</span>
                        </div>
                        <div className="logro-item">
                            <BookOpen size={24} color="#22c55e" />
                            <span>100% de dedicación</span>
                        </div>
                        <div className="logro-item">
                            <Sparkles size={24} color="#22c55e" />
                            <span>Miembro de la comunidad ÁGORA</span>
                        </div>
                    </div>

                    <div className="firma-agora">
                        <Sparkles size={20} />
                        <span>Con cariño, Equipo ÁGORA</span>
                        <Sparkles size={20} />
                    </div>
                </div>

                <div className="acciones-finales">
                    {!certDescargado ? (
                        <button
                            className="btn-descargar-certificado"
                            onClick={descargarCertificado}
                            disabled={generandoCert}
                        >
                            <Download size={24} />
                            {generandoCert ? 'Generando certificado...' : 'Descargar mi Certificado PDF'}
                        </button>
                    ) : (
                        <div className="cert-descargado-msg">
                            <CheckCircle size={24} color="#22c55e" />
                            <span>¡Certificado descargado! Revísalo en tu carpeta de Descargas</span>
                        </div>
                    )}

                    <button
                        className="btn-volver-inicio"
                        onClick={() => navigate("/inicio")}
                    >
                        <Home size={20} />
                        Volver al Inicio
                    </button>
                </div>

                <div className="stats-finales">
                    <div className="stat-final">
                        <h3>100%</h3>
                        <p>Curso Completado</p>
                    </div>
                    <div className="stat-final">
                        <h3>33/33</h3>
                        <p>Contenidos</p>
                    </div>
                    <div className="stat-final">
                        <h3>5/5</h3>
                        <p>Módulos</p>
                    </div>
                </div>
            </div>
        </div>
    );
}