import React from 'react';

export default function Modulo6CobrosContenido2({ onComplete }) {
  return (
    <div className="contenido-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Módulo 5: Cobros Digitales y Finanzas</h2>
      <h3>Lección 2: Métodos y Plataformas de Pago Digitales</h3>

      <p>
        Para moverte con seguridad en el entorno digital, es importante conocer las herramientas y métodos de pago más populares.
      </p>

      <div style={{ background: '#f8fafc', borderLeft: '4px solid #0284c7', padding: '15px', margin: '20px 0' }}>
        <h4>Principales Herramientas:</h4>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>SPEI (Sistema de Pagos Electrónicos Interbancarios):</strong> Transferencias bancarias inmediatas a través de tu app móvil usando la clave CLABE o número de tarjeta.</li>
          <li><strong>Mercado Pago / PayPal:</strong> Monederos digitales que actúan como intermediarios para no exponer directamente tus datos bancarios al comprar en sitios web.</li>
          <li><strong>Tarjetas Digitales con CVV Dinámico:</strong> Tarjetas virtuales generadas desde la app de tu banco con un código de seguridad que cambia cada pocos minutos para evitar fraudes.</li>
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