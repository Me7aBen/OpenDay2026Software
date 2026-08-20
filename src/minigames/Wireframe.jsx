import { useState } from 'react';
import DecisionUnica from './DecisionUnica';
import '../styles/wireframe.css';

function SeleccionMultiple({ decision, onElegir }) {
  const [seleccionados, setSeleccionados] = useState([]);
  const [confirmado, setConfirmado] = useState(false);
  const [arrastrando, setArrastrando] = useState(null);
  const max = decision.seleccionExacta ?? decision.opciones.length;

  const disponibles = decision.opciones.filter((o) => !seleccionados.includes(o.id));
  const puestos = seleccionados.map((id) => decision.opciones.find((o) => o.id === id));
  const correctas = decision.opciones.filter((opcion) => opcion.esCorrecta);
  const aciertos = puestos.filter((opcion) => opcion?.esCorrecta).length;
  const resultadoPerfecto = confirmado && aciertos === max;

  function agregar(opcionId) {
    if (confirmado || seleccionados.includes(opcionId) || seleccionados.length >= max) return;
    setSeleccionados((prev) => [...prev, opcionId]);
  }

  function quitar(opcionId) {
    if (confirmado) return;
    setSeleccionados((prev) => prev.filter((id) => id !== opcionId));
  }

  function confirmar() {
    if (confirmado) return;
    setConfirmado(true);
    onElegir(seleccionados);
  }

  return (
    <div className="wireframe-seleccion">
      {decision.contexto && (
        <div className="decision-contexto">
          <span>PROBLEMA</span>
          {decision.contexto}
        </div>
      )}
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>
        {decision.pregunta} <span style={{ color: 'var(--text-dim)', fontWeight: 600, fontSize: 13 }}>({seleccionados.length}/{max})</span>
      </div>
      <div className="wireframe-columnas">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="wireframe-etiqueta">{decision.etiquetaDisponibles ?? 'Opciones disponibles (arrastra o toca →)'}</div>
          {disponibles.filter((opcion) => !confirmado || opcion.esCorrecta).map((opcion) => (
            <div
              key={opcion.id}
              className={`chip${confirmado && opcion.esCorrecta ? ' solucion' : ''}`}
              draggable={!confirmado}
              onDragStart={() => setArrastrando(opcion.id)}
              onDragEnd={() => setArrastrando(null)}
              onClick={() => agregar(opcion.id)}
              style={{ cursor: 'grab', padding: '8px 12px', fontSize: 13 }}
            >
              {opcion.texto}{confirmado && opcion.esCorrecta ? ' ← solución' : ''}
            </div>
          ))}
        </div>
        <div
          data-testid="zona-destino-wireframe"
          className="wireframe-destino"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (arrastrando) agregar(arrastrando);
          }}
        >
          <div className="wireframe-etiqueta">{decision.etiquetaDestino ?? 'Tu selección'}</div>
          {puestos.map((opcion) => (
            <div
              key={opcion.id}
              className={`chip on${confirmado ? (opcion.esCorrecta ? ' acierto' : ' error') : ''}`}
              onClick={() => quitar(opcion.id)}
            >
              {opcion.texto} {confirmado ? (opcion.esCorrecta ? '✔' : '✕') : '✕'}
            </div>
          ))}
        </div>
      </div>
      {!confirmado && (
        <button type="button" className="btn-primary" style={{ marginTop: 12 }} disabled={seleccionados.length !== max} onClick={confirmar}>
          {decision.etiquetaConfirmar ?? 'CONFIRMAR RESPUESTA'}
        </button>
      )}
      {confirmado && (
        <div className={`feedback-box ${resultadoPerfecto ? 'ok' : 'error'}`} role="status">
          <div className="decision-feedback-titulo">
            {resultadoPerfecto ? '✔ ACIERTO' : `✕ TE EQUIVOCASTE (${aciertos}/${max})`}
          </div>
          <div>
            {resultadoPerfecto
              ? (decision.feedbackAcierto ?? 'Elegiste únicamente los elementos necesarios.')
              : (decision.feedbackError ?? 'Algunas opciones no resuelven el problema principal.')}
          </div>
          {!resultadoPerfecto && (
            <div className="decision-solucion">
              <strong>Solución:</strong> {correctas.map((opcion) => opcion.texto).join(' · ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// La fase 'diseñar' mezcla decisiones de arrastrar varios elementos
// (seleccion-multiple) con decisiones de elegir una sola opción
// (seleccion-unica, ej. idioma o colores). Este componente atiende ambas.
export default function Wireframe({ decision, onElegir, avatar }) {
  if (decision.tipoInteraccion === 'seleccion-multiple') {
    return (
      <div>
        <div className="label-pixel">📱 WIREFRAME</div>
        <div style={{ marginTop: 10 }}>
          <SeleccionMultiple decision={decision} onElegir={onElegir} />
        </div>
      </div>
    );
  }
  return (
    <DecisionUnica
      decision={decision}
      onElegir={onElegir}
      avatar={avatar}
      encabezado={<div className="label-pixel">📱 DISEÑO DE PANTALLA</div>}
    />
  );
}
