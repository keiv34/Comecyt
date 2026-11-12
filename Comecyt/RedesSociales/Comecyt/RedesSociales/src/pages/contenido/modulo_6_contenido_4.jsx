import React from 'react';

export default function Modulo6CobrosContenido4({ onComplete }) {
  return (
    <div className="contenido-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Módulo 5: Cobros Digitales y Finanzas</h2>
      <h3>Lección 4: Compras Seguras en Línea y Prevención de Fraudes</h3>

      <p>
        Proteger tus datos financieros es indispensable al comprar por internet o realizar transferencias digitales.
      </p>

      <div style={{ background: '#fff1f2', borderLeft: '4px solid #e11d48', padding: '15px', margin: '20px 0' }}>
        <h4>Recomendaciones Esenciales de Seguridad:</h4>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Usa siempre Tarjeta Digital:</strong> Evita ingresar los datos de tu tarjeta física en tiendas en línea.</li>
          <li><strong>Verifica el candado de seguridad (HTTPS):</strong> Comprueba que la dirección de la página empiece con <code>https://</code> y tenga el icono de candado.</li>
          <li><strong>Cuidado con el Phishing:</strong> Nunca abras enlaces en correos o mensajes sospechosos que te soliciten contraseñas o NIPs bancarios. Tu banco nunca te pedirá esos datos.</li>
          <li><strong>Desconfía de comprobantes falsos:</strong> Si te transfieren dinero, verifica siempre el saldo reflejado en tu app bancaria antes de entregar un producto o dar por hecho el pago.</li>
        </ul>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={onComplete}
          style={{
            padding: '12px 24px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Marcar Lección como Completada
        </button>
      </div>
    </div>
  );
}