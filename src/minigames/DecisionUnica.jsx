import { useState } from 'react';
import '../styles/decision-unica.css';

// Render compartido para tipoInteraccion: 'seleccion-unica'.
// Los 5 minijuegos lo usan (salvo Wireframe, que es seleccion-multiple).
export default function DecisionUnica({ decision, onElegir, encabezado }) {
  const [elegidaId, setElegidaId] = useState(null);
  const opcionElegida = decision.opciones.find((o) => o.id === elegidaId);

  function elegir(opcionId) {
    if (elegidaId) return;
    setElegidaId(opcionId);
    onElegir([opcionId]);
  }

  return (
    <div className="decision">
      {encabezado}
      <div className="decision-pregunta">{decision.pregunta}</div>
      <div className="decision-opciones">
        {decision.opciones.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            className={`chip${elegidaId === opcion.id ? ' on' : ''}`}
            disabled={!!elegidaId}
            onClick={() => elegir(opcion.id)}
          >
            {opcion.texto}
          </button>
        ))}
      </div>
      {opcionElegida && (
        <div className="decision-feedback">
          {opcionElegida.descubrimiento && <div className="feedback-box info">💬 {opcionElegida.descubrimiento}</div>}
          {opcionElegida.feedback && <div className="feedback-box ok">{opcionElegida.feedback}</div>}
        </div>
      )}
    </div>
  );
}
