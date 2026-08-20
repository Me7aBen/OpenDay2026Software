import DecisionUnica from './DecisionUnica';

export default function Entrevista({ decision, onElegir, avatar }) {
  return (
    <DecisionUnica
      decision={decision}
      onElegir={onElegir}
      avatar={avatar}
      encabezado={<div className="label-pixel">📞 VIDEOLLAMADA CON EL CLIENTE</div>}
    />
  );
}
