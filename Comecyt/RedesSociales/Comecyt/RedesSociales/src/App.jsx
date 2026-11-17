import React, { useState, useContext, Suspense } from "react";
import { Routes, Route, Navigate, useNavigate, Link } from "react-router-dom";
import axios from "axios";

import "./App.css";
import ElectricBorder from "./styles/ElectricBorder.jsx";
import GradientText from "./Components/common/GradientText.jsx";

import { AuthContext, AuthProvider } from "./context/AuthContext";

// Páginas generales
import Inicio from "./pages/Inicio.jsx";
import Presentacion from "./pages/Presentacion.jsx";
import Contenidos from "./pages/Temario.jsx";
import Perfil from "./pages/PerfilAlumno.jsx";
import Registro from "./pages/Registro.jsx";
import ModuloDinamico from "./pages/ModuloDinamico.jsx";

// ✅ MÓDULO 2 FACEBOOK - IMPORTS
import Modulo2Contenido1 from "./pages/contenido/modulo_2_contenido_1.jsx";
import Modulo2Contenido2 from "./pages/contenido/modulo_2_contenido_2.jsx";
import Modulo2Contenido3 from "./pages/contenido/modulo_2_contenido_3.jsx";
import Modulo2Contenido4 from "./pages/contenido/modulo_2_contenido_4.jsx";
import Modulo2Contenido5 from "./pages/contenido/modulo_2_contenido_5.jsx";
import Modulo2Contenido6Eval from "./pages/contenido/modulo_2_contenido_6_Eval.jsx";

// ✅ MÓDULO 3 WHATSAPP - IMPORTS NUEVOS
import Modulo3Contenido1 from "./pages/contenido/modulo_3_contenido_1.jsx";
import Modulo3Contenido2 from "./pages/contenido/modulo_3_contenido_2.jsx";
import Modulo3Contenido3 from "./pages/contenido/modulo_3_contenido_3.jsx";
import Modulo3Contenido4 from "./pages/contenido/modulo_3_contenido_4.jsx";
import Modulo3Contenido5 from "./pages/contenido/modulo_3_contenido_5.jsx";
import Modulo3Contenido6 from "./pages/contenido/modulo_3_contenido_6.jsx";
import Modulo3Contenido7Eval from "./pages/contenido/modulo_3_contenido_7_Eval.jsx";

// ✅ MÓDULO 4 INSTAGRAM - IMPORTS NUEVOS
import Modulo4Contenido1 from "./pages/contenido/modulo_4_contenido_1.jsx";
import Modulo4Contenido2 from "./pages/contenido/modulo_4_contenido_2.jsx";
import Modulo4Contenido3 from "./pages/contenido/modulo_4_contenido_3.jsx";
import Modulo4Contenido4 from "./pages/contenido/modulo_4_contenido_4.jsx";
import Modulo4Contenido5 from "./pages/contenido/modulo_4_contenido_4.jsx";
import Modulo4Contenido6 from "./pages/contenido/modulo_4_contenido_5.jsx";
import Modulo4Contenido7 from "./pages/contenido/modulo_4_contenido_6.jsx";
import Modulo4Contenido8Eval from "./pages/contenido/modulo_4_contenido_8_Eval.jsx";

// ✅ RETOS ACTUALIZADOS - SIN _Reto del 30 al 41
import Reto30 from "./pages/contenido/modulo_5_contenido_1.jsx";
import Reto31 from "./pages/contenido/modulo_5_contenido_2.jsx";
import Reto32 from "./pages/contenido/modulo_5_contenido_3.jsx";
import Reto33 from "./pages/contenido/modulo_5_contenido_4.jsx";
import Reto34 from "./pages/contenido/modulo_5_contenido_5.jsx";
import Reto35 from "./pages/contenido/modulo_5_contenido_6.jsx";
import Reto36 from "./pages/contenido/modulo_5_contenido_7.jsx";
import Reto37 from "./pages/contenido/modulo_5_contenido_8.jsx";
import Reto38 from "./pages/contenido/modulo_5_contenido_9.jsx";
// ✅ AGREGADOS 39 AL 41
import Reto39 from "./pages/contenido/modulo_5_contenido_10.jsx";
import Reto40 from "./pages/contenido/modulo_5_contenido_11.jsx";
import Reto41 from "./pages/contenido/modulo_5_contenido_12.jsx";
// ✅ AGREGADOS 42 AL 44 - NUEVOS
import Reto42 from "./pages/contenido/modulo_5_contenido_13.jsx";
import Reto43 from "./pages/contenido/modulo_5_contenido_14.jsx";
import Reto44 from "./pages/contenido/modulo_5_contenido_15.jsx";
// ✅ NUEVO - AGRADECIMIENTO FINAL
import Modulo5Contenido16Agradecimiento from "./pages/contenido/modulo_5_contenido_16.jsx";

