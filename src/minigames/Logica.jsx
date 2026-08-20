import { useState } from 'react';

export default function Logica({ decision, onElegir }) {
  const [valor, setValor] = useState('');
  const [resuelto, setResuelto] = useState(false);
  const [opcionEncontrada, setOpcionEncontrada] = useState(null);
  const plantilla = decision.metaMinijuego?.plantillaCodigo ?? '';

  function ejecutar(e) {
    e.preventDefault();
    if (resuelto || !valor.trim()) return;
    const opcion = decision.opciones.find(
      (o) => o.texto.trim().toLowerCase() === valor.trim().toLowerCase(),
    );
    setOpcionEncontrada(opcion ?? null);
    setResuelto(true);
    onElegir(opcion ? [opcion.id] : []);
  }

  return (
    <div>
      <div className="label-pixel">🧩 BLOQUES DE LÓGICA</div>
      <div style={{ fontSize: 15, fontWeight: 800, margin: '10px 0' }}>{decision.pregunta}</div>
      <div style={{ background: '#0b1220', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', fontFamily: 'monospace', fontSize: 14, color: '#9fd6ff', marginBottom: 12 }}>
        {plantilla.replace('___', resuelto ? valor : '___')}
      </div>
      <form onSubmit={ejecutar} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          type="text"
          value={valor}
          disabled={resuelto}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Escribe aquí"
          style={{ background: 'var(--panel-alt)', border: '2px solid var(--cyan)', borderRadius: 6, padding: '8px 14px', fontFamily: 'monospace', color: 'var(--text)' }}
        />
        <button type="submit" className="btn-primary" style={{ fontSize: 13, padding: '8px 18px' }} disabled={resuelto || !valor.trim()}>▶ RUN</button>
      </form>
      {resuelto && (
        <div style={{ background: '#08281f', border: '1px solid var(--green)', borderRadius: 6, padding: '8px 14px', fontFamily: 'monospace', fontSize: 13, color: 'var(--green)', marginTop: 12 }}>
          {opcionEncontrada ? opcionEncontrada.feedback : decision.feedbackSinCoincidencia}
        </div>
      )}
    </div>
  );
}
