import { createElement, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, CircleAlert, CircleCheck,
  GraduationCap, LifeBuoy, MessageCircle, Presentation, ShieldCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import CampoClave from "../Components/common/CampoClave";
import MarcoAcceso from "../Components/common/MarcoAcceso";

const perfiles = [
  { id: "alumno", nombre: "Alumno", detalle: "Cursos, actividades y avance", icono: GraduationCap, destino: "/inicio" },
  { id: "docente", nombre: "Docente", detalle: "Grupos y calificaciones", icono: Presentation, destino: "/docente/inicio" },
  { id: "admin", nombre: "Administrador", detalle: "Usuarios y gestión de la plataforma", icono: ShieldCheck, destino: "/admin/inicio" }
];

export default function Acceso() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const encabezado = useRef(null);
  const [perfil, setPerfil] = useState(() => perfiles.find(item => item.id === state?.registro));
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const esAdmin = perfil?.id === "admin";

  function elegirPerfil(nuevoPerfil) {
    setError("");
    setPerfil(nuevoPerfil);
    encabezado.current?.focus();
  }

  async function ingresar(evento) {
    evento.preventDefault();
    if (cargando) return;
    const formulario = evento.currentTarget;
    const campos = new FormData(formulario);
    const usuario = campos.get("usuario").trim();
    const contraseña = campos.get("contraseña");
    if (!usuario || !contraseña) {
      setError("Completa tus datos para iniciar sesión.");
      return;
    }
    if (!esAdmin && formulario.elements.usuario.validity.typeMismatch) {
      setError("Escribe un correo electrónico válido.");
      return;
    }
    setError("");
    setCargando(true);
    try {
      const resultado = await login(usuario, contraseña);
      if (!resultado.success) {
        setError(resultado.error || "No pudimos iniciar sesión. Intenta de nuevo.");
        return;
      }
      const destino = perfiles.find(item => item.id === resultado.role)?.destino ?? "/inicio";
      navigate(destino, { replace: true });
    } catch {
      setError("No pudimos conectar con ÁGORA. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <MarcoAcceso tituloId="titulo-acceso">
      {perfil && (
        <button className="acceso-agora__volver" type="button" onClick={() => elegirPerfil(null)} disabled={cargando}>
          <ArrowLeft size={17} aria-hidden="true" /> Cambiar perfil
        </button>
      )}
      <h2 id="titulo-acceso" ref={encabezado} tabIndex={-1}>{perfil ? `Acceso de ${perfil.nombre.toLowerCase()}` : "Ingresa a ÁGORA"}</h2>
      <p className="acceso-agora__indicacion">{perfil ? "Ingresa tus datos para continuar." : "Elige el perfil con el que vas a ingresar."}</p>
      {state?.registro && <div className="acceso-agora__alerta acceso-agora__alerta--exito" role="status"><CircleCheck size={20} aria-hidden="true" /><span>Tu cuenta está lista. Ya puedes iniciar sesión.</span></div>}

      {perfil ? (
        <form className="acceso-agora__formulario" onSubmit={ingresar} aria-busy={cargando} noValidate>
          {error && <div className="acceso-agora__alerta" role="alert"><CircleAlert size={20} aria-hidden="true" /><span>{error}</span></div>}
          <label htmlFor="acceso-usuario">{esAdmin ? "Usuario" : "Correo electrónico"}</label>
          <input id="acceso-usuario" name="usuario" type={esAdmin ? "text" : "email"} autoComplete="username"
            autoCapitalize="none" spellCheck={false} placeholder={esAdmin ? "Tu nombre de usuario" : "tu@correo.com"} required />
          <CampoClave id="acceso-clave" name="contraseña" etiqueta="Contraseña" autoComplete="current-password" />
          <button className="acceso-agora__enviar" type="submit" disabled={cargando}>
            {cargando ? "Iniciando sesión…" : "Iniciar sesión"} <ArrowRight size={19} aria-hidden="true" />
          </button>
          <Link className="acceso-agora__registro" to={`/registro?rol=${perfil.id}`}>Crear una cuenta</Link>
        </form>
      ) : (
        <div className="acceso-agora__perfiles">
          {perfiles.map(({ id, nombre, detalle, icono }) => (
            <button key={id} className="acceso-agora__perfil" type="button" onClick={() => elegirPerfil({ id, nombre })}>
              <span className="acceso-agora__icono">{createElement(icono, { size: 22, "aria-hidden": true })}</span>
              <span><strong>{nombre}</strong><small>{detalle}</small></span>
              <ArrowRight className="acceso-agora__flecha" size={18} aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      <footer className="acceso-agora__pie">
        <a href="https://wa.me/527121265349" target="_blank" rel="noopener noreferrer"><LifeBuoy size={17} aria-hidden="true" /> Ayuda por WhatsApp</a>
        {!perfil && <Link to="/whatsapp-panel"><MessageCircle size={17} aria-hidden="true" /> Panel de WhatsApp</Link>}
      </footer>
    </MarcoAcceso>
  );
}
