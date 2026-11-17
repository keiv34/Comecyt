// src/pages/ModuloDinamico.jsx
import { lazy, Suspense, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGuardarProgreso } from "../hooks/useGuardarProgreso";
import { toast, Toaster } from "react-hot-toast";

// --- MÓDULO 1: CORREO ELECTRÓNICO (1-8) ---
const Contenido1 = lazy(() => import("./contenido/modulo_1_contenido_1.jsx").then(m => ({ default: m.Contenido1 || m.default })));
const Contenido2 = lazy(() => import("./contenido/modulo_1_contenido_2.jsx").then(m => ({ default: m.Contenido2 || m.default })));
const Contenido3 = lazy(() => import("./contenido/modulo_1_contenido_3.jsx").then(m => ({ default: m.Contenido3 || m.default })));
const Contenido4 = lazy(() => import("./contenido/modulo_1_contenido_4.jsx").then(m => ({ default: m.Contenido4 || m.default })));
const Contenido5 = lazy(() => import("./contenido/modulo_1_contenido_5.jsx").then(m => ({ default: m.Contenido5 || m.default })));
const Contenido6 = lazy(() => import("./contenido/modulo_1_contenido_6.jsx").then(m => ({ default: m.Contenido6 || m.default })));
const Contenido7 = lazy(() => import("./contenido/modulo_1_contenido_7.jsx").then(m => ({ default: m.Contenido7 || m.default })));
const Contenido8 = lazy(() => import("./contenido/modulo_1_contenido_8_Eval.jsx").then(m => ({ default: m.Contenido8 || m.default })));

// --- MÓDULO 2: FACEBOOK (1-6) ---
const Modulo2Contenido1 = lazy(() => import("./contenido/modulo_2_contenido_1.jsx").then(m => ({ default: m.default })));
const Modulo2Contenido2 = lazy(() => import("./contenido/modulo_2_contenido_2.jsx").then(m => ({ default: m.default })));
const Modulo2Contenido3 = lazy(() => import("./contenido/modulo_2_contenido_3.jsx").then(m => ({ default: m.default })));
const Modulo2Contenido4 = lazy(() => import("./contenido/modulo_2_contenido_4.jsx").then(m => ({ default: m.default })));
const Modulo2Contenido5 = lazy(() => import("./contenido/modulo_2_contenido_5.jsx").then(m => ({ default: m.default })));
const Modulo2Contenido6 = lazy(() => import("./contenido/modulo_2_contenido_6_Eval.jsx").then(m => ({ default: m.default })));

// --- MÓDULO 3: WHATSAPP (1-7) ---
const Contenido15 = lazy(() => import("./contenido/modulo_3_contenido_1.jsx").then(m => ({ default: m.Contenido15 || m.default })));
const Contenido16 = lazy(() => import("./contenido/modulo_3_contenido_2.jsx").then(m => ({ default: m.Contenido16 || m.default })));
const Contenido17 = lazy(() => import("./contenido/modulo_3_contenido_3.jsx").then(m => ({ default: m.Contenido17 || m.default })));
const Contenido18 = lazy(() => import("./contenido/modulo_3_contenido_4.jsx").then(m => ({ default: m.Contenido18 || m.default })));
const Contenido19 = lazy(() => import("./contenido/modulo_3_contenido_5.jsx").then(m => ({ default: m.Contenido19 || m.default })));
const Contenido20 = lazy(() => import("./contenido/modulo_3_contenido_6.jsx").then(m => ({ default: m.Contenido20 || m.default })));
const Contenido21 = lazy(() => import("./contenido/modulo_3_contenido_7_Eval.jsx").then(m => ({ default: m.Contenido21 || m.default })));

// --- MÓDULO 4: INSTAGRAM (1-8) ---
const Contenido22 = lazy(() => import("./contenido/modulo_4_contenido_1.jsx").then(m => ({ default: m.Contenido22 || m.default })));
const Contenido23 = lazy(() => import("./contenido/modulo_4_contenido_2.jsx").then(m => ({ default: m.Contenido23 || m.default })));
const Contenido24 = lazy(() => import("./contenido/modulo_4_contenido_3.jsx").then(m => ({ default: m.Contenido24 || m.default })));
const Contenido25 = lazy(() => import("./contenido/modulo_4_contenido_4.jsx").then(m => ({ default: m.Contenido25 || m.default })));
const Contenido26 = lazy(() => import("./contenido/modulo_4_contenido_5.jsx").then(m => ({ default: m.Contenido26 || m.default })));
const Contenido27 = lazy(() => import("./contenido/modulo_4_contenido_6.jsx").then(m => ({ default: m.Contenido27 || m.default })));
const Contenido28 = lazy(() => import("./contenido/modulo_4_contenido_7.jsx").then(m => ({ default: m.Contenido28 || m.default })));
const Contenido29 = lazy(() => import("./contenido/modulo_4_contenido_8_Eval.jsx").then(m => ({ default: m.Contenido29 || m.default })));