// Admin
import InicioAdmin from "./pages/InicioAdmin.jsx";
import UsuariosAdmin from "./pages/UsuariosAdmin.jsx";
import DocenteAdmin from "./pages/DocentesAdmin.jsx";
import ModulosAdmin from "./pages/ModulosAdmin.jsx";
import PerfilAdmin from "./pages/PerfilAdmin.jsx";
import DudasWhatsApp from "./pages/admin/DudasWhatsApp.jsx"; // ✅ PANEL WHATSAPP

// Docente - ACTUALIZADO
import InicioDocente from "./pages/InicioDocente.jsx";
import PerfilDocente from "./pages/PerfilDocente.jsx";
import UsuariosDocente from "./pages/UsuariosDocente.jsx";
import CalificacionesDocente from "./pages/CalificacionesDocente.jsx";
import CertificadosDocente from "./pages/CertificadosDocente.jsx";

// Layouts y guards
import DashboardLayout from "./layout/DashboardLayout.jsx";
import AdminLayout from "./layout/AdminLayout.jsx";
import DocenteLayout from "./layout/DocenteLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";
import ContenidoGuard from "./guards/ContenidoGuard";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("💥 Error en componente:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: 'red', background: 'white' }}>
          <h2>💥 Error al cargar el contenido</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const CardContent = ({ children }) => (
  <div
    style={{
      padding: "40px",
      width: "400px",
      maxWidth: "90vw",
      backgroundColor: "rgba(26, 26, 0.7)",
      borderRadius: "24px",
      boxShadow: "0 0 20px rgba(0, 255, 204, 0.3)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      boxSizing: "border-box",
    }}
  >
    {children}
  </div>
);

function LoginPage() {
  const { login: contextLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [modo, setModo] = useState("login");
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    contraseña: "",
    confirmar: "",
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [verConfirm, setVerConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ nombre: "", apellido: "", correo: "", contraseña: "", confirmar: "" });
    setError("");
    setMensaje("");
    setVerPass(false);
    setVerConfirm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);

    console.log('🔥 [LOGIN] Intentando login con correo:', form.correo);

    try {
      if (modo === "login") {
        const result = await contextLogin(form.correo, form.contraseña);

        if (!result.success) {
          setError(result.error);
          setCargando(false);
          return;
        }

        const rolFinal = result.role;

        if (rolFinal === "admin") {
          navigate("/admin/inicio");
        } else if (rolFinal === "docente") {
          navigate("/docente/inicio");
        } else {
          navigate("/inicio");
        }

      } else {
        if (!form.nombre || !form.apellido || !form.correo || !form.contraseña || !form.confirmar) {
          setError("Todos los campos son obligatorios");
          setCargando(false);
          return;
        }
        if (form.contraseña.length < 6) {
          setError("La contraseña debe tener al menos 6 caracteres");
          setCargando(false);
          return;
        }
        if (form.contraseña !== form.confirmar) {
          setError("Las contraseñas no coinciden");
          setCargando(false);
          return;
        }

        let endpoint = "";
        if (rolSeleccionado === "alumno") {
          endpoint = "http://localhost:4000/api/alumno/registrar";
        } else if (rolSeleccionado === "docente") {
          endpoint = "http://localhost:4000/api/admin/docentes";
        } else if (rolSeleccionado === "admin") {
          endpoint = "http://localhost:4000/api/admin/registrar";
        }

        await axios.post(endpoint, {
          nombre: form.nombre,
          apellido: form.apellido,
          correo: form.correo,
          contraseña: form.contraseña,
        });

        setModo("login");
        setMensaje("¡Registro exitoso! Ahora puedes iniciar sesión.");
        setForm({ nombre: "", apellido: "", correo: form.correo, contraseña: "", confirmar: "" });
      }
    } catch (err) {
      console.error('💥 Error completo:', err);
      setError(err.response?.data?.message || err.response?.data?.error || "Error al procesar la solicitud");
    } finally {
      setCargando(false);
    }
  };

  const rolesInfo = {
    alumno: { emoji: "👤", label: "Alumno", placeholder: "tu@correo.com" },
    docente: { emoji: "📋", label: "Docente", placeholder: "tu@correo.com" },
    admin: { emoji: "⚙", label: "Administrador", placeholder: "usuario admin" },
  };

  if (!rolSeleccionado && modo === "login") {
    return (
      <div className="login-container" style={{ position: "relative" }}>
        <a
          href="https://wa.me/527121265349?text=Hola,%20necesito%20ayuda%20con%20ÁGORA%20-%20COMECYT"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-whatsapp-login"
          aria-label="Ayuda por WhatsApp"
        >
          <span style={{ fontSize: "24px" }}>📱</span>
          <div className="whatsapp-texto">
            <strong>Ayuda WhatsApp</strong>
            <small>+52 712 126 5349</small>
          </div>
        </a>

        <div className="login-bg-pattern" />
        <ElectricBorder
          color="#00ffcc"
          speed={1.5}
          chaos={0.15}
          borderRadius={24}
          style={{
            zIndex: 20,
            position: "relative",
            display: "inline-block",
            padding: "2px"
          }}
        >
          <CardContent>
            <header className="login-header">
              <div className="login-logo" style={{ position: 'relative', width: '100%', height: '120px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div className="logo-icon">Á</div>
                  <GradientText
                    colors={["#00ffcc", "#caf0fe", "#00ffcc"]}
                    animationSpeed={8}
                    showBorder={false}
                    className="logo-text-gradient"
                    yoyo={true}
                  >
                    ÁGORA
                  </GradientText>
                </div>
              </div>
              <h2 className="welcome-title shimmer-text">Bienvenido</h2>
              <p className="welcome-subtitle shimmer-subtitle">¿Cómo deseas ingresar?</p>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", marginTop: "20px" }}>
              {Object.entries(rolesInfo).map(([rol, info]) => (
                <button
                  key={rol}
                  className="rainbow-border relative w-full h-12 flex items-center justify-center gap-2.5 px-4 bg-[#d9d9d9] rounded-xl border-none text-[#123020] cursor-pointer font-bold transition-all duration-200"
                  onClick={() => setRolSeleccionado(rol)}
                >
                  <span style={{ fontSize: "20px" }}>{info.emoji}</span>
                  {info.label}
                </button>
              ))}
            </div>

            <Link
              to="/whatsapp-panel"
              style={{
                marginTop: '20px',
                background: '#25D366',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block'
              }}
            >
              📱 Panel WhatsApp Admin
            </Link>
          </CardContent>
        </ElectricBorder>
      </div>
    );
  }

  return (
    <div className="login-container" style={{ position: "relative" }}>
      <a
        href="https://wa.me/527121265349?text=Hola,%20necesito%20ayuda%20con%20ÁGORA%20-%20COMECYT"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-whatsapp-login"
        aria-label="Ayuda por WhatsApp"
      >
        <span style={{ fontSize: "24px" }}>📱</span>
        <div className="whatsapp-texto">
          <strong>Ayuda WhatsApp</strong>
          <small>+52 712 126 5349</small>
        </div>
      </a>

      <div className="login-bg-pattern" />
      <ElectricBorder
        key={`${modo}-${rolSeleccionado}`}
        color="#00ffcc"
        speed={1.5}
        chaos={0.15}
        borderRadius={24}
        style={{
          zIndex: 20,
          position: "relative",
          display: "inline-block",
          padding: "2px"
        }}
      >
        <CardContent>
          <header className="login-header">
            <div className="login-logo" style={{ position: 'relative', width: '100%', height: '120px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div className="logo-icon">Á</div>
                <GradientText
                  colors={["#00ffcc", "#caf0fe", "#00ffcc"]}
                  animationSpeed={8}
                  showBorder={false}
                  className="logo-text-gradient"
                  yoyo={true}
                >
                  ÁGORA
                </GradientText>
              </div>
            </div>
            <h2 className="welcome-title shimmer-text">
              {modo === "login" ? rolesInfo[rolSeleccionado]?.emoji : "📝"}{" "}
              {modo === "login" ? `Acceso ${rolesInfo[rolSeleccionado]?.label}` : `Registro ${rolesInfo[rolSeleccionado]?.label}`}
            </h2>
            <p className="welcome-subtitle shimmer-subtitle">
              {modo === "login" ? "Inicia sesión para continuar" : "Completa tus datos para registrarte"}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="login-form" style={{ width: "100%" }}>
            {modo === "register" && (
              <div className="two-col">
                <div className="form-group">
                  <label className="shimmer-text">Nombre</label>
                  <input type="text" name="nombre" placeholder="Juan" value={form.nombre} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="shimmer-text">Apellido</label>
                  <input type="text" name="apellido" placeholder="Pérez" value={form.apellido} onChange={handleChange} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="shimmer-text">{rolSeleccionado === "admin" && modo === "login" ? "Usuario" : "Correo electrónico"}</label>
              <input
                type="text"
                name="correo"
                placeholder={modo === "login" ? rolesInfo[rolSeleccionado]?.placeholder : "tu@correo.com"}
                value={form.correo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="shimmer-text">Contraseña</label>
              <div className="password-wrapper">
                <input
                  type={verPass ? "text" : "password"}
                  name="contraseña"
                  placeholder="••••••••"
                  value={form.contraseña}
                  onChange={handleChange}
                />
                <span className="toggle-password" onClick={() => setVerPass((v) => !v)}>
                  {verPass ? "🙈" : "👁"}
                </span>
              </div>
            </div>

            {modo === "register" && (
              <div className="form-group">
                <label className="shimmer-text">Confirmar contraseña</label>
                <div className="password-wrapper">
                  <input
                    type={verConfirm ? "text" : "password"}
                    name="confirmar"
                    placeholder="Repite la contraseña"
                    value={form.confirmar}
                    onChange={handleChange}
                  />
                  <span className="toggle-password" onClick={() => setVerConfirm((v) => !v)}>
                    {verConfirm ? "🙈" : "👁"}
                  </span>
                </div>
              </div>
            )}

            {error && <p className="error-message">{error}</p>}
            {mensaje && <p className="success-message">{mensaje}</p>}

            <button
              type="submit"
              className="rainbow-border relative w-full h-12 flex items-center justify-center px-4 bg-[#d9d9d9] rounded-xl border-none text-[#123020] cursor-pointer font-bold transition-all duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={cargando}
            >
              {cargando
                ? modo === "login" ? "Iniciando..." : "Registrando..."
                : modo === "login" ? "Iniciar sesión" : "Registrar"
              }
            </button>

            {modo === "register" && (
              <button
                type="button"
                className="rainbow-border relative w-full h-12 flex items-center justify-center px-4 bg-[#d9d9d9] rounded-xl border-none text-[#123020] cursor-pointer font-bold transition-all duration-200 mt-2"
                onClick={() => { setModo("login"); resetForm(); }}
                disabled={cargando}
              >
                Cancelar
              </button>
            )}
          </form>

          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: "12px" }}>
            <button
              type="button"
              className="link-button"
              onClick={() => { setRolSeleccionado(null); resetForm(); setModo("login"); }}
              disabled={cargando}
            >
              ← Cambiar rol
            </button>

            {modo === "login" && (
              <button
                type="button"
                className="link-button"
                onClick={() => { navigate(`/registro?rol=${rolSeleccionado}`); }}
                disabled={cargando}
              >
                Regístrate aquí
              </button>
            )}
          </div>
        </CardContent>
      </ElectricBorder>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Suspense fallback={<div style={{ padding: '40px', background: 'white' }}>🔄 Cargando...</div>}>
          <Routes>
            <Route path="/registro" element={<Registro />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<LoginPage />} />

            {/* ✅ RUTA NUEVA - PANEL WHATSAPP INDEPENDIENTE */}
            <Route path="/whatsapp-panel" element={<DudasWhatsApp />} />

            {/* ALUMNO */}
            <Route element={<ProtectedRoute allowedRoles={["alumno", "admin", "docente"]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="inicio" element={<Inicio />} />
                <Route path="presentacion" element={<Presentacion />} />
                <Route path="contenidos" element={<Contenidos />} />

                <Route path="modulo/:id" element={<ModuloDinamico />} />
                <Route path="modulo/:id/contenido/:contenidoId" element={<ModuloDinamico />} />

                <Route path="modulo/1/evaluacion" element={<Inicio />} />

                {/* ✅ MÓDULO 2 FACEBOOK - RUTAS */}
                <Route path="modulo/2/contenido/1" element={<Modulo2Contenido1 />} />
                <Route path="modulo/2/contenido/2" element={<Modulo2Contenido2 />} />
                <Route path="modulo/2/contenido/3" element={<Modulo2Contenido3 />} />
                <Route path="modulo/2/contenido/4" element={<Modulo2Contenido4 />} />
                <Route path="modulo/2/contenido/5" element={<Modulo2Contenido5 />} />
                <Route path="modulo/2/contenido/6" element={<Modulo2Contenido6Eval />} />

                {/* ✅ MÓDULO 3 WHATSAPP - RUTAS NUEVAS */}
                <Route path="modulo/3/contenido/1" element={<Modulo3Contenido1 />} />
                <Route path="modulo/3/contenido/2" element={<Modulo3Contenido2 />} />
                <Route path="modulo/3/contenido/3" element={<Modulo3Contenido3 />} />
                <Route path="modulo/3/contenido/4" element={<Modulo3Contenido4 />} />
                <Route path="modulo/3/contenido/5" element={<Modulo3Contenido5 />} />
                <Route path="modulo/3/contenido/6" element={<Modulo3Contenido6 />} />
                <Route path="modulo/3/contenido/7" element={<Modulo3Contenido7Eval />} />

                {/* ✅ MÓDULO 4 INSTAGRAM - RUTAS NUEVAS */}
                <Route path="modulo/4/contenido/1" element={<Modulo4Contenido1 />} />
                <Route path="modulo/4/contenido/2" element={<Modulo4Contenido2 />} />
                <Route path="modulo/4/contenido/3" element={<Modulo4Contenido3 />} />
                <Route path="modulo/4/contenido/4" element={<Modulo4Contenido4 />} />
                <Route path="modulo/4/contenido/5" element={<Modulo4Contenido5 />} />
                <Route path="modulo/4/contenido/6" element={<Modulo4Contenido6 />} />
                <Route path="modulo/4/contenido/7" element={<Modulo4Contenido7 />} />
                <Route path="modulo/4/contenido/8" element={<Modulo4Contenido8Eval />} />

                {/* ✅ REDIRECTS FACEBOOK VIEJO → NUEVO */}
                <Route path="modulo/1/contenido/9" element={<Navigate to="/modulo/2/contenido/1" replace />} />
                <Route path="modulo/1/contenido/10" element={<Navigate to="/modulo/2/contenido/2" replace />} />
                <Route path="modulo/1/contenido/11" element={<Navigate to="/modulo/2/contenido/3" replace />} />
                <Route path="modulo/1/contenido/12" element={<Navigate to="/modulo/2/contenido/4" replace />} />
                <Route path="modulo/1/contenido/13" element={<Navigate to="/modulo/2/contenido/5" replace />} />
                <Route path="modulo/1/contenido/14" element={<Navigate to="/modulo/2/contenido/6" replace />} />

                {/* ✅ REDIRECTS WHATSAPP VIEJO → NUEVO */}
                <Route path="modulo/1/contenido/15" element={<Navigate to="/modulo/3/contenido/1" replace />} />
                <Route path="modulo/1/contenido/16" element={<Navigate to="/modulo/3/contenido/2" replace />} />
                <Route path="modulo/1/contenido/17" element={<Navigate to="/modulo/3/contenido/3" replace />} />
                <Route path="modulo/1/contenido/18" element={<Navigate to="/modulo/3/contenido/4" replace />} />
                <Route path="modulo/1/contenido/19" element={<Navigate to="/modulo/3/contenido/5" replace />} />
                <Route path="modulo/1/contenido/20" element={<Navigate to="/modulo/3/contenido/6" replace />} />
                <Route path="modulo/1/contenido/21" element={<Navigate to="/modulo/3/contenido/7" replace />} />

                {/* ✅ REDIRECTS INSTAGRAM VIEJO → NUEVO */}
                <Route path="modulo/1/contenido/22" element={<Navigate to="/modulo/4/contenido/1" replace />} />
                <Route path="modulo/1/contenido/23" element={<Navigate to="/modulo/4/contenido/2" replace />} />
                <Route path="modulo/1/contenido/24" element={<Navigate to="/modulo/4/contenido/3" replace />} />
                <Route path="modulo/1/contenido/25" element={<Navigate to="/modulo/4/contenido/4" replace />} />
                <Route path="modulo/1/contenido/26" element={<Navigate to="/modulo/4/contenido/5" replace />} />
                <Route path="modulo/1/contenido/27" element={<Navigate to="/modulo/4/contenido/6" replace />} />
                <Route path="modulo/1/contenido/28" element={<Navigate to="/modulo/4/contenido/7" replace />} />
                <Route path="modulo/1/contenido/29" element={<Navigate to="/modulo/4/contenido/8" replace />} />

                <Route path="modulo/5" element={<Navigate to="/modulo/1/contenido/30" replace />} />

                {/* ✅ RETOS MÓDULO 1 COMPLETOS - 30 al 44 - ACTUALIZADO */}
                <Route path="modulo/30" element={<Reto30 />} />
                <Route path="modulo/31" element={<Reto31 />} />
                <Route path="modulo/32" element={<Reto32 />} />
                <Route path="modulo/33" element={<Reto33 />} />
                <Route path="modulo/34" element={<Reto34 />} />
                <Route path="modulo/35" element={<Reto35 />} />
                <Route path="modulo/36" element={<Reto36 />} />
                <Route path="modulo/37" element={<Reto37 />} />
                <Route path="modulo/38" element={<Reto38 />} />
                <Route path="modulo/39" element={<Reto39 />} />
                <Route path="modulo/40" element={<Reto40 />} />
                <Route path="modulo/41" element={<Reto41 />} />
                {/* ✅ AGREGADOS 42 AL 44 - NUEVOS */}
                <Route path="modulo/42" element={<Reto42 />} />
                <Route path="modulo/43" element={<Reto43 />} />
                <Route path="modulo/44" element={<Reto44 />} />
                {/* ✅ NUEVO - AGRADECIMIENTO FINAL */}
                <Route path="modulo/5/contenido/16" element={<Modulo5Contenido16Agradecimiento />} />

                <Route path="perfil" element={<Perfil />} />
              </Route>
            </Route>

            {/* ADMIN */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="adminPerfil" element={<PerfilAdmin />} />
                <Route path="inicio" element={<InicioAdmin />} />
                <Route path="usuarios" element={<UsuariosAdmin />} />
                <Route path="docentes" element={<DocenteAdmin />} />
                <Route path="modulos" element={<ModulosAdmin />} />
                {/* ✅ QUITAMOS /admin/dudas DE AQUÍ PARA QUE NO SALGA EN EL SIDEBAR */}
              </Route>
            </Route>

            {/* DOCENTE */}
            <Route element={<ProtectedRoute allowedRoles={["docente"]} />}>
              <Route path="/docente" element={<DocenteLayout />}>
                <Route index element={<Navigate to="/docente/inicio" replace />} />
                <Route path="inicio" element={<InicioDocente />} />
                <Route path="alumnos" element={<UsuariosDocente />} />
                <Route path="calificaciones" element={<CalificacionesDocente />} />
                <Route path="certificados" element={<CertificadosDocente />} />
                <Route path="perfil" element={<PerfilDocente />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;