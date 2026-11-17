import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GenerarCertificado() {
  const navigate = useNavigate();
  const [mostrarAgradecimiento, setMostrarAgradecimiento] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');

  useEffect(() => {
    const generar = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user")); // Tu user debe tener nombre, apellido, alumno_id

        if (!user) {
          alert("No hay sesión activa");
          navigate("/login");
          return;
        }

        setNombreUsuario(user.nombre);

        const response = await axios.post(
          "http://localhost:4000/api/certificados/generar",
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

        // ✅ Tu backend regresa 'archivo', no 'url'
        if (response.data?.success && response.data?.archivo) {
          window.open("http://localhost:4000" + response.data.archivo, "_blank");
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
    <div style={{ padding: "40px", textAlign: "center" }}>
      {!mostrarAgradecimiento ? (
        <>
          <h2>Generando certificado…</h2>
          <p>Por favor espera</p>
        </>
      ) : (
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2>¡Felicidades {nombreUsuario}! 🎓</h2>
          <p>Has completado exitosamente el curso "Redes Sociales para Emprendedores"</p>
          <p>Gracias por ser parte de COMECYT. ¡Mucho éxito en tus proyectos!</p>
          <button
            onClick={() => navigate("/perfil")}
            style={{
              marginTop: '20px',
              padding: '12px 30px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Ir a mi perfil
          </button>
        </div>
      )}
    </div>
  );
}