// --- MÓDULO 5: EDUCAPLAY (1-16) ---
const Contenido30 = lazy(() => import("./contenido/modulo_5_contenido_1.jsx").then(m => ({ default: m.Contenido30 || m.default })));
const Contenido31 = lazy(() => import("./contenido/modulo_5_contenido_2.jsx").then(m => ({ default: m.Contenido31 || m.default })));
const Contenido32 = lazy(() => import("./contenido/modulo_5_contenido_3.jsx").then(m => ({ default: m.Contenido32 || m.default })));
const Contenido33 = lazy(() => import("./contenido/modulo_5_contenido_4.jsx").then(m => ({ default: m.Contenido33 || m.default })));
const Contenido34 = lazy(() => import("./contenido/modulo_5_contenido_5.jsx").then(m => ({ default: m.Contenido34 || m.default })));
const Contenido35 = lazy(() => import("./contenido/modulo_5_contenido_6.jsx").then(m => ({ default: m.Contenido35 || m.default })));
const Contenido36 = lazy(() => import("./contenido/modulo_5_contenido_7.jsx").then(m => ({ default: m.Contenido36 || m.default })));
const Contenido37 = lazy(() => import("./contenido/modulo_5_contenido_8.jsx").then(m => ({ default: m.Contenido37 || m.default })));
const Contenido38 = lazy(() => import("./contenido/modulo_5_contenido_9.jsx").then(m => ({ default: m.Contenido38 || m.default })));
const Contenido39 = lazy(() => import("./contenido/modulo_5_contenido_10.jsx").then(m => ({ default: m.Contenido39 || m.default })));
const Contenido40 = lazy(() => import("./contenido/modulo_5_contenido_11.jsx").then(m => ({ default: m.Contenido40 || m.default })));
const Contenido41 = lazy(() => import("./contenido/modulo_5_contenido_12.jsx").then(m => ({ default: m.Contenido41 || m.default })));
const Contenido42 = lazy(() => import("./contenido/modulo_5_contenido_13.jsx").then(m => ({ default: m.Contenido42 || m.default })));
const Contenido43 = lazy(() => import("./contenido/modulo_5_contenido_14.jsx").then(m => ({ default: m.Contenido43 || m.default })));
const Contenido44 = lazy(() => import("./contenido/modulo_5_contenido_15.jsx").then(m => ({ default: m.Contenido44 || m.default })));
const Modulo5Contenido16Agradecimiento = lazy(() => import("./contenido/modulo_5_contenido_16.jsx").then((m) => ({ default: m.default })));

