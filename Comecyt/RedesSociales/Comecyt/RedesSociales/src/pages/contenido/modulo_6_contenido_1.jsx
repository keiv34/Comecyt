import React from 'react';

export default function Modulo6CobrosContenido1({ onComplete }) {
  return (
    <div className="contenido-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Módulo 5: Cobros Digitales y Finanzas</h2>
      <h3>Lección 1: Introducción a las Transacciones y Cobros Digitales</h3>

      <p>
        En la era digital actual, realizar transacciones electrónicas, pagar servicios en línea o transferir dinero a familiares y amigos se ha convertido en una parte fundamental de nuestro día a día.
      </p>

      <div style={{ background: '#f8fafc', borderLeft: '4px solid #0284c7', padding: '15px', margin: '20px 0' }}>
        <h4>¿Qué son las Transacciones Digitales?</h4>
        <p>
          Son intercambios de valor económico realizados a través de medios electrónicos (aplicaciones bancarias, plataformas de pago o enlaces de cobro) sin necesidad de utilizar dinero en efectivo.
        </p>
      </div>

      <div style={{ margin: '20px 0' }}>
        <h4>Uso cotidiano en la vida personal:</h4>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Envíos de dinero entre personas (P2P):</strong> Transferencias rápidas a familiares o amigos mediante SPEI, Mercado Pago o aplicaciones bancarias.</li>
          <li><strong>Compras en plataformas digitales:</strong> Pagos seguros en sitios de comercio electrónico, compras de boletos o servicios por suscripción.</li>
          <li><strong>Cobros o divisiones de gastos:</strong> Creación de enlaces de cobro para dividir cuentas de restaurantes, viajes o gastos compartidos.</li>
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