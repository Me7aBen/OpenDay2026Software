import DecisionUnica from './DecisionUnica';

// Render por defecto de `seleccion-unica`.
//
// El encabezado sale del contenido cuando el contenido lo declara. Nació como
// "📞 VIDEOLLAMADA CON EL CLIENTE" porque en Ccorca y Código Cero estas
// decisiones SON una conversación con el cliente — pero en "El Pedido Fantasma"
// la misma mecánica sirve para triar bugs, y anunciar una videollamada ahí es
// simplemente falso. Sin `metaMinijuego.encabezado`, se ve exactamente lo de
// siempre.
export default function Entrevista({ decision, onElegir, avatar }) {
  const encabezado = decision.metaMinijuego?.encabezado ?? '📞 VIDEOLLAMADA CON EL CLIENTE';

  return (
    <DecisionUnica
      decision={decision}
      onElegir={onElegir}
      avatar={avatar}
      encabezado={<div className="label-pixel">{encabezado}</div>}
    />
  );
}
