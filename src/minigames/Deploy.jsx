import DecisionUnica from './DecisionUnica';

export default function Deploy({ decision, onElegir, avatar }) {
  return (
    <DecisionUnica
      decision={decision}
      onElegir={onElegir}
      avatar={avatar}
      encabezado={<div className="label-pixel">🚀 DESPLIEGUE</div>}
    />
  );
}
