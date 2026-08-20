import { useState } from 'react';
import DecisionUnica from './DecisionUnica';

function SeleccionMultiple({ decision, onElegir }) {
  const [seleccionados, setSeleccionados] = useState([]);
  const [confirmado, setConfirmado] = useState(false);
  const [arrastrando, setArrastrando] = useState(null);
  const max = decision.seleccionExacta ?? decision.opciones.length;

  const disponibles = decision.opciones.filter((o) => !seleccionados.includes(o.id));
  const puestos = seleccionados.map((id) => decision.opciones.find((o) => o.id === id));

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
    <div>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>
        {decision.pregunta} <span style={{ color: 'var(--text-dim)', fontWeight: 600, fontSize: 13 }}>({seleccionados.length}/{max})</span>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 700, marginBottom: 2 }}>Elementos disponibles (arrástralos →)</div>
          {disponibles.map((opcion) => (
            <div
              key={opcion.id}
              className="chip"
              draggable={!confirmado}
              onDragStart={() => setArrastrando(opcion.id)}
              onDragEnd={() => setArrastrando(null)}
              onClick={() => agregar(opcion.id)}
              style={{ cursor: 'grab', padding: '8px 12px', fontSize: 13 }}
            >
              {opcion.texto}
            </div>
          ))}
        </div>
        <div
          data-testid="zona-destino-wireframe"
          style={{ flex: 1, border: '2px dashed var(--border)', borderRadius: 8, minHeight: 120, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (arrastrando) agregar(arrastrando);
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 700, marginBottom: 2 }}>Pantalla del celular del portero</div>
          {puestos.map((opcion) => (
            <div key={opcion.id} className="chip on" onClick={() => quitar(opcion.id)} style={{ padding: '8px 12px', fontSize: 13 }}>
              {opcion.texto} ✕
            </div>
          ))}
        </div>
      </div>
      <button type="button" className="btn-primary" style={{ marginTop: 12 }} disabled={confirmado || seleccionados.length !== max} onClick={confirmar}>
        Confirmar pantalla
      </button>
    </div>
  );
}

// La fase 'diseñar' mezcla decisiones de arrastrar varios elementos
// (seleccion-multiple) con decisiones de elegir una sola opción
// (seleccion-unica, ej. idioma o colores). Este componente atiende ambas.
export default function Wireframe({ decision, onElegir }) {
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
  return <DecisionUnica decision={decision} onElegir={onElegir} encabezado={<div className="label-pixel">📱 DISEÑO DE PANTALLA</div>} />;
}
