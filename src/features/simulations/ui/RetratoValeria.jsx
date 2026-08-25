import { descripcionDeValeria, spriteDeValeria } from './valeriaSprites';
import '../../../styles/valeria.css';

// Valeria — Tech Lead de Kawsay Market (§24).
//
// Usa los sprites del paquete `src/assets/sprites/valeria`. Antes había acá un
// sprite dibujado a mano con rects SVG; se reemplazó en cuanto llegó el arte
// definitivo, porque el personaje es de la simulación y no del código.
//
// El motor habla en los cinco estados de siempre (idle / feliz / confundido /
// molesto / sorprendido) y acá se traducen a las cuatro expresiones que Valeria
// tiene. Ese mapeo vive en `valeriaSprites.js`.
//
// Props:
//   estado   uno de los cinco estados del motor
//   tam      alto en px; si no se pasa, ocupa el contenedor
//   encuadre 'retrato' recorta a la cara (para burbujas chicas),
//            'completo' muestra la pose entera

export default function RetratoValeria({ estado = 'idle', tam = null, encuadre = 'retrato' }) {
  return (
    <div
      className={`valeria-retrato ${encuadre}`}
      style={tam ? { width: tam, height: tam } : undefined}
    >
      <img
        className="valeria-sprite"
        src={spriteDeValeria(estado)}
        alt={descripcionDeValeria(estado)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
