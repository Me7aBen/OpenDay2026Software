import DecisionUnica from './DecisionUnica';

export default function Bugs({ decision, onElegir, avatar }) {
  return (
    <DecisionUnica
      decision={decision}
      onElegir={onElegir}
      avatar={avatar}
      encabezado={<div className="label-pixel">🐞 BANDEJA DE BUGS</div>}
    />
  );
}
