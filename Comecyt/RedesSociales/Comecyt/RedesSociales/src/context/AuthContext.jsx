import { limpiarSesion } from "./limpiarSesion";
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

useEffect(() => {
        console.log('🚀 [AuthContext] Iniciando carga...');

        const savedToken = localStorage.getItem("token");
        const savedCorreo = localStorage.getItem("correo");
        const savedRole = localStorage.getItem("role") || localStorage.getItem("rol");
        const savedUser = localStorage.getItem("user");

        console.log('📦 [AuthContext] Datos localStorage:', {
            token: !!savedToken,
            correo: savedCorreo,
            role: savedRole,
            user: !!savedUser
        });

        if (!savedToken || !savedCorreo || !savedRole) {
            console.log('🗑 [AuthContext] Faltan datos, limpiando sesión');
            limpiarSesion();
            delete axios.defaults.headers.common['Authorization'];
            setToken(null);
            setRole(null);
            setUser(null);
            setLoading(false);
            return;
        }

        console.log('✅ [AuthContext] Restaurando sesión con role:', savedRole);
        setToken(savedToken);
        setRole(savedRole);
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('❌ Error parseando user:', e);
            }
        }

        setLoading(false);
    }, []);

    const login = async (correo, contraseña) => {
        try {

            const response = await axios.post(`${API_URL}/api/auth/login`, {
                correo,
                contraseña
            });

            const { token, user, role } = response.data;


            localStorage.setItem("token", token);
            localStorage.setItem("role", role || user.rol);
            localStorage.setItem("rol", role || user.rol);
            localStorage.setItem("correo", user.correo);
            localStorage.setItem("user", JSON.stringify(user));

            setToken(token);
            setRole(role || user.rol);
            setUser(user);

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;


            return {
                success: true,
                role: role || user.rol,
                user: user
            };

        } catch (error) {
            console.error('❌ [LOGIN] Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error || 'Error al iniciar sesión'
            };
        }
    };

    const actualizarUsuario = cambios => {
        if (!user) return;
        const actualizado = { ...user, ...cambios };
        localStorage.setItem("user", JSON.stringify(actualizado));
        setUser(actualizado);
    };

    const logout = () => {
        console.log('👋 [LOGOUT] Cerrando sesión');
        limpiarSesion();
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setRole(null);
        setUser(null);
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/registrar`, userData);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('❌ [REGISTER] Error:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al registrar'
            };
        }
    };

    const value = {
        user,
        role,
        token,
        loading,
        login,
        logout,
        actualizarUsuario,
        register,
        isAuthenticated: !!token,
        API_URL,
        api // ✅ NUEVO: Exporta la instancia de axios configurada
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};