import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, CircleAlert } from "lucide-react";
import CampoClave from "../Components/common/CampoClave";
import MarcoAcceso from "../Components/common/MarcoAcceso";

const API_URL = import.meta.env.VITE_API_URL || "";
const perfiles = new Map([
  ["alumno", "alumno"], ["docente", "docente"], ["admin", "administrador"]
]);

export default function Registro() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const perfilSolicitado = searchParams.get("rol");
  const rol = perfiles.has(perfilSolicitado) ? perfilSolicitado : "alumno";
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function registrar(evento) {
    evento.preventDefault();
    if (cargando) return;

    const formulario = evento.currentTarget;
    const campos = new FormData(formulario);
    const nombre = campos.get("nombre").trim();
    const apellido = campos.get("apellido").trim();
    const correo = campos.get("correo").trim().toLowerCase();
    const contraseña = campos.get("contraseña");
    const telefono = campos.get("telefono").trim();

    if (!nombre || !apellido || !correo || !contraseña || !campos.get("confirmar")) {
      setError("Completa los campos obligatorios.");
      return;
    }
    if (!formulario.elements.correo.validity.valid || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError("Escribe un correo electrónico válido.");
      return;
    }
    if (contraseña.length < 6) {
      setError("Usa al menos 6 caracteres en la contraseña.");
      return;
    }
    if (contraseña !== campos.get("confirmar")) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setError("");
    setCargando(true);
    try {
      const respuesta = await fetch(`${API_URL}/api/auth/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, correo, contraseña, telefono, rol })
      });
      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => null);
        setError(datos?.message || "No pudimos crear tu cuenta. Intenta de nuevo.");
        return;
      }
      navigate("/login", { replace: true, state: { registro: rol } });
    } catch {
      setError("No pudimos conectar con ÁGORA. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <MarcoAcceso tituloId="titulo-registro">
      <h2 id="titulo-registro">Crear cuenta de {perfiles.get(rol)}</h2>
      <p className="acceso-agora__indicacion">Completa tus datos. El teléfono es opcional.</p>
      <form className="acceso-agora__formulario" onSubmit={registrar} aria-busy={cargando} noValidate>
        {error && <div className="acceso-agora__alerta" role="alert"><CircleAlert size={20} aria-hidden="true" /><span>{error}</span></div>}
        <label htmlFor="registro-nombre">Nombre</label>
        <input id="registro-nombre" name="nombre" autoComplete="given-name" maxLength={100} required />
        <label htmlFor="registro-apellido">Apellido</label>
        <input id="registro-apellido" name="apellido" autoComplete="family-name" maxLength={100} required />
        <label htmlFor="registro-correo">Correo electrónico</label>
        <input id="registro-correo" name="correo" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} maxLength={150} required />
        <label htmlFor="registro-telefono">Teléfono (opcional)</label>
        <input id="registro-telefono" name="telefono" type="tel" autoComplete="tel" maxLength={20} />
        <CampoClave id="registro-clave" name="contraseña" etiqueta="Contraseña" autoComplete="new-password" minLength={6} />
        <CampoClave id="registro-confirmar" name="confirmar" etiqueta="Confirmar contraseña" autoComplete="new-password" />
        <button className="acceso-agora__enviar" type="submit" disabled={cargando}>
          {cargando ? "Creando cuenta…" : "Crear cuenta"} <ArrowRight size={19} aria-hidden="true" />
        </button>
        <Link className="acceso-agora__registro" to="/login">Ya tengo cuenta</Link>
      </form>
    </MarcoAcceso>
  );
}