function ModuloDinamico() {
    const { id, contenidoId } = useParams();
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const moduloId = parseInt(id) || 1;
    const numContenido = parseInt(contenidoId) || 1;

    const [temaCompletado, setTemaCompletado] = useState(false);
    const { cargandoProgreso, completarContenido } = useGuardarProgreso(numContenido, moduloId);

    useEffect(() => {
        setTemaCompletado(false);
        window.scrollTo(0, 0);
    }, [numContenido]);

    if (loading || cargandoProgreso) {
        return <div className="cargando-container">Cargando...</div>;
    }

    if (!user) return null;

    const manejarRetoCompletado = async () => {
        await completarContenido();
        setTemaCompletado(true);
        toast.success('¡Contenido completado!');
    };

    const irAlSiguiente = () => {
        window.scrollTo(0, 0);

        let maxContenido;
        switch (moduloId) {
            case 1: maxContenido = 8; break;
            case 2: maxContenido = 6; break;
            case 3: maxContenido = 7; break;
            case 4: maxContenido = 8; break;
            case 5: maxContenido = 16; break;
            default: maxContenido = 44;
        }

        if (numContenido < maxContenido) {
            navigate(`/modulo/${moduloId}/contenido/${numContenido + 1}`);
        } else {
            toast.success('¡Módulo completado!');
            navigate("/temario");
        }
    };

    const propsComunes = {
        onComplete: manejarRetoCompletado,
        navigate,
        moduloId,
        numContenido
    };

    const ComponenteRender = () => {
        if (moduloId === 2) {
            switch (numContenido) {
                case 1: return <Modulo2Contenido1 {...propsComunes} />;
                case 2: return <Modulo2Contenido2 {...propsComunes} />;
                case 3: return <Modulo2Contenido3 {...propsComunes} />;
                case 4: return <Modulo2Contenido4 {...propsComunes} />;
                case 5: return <Modulo2Contenido5 {...propsComunes} />;
                case 6: return <Modulo2Contenido6 {...propsComunes} />;
                default: return <div>Contenido de Facebook no encontrado</div>;
            }
        }

        if (moduloId === 5) {
            switch (numContenido) {
                case 1: return <Contenido30 {...propsComunes} />;
                case 2: return <Contenido31 {...propsComunes} />;
                case 3: return <Contenido32 {...propsComunes} />;
                case 4: return <Contenido33 {...propsComunes} />;
                case 5: return <Contenido34 {...propsComunes} />;
                case 6: return <Contenido35 {...propsComunes} />;
                case 7: return <Contenido36 {...propsComunes} />;
                case 8: return <Contenido37 {...propsComunes} />;
                case 9: return <Contenido38 {...propsComunes} />;
                case 10: return <Contenido39 {...propsComunes} />;
                case 11: return <Contenido40 {...propsComunes} />;
                case 12: return <Contenido41 {...propsComunes} />;
                case 13: return <Contenido42 {...propsComunes} />;
                case 14: return <Contenido43 {...propsComunes} />;
                case 15: return <Contenido44 {...propsComunes} />;
                case 16: return <Modulo5Contenido16Agradecimiento {...propsComunes} />;
                default: return <div>Contenido no encontrado</div>;
            }
        }

        // Módulos 1, 3, 4 con numeración global
        switch (numContenido) {
            case 1: return <Contenido1 {...propsComunes} />;
            case 2: return <Contenido2 {...propsComunes} />;
            case 3: return <Contenido3 {...propsComunes} />;
            case 4: return <Contenido4 {...propsComunes} />;
            case 5: return <Contenido5 {...propsComunes} />;
            case 6: return <Contenido6 {...propsComunes} />;
            case 7: return <Contenido7 {...propsComunes} />;
            case 8: return <Contenido8 {...propsComunes} />;
            case 15: return <Contenido15 {...propsComunes} />;
            case 16: return <Contenido16 {...propsComunes} />;
            case 17: return <Contenido17 {...propsComunes} />;
            case 18: return <Contenido18 {...propsComunes} />;
            case 19: return <Contenido19 {...propsComunes} />;
            case 20: return <Contenido20 {...propsComunes} />;
            case 21: return <Contenido21 {...propsComunes} />;
            case 22: return <Contenido22 {...propsComunes} />;
            case 23: return <Contenido23 {...propsComunes} />;
            case 24: return <Contenido24 {...propsComunes} />;
            case 25: return <Contenido25 {...propsComunes} />;
            case 26: return <Contenido26 {...propsComunes} />;
            case 27: return <Contenido27 {...propsComunes} />;
            case 28: return <Contenido28 {...propsComunes} />;
            case 29: return <Contenido29 {...propsComunes} />;
            default: return <div>Contenido no encontrado</div>;
        }
    };

    return (
        <div className="modulo-dinamico-wrapper" style={{ paddingBottom: '40px' }}>
            <Toaster position="top-center" />
            <Suspense fallback={<div>Cargando lección...</div>}>
                <ComponenteRender />
            </Suspense>

            {temaCompletado && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                    <button
                        onClick={irAlSiguiente}
                        style={{
                            padding: '14px 32px',
                            background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                            transition: 'transform 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {moduloId === 2 && numContenido === 6 ? "🎉 Finalizar Facebook e Ir al Temario" :
                            moduloId === 5 && numContenido === 16 ? "🎓 Finalizar Curso" :
                                `Siguiente Lección (Ir al ${numContenido + 1}) →`}
                    </button>
                </div>
            )}
        </div>
    );
}

export default ModuloDinamico;