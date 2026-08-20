import DecisionUnica from './DecisionUnica';

export default function Deploy({ decision, onElegir }) {
  return (
    <DecisionUnica
      decision={decision}
      onElegir={onElegir}
      encabezado={<div className="label-pixel">🚀 DESPLIEGUE</div>}
    />
  );
}
