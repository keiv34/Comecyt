import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function GenerarCertificado() {
  const navigate = useNavigate();
  const [mostrarAgradecimiento, setMostrarAgradecimiento] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');

  useEffect(() => {
    const generar = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
          alert("No hay sesión activa");
          navigate("/login");
          return;
        }

        setNombreUsuario(user.nombre);

        const response = await axios.post(
          `${API_URL}/api/certificados/generar`,
          {
            alumno_id: user.alumno_id,
            modulo_id: 5, // ✅ Es el 5, no el 1
            nombre: user.nombre,
            apellido: user.apellido,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        // ✅ Se agregó la llave { faltante para envolver correctamente el bloque if
        if (response.data?.success && response.data?.archivo) {
          window.open(`${API_URL}${response.data.archivo}`, "_blank");
          setMostrarAgradecimiento(true); // Muestra el modal
        } else {
          alert("Error al generar certificado");
          navigate("/perfil");
        }

      } catch (error) {
        console.error(error);
        alert("Error al generar certificado");
        navigate("/perfil");
      }
    };

    generar();
  }, [navigate]);

  return (
    <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#f3f4f6", minHeight: "100vh" }}>
      {!mostrarAgradecimiento ? (
        <div style={{ marginTop: "100px" }}>
          <h2 style={{ fontFamily: "sans-serif", color: "#333" }}>Generando certificado…</h2>
          <p style={{ fontFamily: "sans-serif", color: "#666" }}>Por favor espera</p>
        </div>
      ) : (
        /* Contenedor principal con estilo de constancia/certificado inspirado en la imagen */
        <div style={{
          maxWidth: '850px',
          margin: '20px auto',
          padding: '60px 50px',
          backgroundColor: '#ffffff',
          border: '12px double #dcaebb', /* Color palo de rosa/vino suave simulando los bordes decorativos */
          borderRadius: '4px',
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
          fontFamily: '"Georgia", "Times New Roman", serif', /* Fuente formal */
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '450px'
        }}>
          
          <h2 style={{
            fontSize: '42px',
            color: '#4a1525', /* Guinda oscuro similar al texto CONSTANCIA */
            textTransform: 'uppercase',
            letterSpacing: '3px',
            margin: '0 0 30px 0',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            ¡Felicidades {nombreUsuario}! 🎓
          </h2>
          
          <p style={{
            fontSize: '24px',
            color: '#222',
            lineHeight: '1.6',
            margin: '0 0 15px 0',
            textAlign: 'center',
            padding: '0 20px'
          }}>
            Has completado exitosamente el curso<br />
            <strong style={{ fontSize: '28px', display: 'block', marginTop: '10px' }}>"Redes Sociales para Emprendedores"</strong>
          </p>
          
          <p style={{
            fontSize: '18px',
            color: '#555',
            fontStyle: 'italic',
            margin: '20px 0 50px 0',
            textAlign: 'center'
          }}>
            Gracias por ser parte de COMECYT. ¡Mucho éxito en tus proyectos!
          </p>
          
          <button
            onClick={() => navigate("/perfil")}
            style={{
              marginTop: 'auto',
              padding: '14px 40px',
              backgroundColor: '#4a1525', /* Botón a juego con el título principal */
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontFamily: 'sans-serif', /* Fuente moderna para el botón */
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
              transition: 'background-color 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#300d18'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4a1525'}
          >
            Ir a mi perfil
          </button>
        </div>
      )}
    </div>
  );
}
