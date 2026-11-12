import React, { useState } from 'react';

export default function Modulo6CobrosContenido6Eval({ onComplete }) {
  const [respuestas, setRespuestas] = useState({});
  const [evaluado, setEvaluado] = useState(false);
  const [aprobado, setAprobado] = useState(false);

  const preguntas = [
    {
      id: 1,
      pregunta: "¿Cuál es una ventaja principal de usar una Tarjeta Digital con CVV dinámico?",
      opciones: [
        "Permite retirar dinero sin comisión en cualquier cajero.",
        "Cambia el código de seguridad periódicamente para evitar fraudes en compras en línea.",
        "Aumenta el crédito de la tarjeta automáticamente."
      ],
      correcta: 1
    },
    {
      id: 2,
      pregunta: "Si recibes una transferencia bancaria de un desconocido, ¿cómo confirmas que realmente se acreditó el dinero?",
      opciones: [
        "Con una captura de pantalla enviada por WhatsApp.",
        "Revisando directamente el saldo reflejado en tu app bancaria.",
        "Esperando una llamada del comprador."
      ],
      correcta: 1
    },
    {
      id: 3,
      pregunta: "¿Qué debes hacer si recibes un correo solicitándote tu NIP o contraseña bancaria?",
      opciones: [
        "Responder con los datos solicitados inmediatamente.",
        "Ignorarlo y reportarlo, ya que los bancos jamás solicitan datos sensibles por correo.",
        "Dar clic en el enlace para verificar la cuenta."
      ],
      correcta: 1
    }
  ];

  const seleccionarOpcion = (preguntaId, indiceOpcion) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: indiceOpcion }));
  };

  const evaluar = () => {
    let aciertos = 0;
    preguntas.forEach(p => {
      if (respuestas[p.id] === p.correcta) aciertos++;
    });

    setEvaluado(true);
    if (aciertos === preguntas.length) {
      setAprobado(true);
      onComplete();
    } else {
      setAprobado(false);
    }
  };

  return (
    <div className="contenido-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Módulo 5: Cobros Digitales y Finanzas</h2>
      <h3>Lección 6: Evaluación del Módulo</h3>
      <p>Responde las siguientes preguntas para comprobar lo aprendido:</p>

      {preguntas.map((p) => (
        <div key={p.id} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ fontWeight: 'bold' }}>{p.id}. {p.pregunta}</p>
          {p.opciones.map((opcion, index) => (
            <label key={index} style={{ display: 'block', margin: '8px 0', cursor: 'pointer' }}>
              <input
                type="radio"
                name={`pregunta_${p.id}`}
                checked={respuestas[p.id] === index}
                onChange={() => seleccionarOpcion(p.id, index)}
                style={{ marginRight: '8px' }}
              />
              {opcion}
            </label>
          ))}
        </div>
      ))}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={evaluar}
          disabled={Object.keys(respuestas).length < preguntas.length}
          style={{
            padding: '12px 24px',
            backgroundColor: Object.keys(respuestas).length < preguntas.length ? '#94a3b8' : '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: Object.keys(respuestas).length < preguntas.length ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          Evaluarse
        </button>
      </div>

      {evaluado && (
        <div style={{ marginTop: '20px', padding: '15px', textAlign: 'center', borderRadius: '6px', backgroundColor: aprobado ? '#dcfce7' : '#fee2e2', color: aprobado ? '#15803d' : '#b91c1c' }}>
          {aprobado
            ? "¡Felicidades! Has aprobado la evaluación y completado el Módulo de Cobros Digitales y Finanzas."
            : "Revisa tus respuestas e inténtalo de nuevo."}
        </div>
      )}
    </div>
  );
}