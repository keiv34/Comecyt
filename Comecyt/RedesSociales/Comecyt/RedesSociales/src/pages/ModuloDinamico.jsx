import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGuardarProgreso } from "../hooks/useGuardarProgreso";
import { MODULOS } from "../curso/catalogo";
import { Toaster } from "react-hot-toast";

const archivos = import.meta.glob("./contenido/*.jsx");
const archivosDelCurso = new Set(MODULOS.flatMap(modulo => modulo.temas.map(tema => tema.archivo)));
const componentes = Object.fromEntries([...archivosDelCurso].map(archivo => [archivo, lazy(archivos[`./contenido/${archivo}`])]));

export default function ModuloDinamico() {
    const { id, contenidoId } = useParams();
    const modulo = MODULOS.find(item => item.id === Number(id));
    const tema = modulo?.temas[Number(contenidoId ?? 1) - 1];

    if (!tema) {
        return <p>Lección no encontrada. <Link to="/temario">Volver al temario</Link></p>;
    }

    return <Leccion key={`${modulo.id}/${tema.contenidoId}`} modulo={modulo} tema={tema} />;
}

function Leccion({ modulo, tema }) {
    const { api, user, loading } = useAuth();
    const navigate = useNavigate();
    const moduloId = modulo.id;
    const numContenido = tema.contenidoId;
    const esUltimaLeccion = numContenido === modulo.fin;
    const Componente = componentes[tema.archivo];
    const [acceso, setAcceso] = useState(null);
    const [temaCompletado, setTemaCompletado] = useState(false);
    const { completarContenido, cargandoProgreso } = useGuardarProgreso(numContenido, moduloId);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!user) return;

        const controller = new AbortController();
        api.get(`/api/alumno/modulo/${moduloId}/contenido/${numContenido}`, { signal: controller.signal })
            .then(({ data }) => setAcceso({ permitido: true, vistaPrevia: data.vista_previa === true }))
            .catch(error => {
                if (!controller.signal.aborted) {
                    setAcceso({ permitido: false, mensaje: error.response?.data?.error || "No se pudo abrir la lección." });
                }
            });
        return () => controller.abort();
    }, [api, user, moduloId, numContenido]);

    if (loading) return <div className="cargando-container">Cargando...</div>;
    if (!user) return null;
    if (!acceso) return <div className="cargando-container">Cargando lección...</div>;
    if (!acceso.permitido) return <p>{acceso.mensaje} <Link to="/temario">Volver al temario</Link></p>;

    const manejarRetoCompletado = async () => {
        if (temaCompletado) return true;
        if (!acceso.vistaPrevia && (cargandoProgreso || !(await completarContenido()))) return false;
        setTemaCompletado(true);
        return true;
    };

    const irAlSiguiente = () => {
        navigate(esUltimaLeccion ? "/temario" : `/modulo/${moduloId}/contenido/${numContenido + 1}`);
    };

    return (
        <div className="modulo-dinamico-wrapper" style={{ paddingBottom: '40px' }}>
            <Toaster position="top-center" />
            {acceso.vistaPrevia && <p role="status" style={{ textAlign: "center" }}>Vista previa · El avance y los intentos de esta sesión no se guardan.</p>}
            <Suspense fallback={<div>Cargando lección...</div>}>
                <Componente onComplete={manejarRetoCompletado} navigate={navigate} moduloId={moduloId} numContenido={numContenido} tituloModulo={modulo.titulo} />
            </Suspense>

            {(temaCompletado || acceso.vistaPrevia) && (
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
                        {esUltimaLeccion ? "Volver al temario" : "Siguiente lección →"}
                    </button>
                </div>
            )}
        </div>
    );
}
