import { createElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, ChartNoAxesColumn, CheckCircle2, FolderOpen, GraduationCap, LockKeyhole, Mail, MessageCircle, Users, Camera, Wallet, ShieldCheck, Briefcase, Car, Bot, Puzzle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { MODULOS, TOTAL_CONTENIDOS } from "../curso/catalogo";
import "../Css/PanelAlumno.css";

const iconos = [Mail, Users, MessageCircle, Camera, Puzzle, Wallet, ShieldCheck, FolderOpen, Briefcase, Car, Bot];

export default function Inicio() {
  const { api, user } = useAuth();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api.get("/api/alumno/progreso", { signal: controller.signal })
      .then(({ data }) => setDatos(data))
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [api, intento]);

  const porId = new Map(datos?.modulos.map(modulo => [modulo.modulo_id, modulo]));
  const modulos = MODULOS.map((modulo, index) => {
    const avance = porId.get(modulo.id);
    const cantidad = Math.min(modulo.fin, avance?.progreso_actual ?? 0);
    const anterior = MODULOS[index - 1];
    const disponible = !anterior || cantidad > 0 || datos?.modulos_vista_previa?.includes(modulo.id)
      || (porId.get(anterior.id)?.progreso_actual ?? 0) >= anterior.fin;
    return { ...modulo, cantidad, disponible, siguiente: avance?.siguiente_numero ?? 1 };
  });
  const completados = modulos.filter(m => m.cantidad === m.fin).length;
  const vistos = modulos.reduce((total, m) => total + m.cantidad, 0);
  const porcentaje = Math.round(vistos * 100 / TOTAL_CONTENIDOS);
  const recomendado = modulos.find(m => m.disponible && m.cantidad < m.fin);
  const ruta = modulo => `/modulo/${modulo.id}/contenido/${modulo.siguiente}`;

  return (
    <div className="panel-alumno">
      <header className="panel-alumno__portada">
        <div><p className="panel-alumno__marca">Mi aprendizaje</p><h1>Hola, {user?.nombre || "estudiante"}</h1><p>Explora tus módulos y retoma tus lecciones.</p></div>
        {datos && recomendado && <Link className="panel-alumno__boton panel-alumno__boton--claro" to={ruta(recomendado)}>Continuar aprendiendo <ArrowRight size={18} aria-hidden="true" /></Link>}
      </header>
      {!datos && (error
        ? <div className="panel-alumno__tarjeta" role="alert">No pudimos cargar tu avance. <button className="panel-alumno__boton" onClick={() => { setError(false); setIntento(i => i + 1); }}>Reintentar</button></div>
        : <p role="status">Cargando tu progreso…</p>)}
      {datos && <>
        <section className="panel-alumno__resumen" aria-label="Resumen de avance">
          <article className="panel-alumno__tarjeta"><ChartNoAxesColumn aria-hidden="true" /><h2>Avance general</h2><strong>{porcentaje}%</strong><progress max={100} value={porcentaje} aria-label="Avance general" /></article>
          <article className="panel-alumno__tarjeta"><GraduationCap aria-hidden="true" /><h2>Módulos completados</h2><strong>{completados} / {modulos.length}</strong></article>
          <article className="panel-alumno__tarjeta"><BookOpen aria-hidden="true" /><h2>Contenidos completados</h2><strong>{vistos} / {TOTAL_CONTENIDOS}</strong></article>
        </section>
        <section aria-labelledby="titulo-modulos">
          <div className="panel-alumno__seccion"><h2 id="titulo-modulos">Mis módulos</h2><Link to="/contenidos">Ver temario <ArrowRight size={16} aria-hidden="true" /></Link></div>
          <div className="panel-alumno__modulos">
            {modulos.map((modulo, i) => {
              const icono = iconos[i] || BookOpen;
              const completo = modulo.cantidad === modulo.fin;
              return (
                <article className="panel-alumno__tarjeta panel-alumno__modulo" key={modulo.id}>
                  <div className="panel-alumno__fila"><span className="panel-alumno__icono">{createElement(icono, { size: 22, "aria-hidden": true })}</span><span className="panel-alumno__nota">Módulo {modulo.id}</span></div>
                  <h3>{modulo.nombre}</h3><p>{modulo.descripcion}</p>
                  <div className="panel-alumno__avance"><span>{modulo.cantidad} de {modulo.fin} contenidos</span><progress max={modulo.fin} value={modulo.cantidad} aria-label={`Avance en ${modulo.nombre}`} /></div>
                  {modulo.disponible
                    ? <Link className="panel-alumno__boton" to={ruta(modulo)}>{completo ? "Repasar" : modulo.cantidad ? "Continuar" : "Empezar"} {completo ? <CheckCircle2 size={17} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}</Link>
                    : <span className="panel-alumno__bloqueo"><LockKeyhole size={16} aria-hidden="true" /> Completa el módulo anterior</span>}
                </article>
              );
            })}
          </div>
        </section>
      </>}
    </div>
  );
}
