// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx' // ✅ CORREGIDO: era ../context
import axios from 'axios'
import './index.css'

// ✅ Configurar axios globalmente
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
axios.defaults.baseURL = API_URL

// ✅ PARCHE GLOBAL: Mete el token a axios al cargar la app
const token = localStorage.getItem('token')
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// ✅ Actualiza el token si cambia en otra pestaña
window.addEventListener('storage', () => {
  const newToken = localStorage.getItem('token')
  if (newToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
})

// ✅ INTERCEPTOR REQUEST: Solo token, sin tocar modulo_id
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ✅ INTERCEPTOR RESPONSE: Solo limpia sesión, NO redirijas
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('🚨 Token inválido, limpiando sesión')
      localStorage.clear()
      delete axios.defaults.headers.common['Authorization']
    }
    return Promise.reject(error)
  }
)

// Log de variables de entorno en desarrollo
if (import.meta.env.DEV) {
  console.log('🚀 Modo desarrollo')
  console.log('🌐 API_URL:', API_URL)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)