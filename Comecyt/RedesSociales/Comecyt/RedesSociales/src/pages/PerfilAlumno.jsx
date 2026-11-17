import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Camera, FileText, GraduationCap, LogOut, Pencil } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PREFIJO_AVATAR } from "../context/limpiarSesion";
import AvatarAlumno from "../Components/common/AvatarAlumno";
import DescargarConstancia from "../Components/common/DescargarConstancia";
import { MODULOS, TOTAL_CONTENIDOS } from "../curso/catalogo";
import "../Css/PanelAlumno.css";

const AVATARES = { neutro: "Iniciales", hombre: "Hombre", mujer: "Mujer" };
const formatosFoto = ["image/jpeg", "image/png", "image/webp"];

function leerAvatar(clave) {
  try {
    return JSON.parse(localStorage.getItem(clave)) ?? { tipo: "neutro" };
  } catch {
    return { tipo: "neutro" };
  }
}

export default function PerfilAlumno() {
  const { api, user, logout, actualizarUsuario } = useAuth();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [certificados, setCertificados] = useState(null);
  const [progreso, setProgreso] = useState(null);
  const [error, setError] = useState(false);
  const [editando, setEditando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const clave = PREFIJO_AVATAR + user?.correo;
  const [avatar, setAvatar] = useState(() => leerAvatar(clave));

  useEffect(() => {
    if (!user?.correo) return;
    const controller = new AbortController();
    const options = { signal: controller.signal };
    const body = { correo: user.correo };
    api.post("/api/alumno/datos", body, options).then(({ data }) => setDatos(data.alumno))
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    api.post("/api/alumno/certificados", body, options).then(({ data }) => setCertificados(data.certificados || []))
      .catch(() => { if (!controller.signal.aborted) setCertificados(false); });
    api.get("/api/alumno/progreso", options).then(({ data }) => setProgreso(data.modulos))
      .catch(() => { if (!controller.signal.aborted) setProgreso(false); });
    return () => controller.abort();
  }, [api, user?.correo]);

  function elegirAvatar(nuevo) {
    try {
      localStorage.setItem(clave, JSON.stringify(nuevo));
      setAvatar(nuevo);
      setMensaje(null);
    } catch {
      setMensaje({ error: true, texto: "No pudimos guardar el avatar en este navegador." });
    }
  }

  function elegirFoto(evento) {
    const archivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!archivo) return;
    if (!formatosFoto.includes(archivo.type) || archivo.size > 512 * 1024) {
      setMensaje({ error: true, texto: "Elige una imagen JPG, PNG o WebP de hasta 512 KB." });
      return;
    }
    const lector = new FileReader();
    lector.onload = () => elegirAvatar({ tipo: "foto", src: lector.result });
    lector.onerror = () => setMensaje({ error: true, texto: "No pudimos leer la foto." });
    lector.readAsDataURL(archivo);
  }

  async function guardar(evento) {
    evento.preventDefault();
    const campos = new FormData(evento.currentTarget);
    const nombre = campos.get("nombre").trim();
    const apellido = campos.get("apellido").trim();
    if (!nombre) {
      setMensaje({ error: true, texto: "Escribe tu nombre." });
      return;
    }
    setOcupado(true);
    setMensaje(null);
    try {
      await api.post("/api/alumno/actualizar", { alumno_id: datos.alumno_id, nombre, apellido });
      setDatos(anterior => ({ ...anterior, nombre, apellido }));
      actualizarUsuario({ nombre, apellido });
      setEditando(false);
      setMensaje({ texto: "Tus datos se actualizaron." });
    } catch {
      setMensaje({ error: true, texto: "No pudimos guardar tus datos. Intenta de nuevo." });
    } finally {
      setOcupado(false);
    }
  }

  if (!datos) return <div className="panel-alumno"><p role={error ? "alert" : "status"}>{error ? "No pudimos cargar tu perfil." : "Cargando tu perfil…"}</p></div>;
  const nombre = [datos.nombre, datos.apellido].filter(Boolean).join(" ");
  const avances = new Map((progreso || []).map(item => [item.modulo_id, item.progreso_actual]));
  const completados = MODULOS.filter(item => (avances.get(item.id) ?? 0) >= item.fin).length;
  const vistos = MODULOS.reduce((total, item) => total + Math.min(item.fin, avances.get(item.id) ?? 0), 0);
  const emitidas = new Map((certificados || []).map(certificado => [certificado.modulo_id, certificado]));
  const disponibles = new Set((progreso || []).filter(modulo => modulo.constancia_disponible).map(modulo => modulo.modulo_id));
  const constancias = MODULOS.filter(modulo => disponibles.has(modulo.id) || emitidas.has(modulo.id));

  return (
    <div className="panel-alumno">
      <header className="panel-alumno__portada">
        <div className="panel-alumno__identidad">
          {avatar.tipo === "foto" ? <img className="panel-alumno__avatar" src={avatar.src} alt={`Foto de ${nombre}`} /> : <AvatarAlumno tipo={avatar.tipo} nombre={nombre} />}
          <div><p className="panel-alumno__marca">Mi perfil</p><h1>{nombre}</h1><p>Estudiante ÁGORA</p></div>
        </div>
        <button className="panel-alumno__boton panel-alumno__boton--claro" onClick={() => { logout(); navigate("/login", { replace: true }); }}><LogOut size={18} aria-hidden="true" /> Cerrar sesión</button>
      </header>
      {mensaje && <p className={`panel-alumno__mensaje${mensaje.error ? " panel-alumno__mensaje--error" : ""}`} role={mensaje.error ? "alert" : "status"}>{mensaje.texto}</p>}
      <section className="panel-alumno__tarjeta" aria-labelledby="datos-perfil">
        <h2 id="datos-perfil">Datos personales</h2>
        {editando ? (
          <form className="panel-alumno__formulario" onSubmit={guardar}>
            <label>Nombre<input name="nombre" autoComplete="given-name" defaultValue={datos.nombre} required /></label>
            <label>Apellidos<input name="apellido" autoComplete="family-name" defaultValue={datos.apellido} /></label>
            <div className="panel-alumno__fila">
              <button className="panel-alumno__boton" disabled={ocupado}>{ocupado ? "Guardando…" : "Guardar cambios"}</button>
              <button type="button" className="panel-alumno__boton panel-alumno__boton--secundario" disabled={ocupado} onClick={() => setEditando(false)}>Cancelar</button>
            </div>
          </form>
        ) : <>
          <dl className="panel-alumno__datos">
            <div><dt>Nombre</dt><dd>{datos.nombre}</dd></div>
            <div><dt>Apellidos</dt><dd>{datos.apellido || "Sin registrar"}</dd></div>
            <div><dt>Correo electrónico</dt><dd>{datos.correo}</dd></div>
          </dl>
          <button className="panel-alumno__boton panel-alumno__boton--secundario" onClick={() => { setMensaje(null); setEditando(true); }}><Pencil size={17} aria-hidden="true" /> Editar datos</button>
        </>}
      </section>
      <section className="panel-alumno__tarjeta" aria-labelledby="avatar-perfil">
        <h2 id="avatar-perfil">Imagen de perfil</h2>
        <div className="panel-alumno__formulario">
          <label>Avatar<select value={avatar.tipo} onChange={evento => elegirAvatar({ tipo: evento.target.value })}>
            {Object.entries(AVATARES).map(([tipo, etiqueta]) => <option key={tipo} value={tipo}>{etiqueta}</option>)}
            {avatar.tipo === "foto" && <option value="foto">Foto personalizada</option>}
          </select></label>
          <label><span className="panel-alumno__fila"><Camera size={17} aria-hidden="true" /> Usar una foto en este navegador</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={elegirFoto} /></label>
        </div>
      </section>
      <section className="panel-alumno__tarjeta" aria-labelledby="avance-perfil">
        <h2 id="avance-perfil" className="panel-alumno__fila"><BookOpen size={21} aria-hidden="true" /> Avance académico</h2>
        {progreso ? <dl className="panel-alumno__datos"><div><dt>Módulos completados</dt><dd>{completados} de {MODULOS.length}</dd></div><div><dt>Contenidos completados</dt><dd>{vistos} de {TOTAL_CONTENIDOS}</dd></div></dl>
          : <p role="status">{progreso === false ? "No pudimos consultar tu avance." : "Cargando avance…"}</p>}
      </section>
      <section className="panel-alumno__tarjeta" aria-labelledby="certificados-perfil">
        <h2 id="certificados-perfil" className="panel-alumno__fila"><GraduationCap size={21} aria-hidden="true" /> Constancias por módulo</h2>
        {certificados === false && <p role="status">No pudimos consultar tus constancias emitidas.</p>}
        {progreso && constancias.length === 0 && <p>Completa un módulo y aprueba su evaluación, si la tiene, para obtener tu constancia.</p>}
        {constancias.length > 0 && <ul className="panel-alumno__certificados">{constancias.map(modulo => (
          <li key={modulo.id}>
            <span className="panel-alumno__fila"><FileText size={17} aria-hidden="true" /> {modulo.titulo}</span>
            <DescargarConstancia moduloId={modulo.id} />
          </li>
        ))}</ul>}
      </section>
    </div>
  );
}
