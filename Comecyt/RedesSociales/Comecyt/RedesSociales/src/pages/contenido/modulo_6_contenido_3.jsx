import React from 'react';

export default function Modulo6CobrosContenido3({ onComplete }) {
  return (
    <div className="contenido-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Módulo 5: Cobros Digitales y Finanzas</h2>
      <h3>Lección 3: Envíos de Dinero, Links de Cobro y Códigos QR</h3>

      <p>
        Transferir dinero o cobrarse a un conocido ya no requiere intercambiar largas claves bancarias ni usar efectivo.
      </p>

      <div style={{ background: '#f8fafc', borderLeft: '4px solid #0284c7', padding: '15px', margin: '20px 0' }}>
        <h4>Mecanismos de Transferencia P2P (Persona a Persona):</h4>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Links de Cobro:</strong> Generas un enlace con un monto fijo desde tu billetera digital o app bancaria y lo envías por WhatsApp para recibir el pago directo.</li>
          <li><strong>Códigos QR (CoDi / Mercado Pago):</strong> Escaneas el código de otra persona desde la cámara de la app financiera para realizar o recibir transferencias en segundos.</li>
          <li><strong>División de Cuentas:</strong> Funcionalidades integradas para repartir el costo de una cena, viaje o regalo entre varios contactos de manera exacta.</li>
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