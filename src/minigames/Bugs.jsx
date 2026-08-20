import DecisionUnica from './DecisionUnica';

export default function Bugs({ decision, onElegir }) {
  return (
    <DecisionUnica
      decision={decision}
      onElegir={onElegir}
      encabezado={<div className="label-pixel">🐞 BANDEJA DE BUGS</div>}
    />
  );
}
