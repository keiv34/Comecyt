// src/pages/Temario.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { MessageCircle, CheckCircle2, Lock, Circle } from "lucide-react";
import "../Css/Temario.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Temario() {
  const navigate = useNavigate();
  const [completados, setCompletados] = useState({});
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const correo = localStorage.getItem("correo");

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const cargarProgreso = async () => {
      if (!correo) { setLoading(false); return; }
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `${API_URL}/api/alumno/progreso`,
          { correo },
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        const agrupados = {};
        const modulos = res.data?.modulos || [];
        modulos.forEach(modulo => {
          const progreso = Number(modulo.progreso_actual || 0);
          if (progreso > 0) {
            agrupados[modulo.modulo_id] = Array.from({ length: progreso }, (_, i) => i + 1);
          }
        });
        setCompletados(agrupados);
      } catch (error) {
        console.error("Error cargando progreso:", error);
        setCompletados({});
      } finally {
        setLoading(false);
      }
    };
    cargarProgreso();
  }, [correo]);

  const secciones = [
    {
      titulo: "Correo Electrónico", icon: "📧", moduloId: 1, temas: [
        { id: 1, nombre: "Introducción al correo electrónico", contenidoId: 1 },
        { id: 2, nombre: "Crear correo Electrónico Gmail", contenidoId: 2 },
        { id: 3, nombre: "Interfaz principal de Gmail", contenidoId: 3 },
        { id: 4, nombre: "Panel lateral izquierdo", contenidoId: 4 },
        { id: 5, nombre: "Categorías y etiquetas en Gmail", contenidoId: 5 },
        { id: 6, nombre: "Barra de herramientas", contenidoId: 6 },
        { id: 7, nombre: "Configuración y personalización", contenidoId: 7 },
        { id: 8, nombre: "Examen de correo electrónico", contenidoId: 8 },
      ]
    },
    {
      titulo: "Facebook y Marketplace", icon: "👥", moduloId: 2, temas: [
        { id: 9, nombre: "Introducción a Facebook", contenidoId: 1 },
        { id: 10, nombre: "Funciones principales", contenidoId: 2 },
        { id: 11, nombre: "Páginas, grupos y eventos", contenidoId: 3 },
        { id: 12, nombre: "Seguridad y configuración", contenidoId: 4 },
        { id: 13, nombre: "Marketplace y seguridad", contenidoId: 5 },
        { id: 14, nombre: "Examen de Facebook", contenidoId: 6 },
      ]
    },
    {
      titulo: "WhatsApp y WhatsApp Business", icon: "📱", moduloId: 3, temas: [
        { id: 15, nombre: "Introducción a WhatsApp", contenidoId: 1 },
        { id: 16, nombre: "Registro y configuración", contenidoId: 2 },
        { id: 17, nombre: "Llamadas y grupos", contenidoId: 3 },
        { id: 18, nombre: "Seguridad avanzada", contenidoId: 4 },
        { id: 19, nombre: "WhatsApp Business: Perfil", contenidoId: 5 },
        { id: 20, nombre: "Catálogo y estadísticas", contenidoId: 6 },
        { id: 21, nombre: "Examen de WhatsApp", contenidoId: 7 },
      ]
    },
    {
      titulo: "Instagram", icon: "📸", moduloId: 4, temas: [
        { id: 22, nombre: "Introducción a Instagram", contenidoId: 1 },
        { id: 23, nombre: "Configuración inicial", contenidoId: 2 },
        { id: 24, nombre: "Publicaciones en el feed", contenidoId: 3 },
        { id: 25, nombre: "Historias y Reels", contenidoId: 4 },
        { id: 26, nombre: "Herramientas de descubrimiento", contenidoId: 5 },
        { id: 27, nombre: "Instagram para negocios", contenidoId: 6 },
        { id: 28, nombre: "Buenas prácticas", contenidoId: 7 },
        { id: 29, nombre: "Examen de Instagram", contenidoId: 8 },
      ]
    },
    {
      titulo: "Retos Educaplay", icon: "🎮", moduloId: 5, temas: [
        { id: 30, nombre: "Reto: Sopa de letras digital", contenidoId: 1 },
        { id: 31, nombre: "Reto: Crucigrama de redes sociales", contenidoId: 2 },
        { id: 32, nombre: "Reto final: Memorama tecnológico", contenidoId: 3 },
        { id: 33, nombre: "Reto: Correo Electrónico Experto", contenidoId: 4 },
        { id: 34, nombre: "Reto: Sopa - WhatsApp Business", contenidoId: 5 },
        { id: 35, nombre: "Reto: Sopa - Llamadas Telefónicas", contenidoId: 6 },
        { id: 36, nombre: "Reto: Sopa - SMS/Smishing", contenidoId: 7 },
        { id: 37, nombre: "Reto: Sopa - Extorsión Telefónica", contenidoId: 8 },
        { id: 38, nombre: "Reto: Sopa - Premios Falsos", contenidoId: 9 },
        { id: 39, nombre: "Reto: Crucigrama - Ciberseguridad", contenidoId: 10 },
        { id: 40, nombre: "Reto final: Memorama Tecnológico 2", contenidoId: 11 },
        { id: 41, nombre: "Reto: Sopa de letras - Seguridad Avanzada", contenidoId: 12 },
        { id: 42, nombre: "Reto: Simulador Telefónico - Anti-Vishing", contenidoId: 13 },
        { id: 43, nombre: "Reto: Blindaje de Cuenta - WhatsApp Seguro", contenidoId: 14 },
        { id: 44, nombre: "Reto final: Reclutamiento Seguro - Anti-JobScams", contenidoId: 15 },
      ]
    }
  ];

  const estaCompletado = (moduloId, contenidoId) => {
    return completados[moduloId]?.includes(contenidoId) || false;
  };

  const estaBloqueado = (moduloId, contenidoId) => {
    if (contenidoId === 1) return false;
    return !estaCompletado(moduloId, contenidoId - 1);
  };

  const handleClick = (tema, moduloId) => {
    if (estaBloqueado(moduloId, tema.contenidoId)) {
      alert("Contenido bloqueado. Debes completar los temas anteriores en orden.");
      return;
    }
    window.scrollTo(0, 0);
    navigate(`/modulo/${moduloId}/contenido/${tema.contenidoId}`);
  };

  if (loading) return <div className="temario-container"><p>Cargando progreso...</p></div>;

  return (
    <div className="temario-container">
      <h1 className="temario-titulo">📋 Temario del Curso</h1>
      {secciones.map((seccion, idx) => (
        <div key={idx} className="modulo-card">
          <h2 className="modulo-titulo">{seccion.icon} {seccion.titulo}</h2>
          <div className="temas-lista">
            {seccion.temas.map((tema) => {
              const completado = estaCompletado(seccion.moduloId, tema.contenidoId);
              const bloqueado = estaBloqueado(seccion.moduloId, tema.contenidoId);
              return (
                <div key={tema.id} className={`tema-item ${bloqueado ? 'bloqueado' : 'disponible'} ${completado ? 'completado' : ''}`} onClick={() => handleClick(tema, seccion.moduloId)}>
                  <span className="tema-icono">
                    {bloqueado ? <Lock size={16} /> : completado ? <CheckCircle2 size={16} color="#22c55e" /> : <Circle size={16} color="#94a3b8" />}
                  </span>
                  <span className="tema-nombre">{tema.contenidoId}. {tema.nombre}</span>
                  {completado && <span className="check-text">Completado</span>}
                  {bloqueado && <span className="check-text">Bloqueado</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="whatsapp-support-container">
        <a href="https://wa.me/527121265349" className="whatsapp-float-btn" target="_blank" rel="noopener noreferrer">
          <div className="float-content"><MessageCircle size={24} /><span>Ayuda WhatsApp</span></div>
        </a>
      </div>
    </div>
  );
}

export default Temario;
