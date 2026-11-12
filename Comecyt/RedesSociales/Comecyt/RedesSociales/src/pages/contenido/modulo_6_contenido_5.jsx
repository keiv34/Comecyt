import React from 'react';

export default function Modulo6CobrosContenido5({ onComplete }) {
  return (
    <div className="contenido-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Módulo 5: Cobros Digitales y Finanzas</h2>
      <h3>Lección 5: Gestión y Control de Finanzas Personales</h3>

      <p>
        El uso de dinero digital simplifica tus pagos, pero requiere disciplina para mantener una buena salud financiera.
      </p>

      <div style={{ background: '#f8fafc', borderLeft: '4px solid #0284c7', padding: '15px', margin: '20px 0' }}>
        <h4>Buenas Prácticas Financieras Digitales:</h4>
        <ul style={{ lineHeight: '1.6' }}>
          <li><strong>Revisión periódica de estados de cuenta:</strong> Monitorea semanalmente las notificaciones de tu app para detectar cargos no reconocidos a tiempo.</li>
          <li><strong>Control de suscripciones:</strong> Revisa y cancela los servicios digitales (streaming, apps) que ya no utilices para evitar gastos hormiga.</li>
          <li><strong>Activa alertas bancarias:</strong> Configura avisos SMS o notificaciones push inmediatas para cada movimiento o compra efectuada.</li>
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