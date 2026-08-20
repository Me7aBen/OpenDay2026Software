import DecisionUnica from './DecisionUnica';

export default function Entrevista({ decision, onElegir }) {
  return (
    <DecisionUnica
      decision={decision}
      onElegir={onElegir}
      encabezado={<div className="label-pixel">📞 VIDEOLLAMADA CON EL CLIENTE</div>}
    />
  );
}
