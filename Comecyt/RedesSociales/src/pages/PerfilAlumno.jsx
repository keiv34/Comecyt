// src/pages/PerfilAlumno.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileCard from "../Components/common/ProfileCard";
import { Camera, LogOut, FileText, Download, Eye, ShieldCheck, User } from "lucide-react";
import "../Css/PerfilAlumno.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function PerfilAlumno() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const nombreRef = useRef(null);
  const apellidoRef = useRef(null);

  const [alumno, setAlumno] = useState(null);
  const [certificados, setCertificados] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [versionFoto, setVersionFoto] = useState(Date.now());
  const [vistaInterna, setVistaInterna] = useState("info");
  const [generandoCert, setGenerandoCert] = useState(false);

  // ✅ CONFIGURACIÓN: Cada módulo con su moduloId real de la BD
  const MODULOS = [
    { id: 1, moduloId: 1, nombre: "Correo Electrónico", icono: "📧", inicio: 1, fin: 8 },
    { id: 2, moduloId: 2, nombre: "Facebook & Marketplace", icono: "📘", inicio: 1, fin: 6 },
    { id: 3, moduloId: 3, nombre: "WhatsApp Business", icono: "💬", inicio: 1, fin: 7 },
    { id: 4, moduloId: 4, nombre: "Instagram", icono: "📸", inicio: 1, fin: 8 },
    { id: 5, moduloId: 5, nombre: "Retos Finales", icono: "🏆", inicio: 1, fin: 3 }
  ];

  const TOTAL_CONTENIDOS = MODULOS.reduce((acc, m) => acc + (m.fin - m.inicio + 1), 0); // 8+6+7+8+3 = 32

  const [stats, setStats] = useState({
    modulos_completados: 0,
    total_modulos: 5,
    contenidos_completados: 0,
    total_contenidos: 32,
    examenes_aprobados: 0,
    total_examenes: 5,
    porcentaje_general: 0
  });

  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2500);
  };

  // ✅ Obtiene el progreso del módulo correcto
  const getProgresoModulo = (modulosData, moduloId) => {
    if (!modulosData) return 0;
    const mod = modulosData.find(m => m.modulo_id === moduloId);
    return mod?.progreso_actual || 0;
  };

  // ✅ Cuenta módulos completados correctamente
  const getModulosCompletados = (modulosData) => {
    return MODULOS.filter(m => {
      const progreso = getProgresoModulo(modulosData, m.moduloId);
      return progreso >= m.fin;
    }).length;
  };

  // ✅ Cuenta exámenes aprobados = módulos completados
  const getExamenesAprobados = (modulosData) => {
    return getModulosCompletados(modulosData);
  };

  // ✅ Suma todos los contenidos completados de todos los módulos
  const getTotalContenidosCompletados = (modulosData) => {
    return MODULOS.reduce((acc, m) => {
      const progreso = getProgresoModulo(modulosData, m.moduloId);
      // Si no ha empezado, 0. Si ya pasó el fin, cuenta todo el módulo
      if (progreso < m.inicio) return acc;
      if (progreso >= m.fin) return acc + (m.fin - m.inicio + 1);
      // Si está en medio, cuenta los completados
      return acc + (progreso - m.inicio + 1);
    }, 0);
  };

  // ✅ USA TU BACKEND PARA GENERAR EL CERTIFICADO
  const generarCertificadoPDF = async () => {
    if (!alumno) return;

    setGenerandoCert(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/certificados/generar`,
        {
          alumno_id: alumno.alumno_id,
          nombre: alumno.nombre,
          apellido: alumno.apellido,
          correo: alumno.correo
        },
        { responseType: 'blob' }
      );

      // Descarga el PDF que te regresa el backend
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificado_AGORA_${alumno.nombre}_${alumno.apellido}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast("Certificado descargado ✨", "success");
      fetchData(); // Recarga para mostrar el nuevo certificado en la lista
    } catch (err) {
      console.error("Error al generar certificado:", err);
      showToast("Error al generar certificado", "error");
    } finally {
      setGenerandoCert(false);
    }
  };

  const fetchData = useCallback(async () => {
    const correo = localStorage.getItem("correo");
    if (!correo) return navigate("/login");
    try {
      const resAlumno = await axios.post(`${API_URL}/api/alumno/datos`, { correo });
      setAlumno(resAlumno.data.alumno);

      const resCertificados = await axios.post(`${API_URL}/api/alumno/certificados`, { correo });
      setCertificados(resCertificados.data.certificados || []);

      const resProgreso = await axios.post(`${API_URL}/api/alumno/progreso`, { correo });
      const modulosData = resProgreso.data.modulos || [];

      // ✅ Calcula stats con todos los módulos
      const contenidosCompletados = getTotalContenidosCompletados(modulosData);
      const modulosCompletados = getModulosCompletados(modulosData);

      setStats({
        modulos_completados: modulosCompletados,
        total_modulos: 5,
        contenidos_completados: contenidosCompletados,
        total_contenidos: TOTAL_CONTENIDOS,
        examenes_aprobados: getExamenesAprobados(modulosData),
        total_examenes: 5,
        porcentaje_general: Math.round((contenidosCompletados / TOTAL_CONTENIDOS) * 100)
      });
    } catch (err) {
      console.error("Error al sincronizar:", err);
    }
  }, [navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGuardarDatos = async () => {
    const nuevoNombre = nombreRef.current.value.trim();
    const nuevoApellido = apellidoRef.current.value.trim();

    if (!nuevoNombre || !nuevoApellido) {
      showToast("Nombre y apellido obligatorios", "error");
      return;
    }

    setAlumno(prev => ({
      ...prev,
      nombre: nuevoNombre,
      apellido: nuevoApellido
    }));

    try {
      await axios.post(`${API_URL}/api/alumno/actualizar`, {
        alumno_id: alumno.alumno_id,
        nombre: nuevoNombre,
        apellido: nuevoApellido
      });

      showToast("Datos actualizados correctamente ✨", "success");
      setVistaInterna("info");
    } catch (err) {
      console.error("Error:", err);
      showToast("Error de conexión", "error");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('alumno_id', alumno.alumno_id);

    try {
      setUploading(true);
      const res = await axios.post(`${API_URL}/api/alumno/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAlumno(prev => ({ ...prev, avatar: res.data.avatar }));
      setVersionFoto(Date.now());
      showToast("Foto actualizada ✨", "success");
    } catch (err) {
      showToast("Error al subir imagen", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!alumno) return <div className="perfil-loading"><div className="spinner"></div></div>;

  const avatarUrl = alumno.avatar
    ? (alumno.avatar.startsWith('http') ? alumno.avatar : `${API_URL}${alumno.avatar}?v=${versionFoto}`)
    : "https://i.pravatar.cc/300";

  const cursoCompleto = stats.contenidos_completados >= TOTAL_CONTENIDOS;

  return (
    <div className="perfil-root">
      {toast.visible && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}

      <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />

      <div className="perfil-card-3d-wrapper">
        <div className="relative">
          {uploading && <div className="upload-overlay"><div className="spinner"></div></div>}
          <ProfileCard
            name={`${alumno.nombre} ${alumno.apellido}`}
            title="Estudiante ÁGORA"
            handle={alumno.correo.split("@")[0]}
            status="Online"
            avatarUrl={avatarUrl}
            onAvatarClick={() => fileInputRef.current?.click()}
            behindGlowEnabled
            innerGradient="linear-gradient(145deg,#1a1a1a 0%,#00ffcc44 100%)"
          />
          <button onClick={() => fileInputRef.current?.click()} className="btn-cambiar-foto">
            <Camera size={18} /> Cambiar foto
          </button>
        </div>
      </div>

      <div className="perfil-stats-grid">
        <div className="stat-card">
          <h3>Módulos</h3>
          <p>{stats.modulos_completados} / {stats.total_modulos}</p>
        </div>
        <div className="stat-card">
          <h3>Contenidos</h3>
          <p>{stats.contenidos_completados} / {stats.total_contenidos}</p>
        </div>
        <div className="stat-card stat-card-main">
          <h3>Progreso</h3>
          <p>{stats.porcentaje_general}%</p>
        </div>
      </div>

      <div className="perfil-card">
        <div className="perfil-card-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={24} /> {vistaInterna === "info" ? "Perfil" : vistaInterna === "editar" ? "Editar Datos" : "Seguridad"}
          </h2>
          <button className="btn-logout" onClick={handleLogout}><LogOut size={16} /> Salir</button>
        </div>

        <div className="perfil-info">
          {vistaInterna === "info" && (
            <>
              <p><strong>Nombre:</strong> {alumno.nombre} {alumno.apellido}</p>
              <p><strong>Correo:</strong> {alumno.correo}</p>
              <div className="perfil-actions">
                <button className="btn-actualizar" onClick={() => setVistaInterna("editar")}>✏️ Editar Datos</button>
                <button className="btn-password" onClick={() => setVistaInterna("seguridad")}>🔐 Seguridad</button>
              </div>
            </>
          )}

          {vistaInterna === "editar" && (
            <div className="form-container-pro">
              <div className="input-group">
                <label>Nombre(s):</label>
                <input className="input-pro" type="text" ref={nombreRef} defaultValue={alumno.nombre} />
              </div>
              <div className="input-group">
                <label>Apellidos:</label>
                <input className="input-pro" type="text" ref={apellidoRef} defaultValue={alumno.apellido} />
              </div>
              <div className="perfil-actions">
                <button className="btn-actualizar" onClick={handleGuardarDatos}>Guardar</button>
                <button className="btn-logout" style={{ background: '#666' }} onClick={() => setVistaInterna("info")}>Cancelar</button>
              </div>
            </div>
          )}

          {vistaInterna === "seguridad" && (
            <div className="form-container-pro">
              <input className="input-pro" type="password" placeholder="Nueva contraseña" />
              <input className="input-pro" type="password" placeholder="Confirmar contraseña" />
              <div className="perfil-actions">
                <button className="btn-password" onClick={() => { showToast("Seguridad actualizada"); setVistaInterna("info"); }}>Actualizar</button>
                <button className="btn-logout" style={{ background: '#666' }} onClick={() => setVistaInterna("info")}>Volver</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="perfil-certificados">
        <h3>🎓 Certificados</h3>
        {cursoCompleto ? (
          <div className="certificado-disponible">
            <div className="certificado-icon">🎓</div>
            <div className="certificado-info">
              <h3>¡Felicidades! Completaste todos los módulos</h3>
              <p>Ya puedes descargar tu certificado de finalización</p>
            </div>
            <button
              className="btn-pdf"
              onClick={generarCertificadoPDF}
              disabled={generandoCert}
            >
              <Download size={18} /> {generandoCert ? 'Generando...' : 'PDF'}
            </button>
          </div>
        ) : (
          <div className="certificado-bloqueado">
            <div className="certificado-icon">🔒</div>
            <div className="certificado-info">
              <h3>Completa tus estudios para obtener tu certificado</h3>
              <p>Te faltan {TOTAL_CONTENIDOS - stats.contenidos_completados} contenidos por completar</p>
              <div className="barra-progreso-cert">
                <div
                  className="barra-fill-cert"
                  style={{ width: `${stats.porcentaje_general}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {certificados.length > 0 && (
          <div className="cert-list" style={{ marginTop: '20px' }}>
            {certificados.map((c) => (
              <div key={c.certificado_id} className="cert-item">
                <div className="cert-info">
                  <FileText size={20} />
                  <span>{c.titulo_modulo}</span>
                </div>
                <div className="cert-buttons">
                  <button className="btn-ver" onClick={() => setSelectedCert(c)}><Eye size={16} /> Ver</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
