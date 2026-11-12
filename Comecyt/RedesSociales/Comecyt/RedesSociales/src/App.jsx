import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Acceso from "./pages/Acceso.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";

const Inicio = lazy(() => import("./pages/Inicio.jsx"));
const Presentacion = lazy(() => import("./pages/Presentacion.jsx"));
const Contenidos = lazy(() => import("./pages/Temario.jsx"));
const Perfil = lazy(() => import("./pages/PerfilAlumno.jsx"));
const Registro = lazy(() => import("./pages/Registro.jsx"));
const ModuloDinamico = lazy(() => import("./pages/ModuloDinamico.jsx"));
const InicioAdmin = lazy(() => import("./pages/InicioAdmin.jsx"));
const UsuariosAdmin = lazy(() => import("./pages/UsuariosAdmin.jsx"));
const DocenteAdmin = lazy(() => import("./pages/DocentesAdmin.jsx"));
const ModulosAdmin = lazy(() => import("./pages/ModulosAdmin.jsx"));
const PerfilAdmin = lazy(() => import("./pages/PerfilAdmin.jsx"));
const DudasWhatsApp = lazy(() => import("./pages/admin/DudasWhatsApp.jsx"));
const InicioDocente = lazy(() => import("./pages/InicioDocente.jsx"));
const PerfilDocente = lazy(() => import("./pages/PerfilDocente.jsx"));
const UsuariosDocente = lazy(() => import("./pages/UsuariosDocente.jsx"));
const CalificacionesDocente = lazy(() => import("./pages/CalificacionesDocente.jsx"));
const CertificadosDocente = lazy(() => import("./pages/CertificadosDocente.jsx"));
const DashboardLayout = lazy(() => import("./layout/DashboardLayout.jsx"));
const AdminLayout = lazy(() => import("./layout/AdminLayout.jsx"));
const DocenteLayout = lazy(() => import("./layout/DocenteLayout.jsx"));

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
          <h2>Error al cargar el contenido</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Suspense fallback={<div style={{ padding: '40px', background: 'white' }}>Cargando…</div>}>
          <Routes>
            <Route path="/registro" element={<Registro />} />
            <Route path="/login" element={<Acceso />} />
            <Route path="/" element={<Acceso />} />

            {/* ✅ RUTA NUEVA - PANEL WHATSAPP INDEPENDIENTE */}
            <Route path="/whatsapp-panel" element={<DudasWhatsApp />} />

            {/* ALUMNO */}
            <Route element={<ProtectedRoute allowedRoles={["alumno", "admin", "docente"]} />}>
              <Route element={<DashboardLayout />}>
                <Route path="inicio" element={<Inicio />} />
                <Route path="presentacion" element={<Presentacion />} />
                <Route path="contenidos" element={<Contenidos />} />
                <Route path="temario" element={<Navigate to="/contenidos" replace />} />

                <Route path="modulo/:id" element={<ModuloDinamico />} />
                <Route path="modulo/:id/contenido/:contenidoId" element={<ModuloDinamico />} />

                <Route path="modulo/1/evaluacion" element={<Navigate to="/modulo/1/contenido/8" replace />} />

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

                {Array.from({ length: 15 }, (_, index) => {
                  const ruta = `/modulo/5/contenido/${index + 1}`;
                  const numeroAnterior = index + 30;
                  return [
                    <Route key={`reto-${numeroAnterior}`} path={`modulo/${numeroAnterior}`} element={<Navigate to={ruta} replace />} />,
                    <Route key={`contenido-${numeroAnterior}`} path={`modulo/1/contenido/${numeroAnterior}`} element={<Navigate to={ruta} replace />} />
                  ];
                })}

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