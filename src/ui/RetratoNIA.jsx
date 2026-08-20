import { ESTADO_IDLE, ESTADOS } from './estadosCliente';
import '../styles/nia.css';

// Retrato de NIA, la asistente digital de "Código Cero".
//
// Cumple el mismo contrato que EstadoCliente (recibe uno de los 5 estados del
// motor) pero no dibuja un emoji: es un núcleo pixel art con corchetes de
// interfaz y una barra de "ojo" que cambia de forma. Eso es a propósito —
// Código Cero no usa emojis como elemento visual, y NIA no debe parecerse a la
// identidad de Ccorca.
//
// Los 5 estados vienen del motor y significan lo mismo que en Ccorca (reacción
// a la última decisión), así que la traducción es puramente visual:
//   idle -> atenta   feliz -> confirmando   confundido -> analizando
//   molesto -> alerta   sorprendido -> escaneando

const COLOR_POR_ESTADO = {
  idle: 'var(--cyan)',
  feliz: 'var(--green)',
  confundido: 'var(--gold)',
  molesto: 'var(--red)',
  sorprendido: 'var(--pink)',
};

// La forma del "ojo" es la segunda señal, además del color: quien no distingue
// bien los colores igual ve que la expresión cambió.
function Ojo({ estado, color }) {
  if (estado === 'feliz') {
    return (
      <>
        <rect x="5" y="8" width="2" height="1" fill={color} />
        <rect x="7" y="7" width="2" height="1" fill={color} />
        <rect x="9" y="8" width="2" height="1" fill={color} />
      </>
    );
  }
  if (estado === 'confundido') {
    return (
      <>
        <rect x="5" y="7" width="3" height="2" fill={color} />
        <rect x="9" y="8" width="2" height="1" fill={color} />
      </>
    );
  }
  if (estado === 'molesto') {
    return (
      <>
        <rect x="5" y="6" width="6" height="1" fill={color} />
        <rect x="5" y="8" width="6" height="2" fill={color} />
      </>
    );
  }
  if (estado === 'sorprendido') {
    return <rect x="6" y="6" width="4" height="4" fill={color} />;
  }
  return <rect x="5" y="7" width="6" height="2" fill={color} />;
}

export default function RetratoNIA({ estado = ESTADO_IDLE }) {
  const clave = ESTADOS[estado] ? estado : ESTADO_IDLE;
  const color = COLOR_POR_ESTADO[clave];

  return (
    <div className="nia-retrato" aria-label={`NIA · ${ESTADOS[clave].label}`}>
      <svg
        key={clave}
        className={`nia-svg nia-${clave}`}
        viewBox="0 0 16 16"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        {/* Corchetes de interfaz: enmarcan el núcleo y dan el aire de HUD. */}
        <g fill={color} opacity="0.75">
          <rect x="1" y="1" width="4" height="1" />
          <rect x="1" y="1" width="1" height="4" />
          <rect x="11" y="1" width="4" height="1" />
          <rect x="14" y="1" width="1" height="4" />
          <rect x="1" y="14" width="4" height="1" />
          <rect x="1" y="11" width="1" height="4" />
          <rect x="11" y="14" width="4" height="1" />
          <rect x="14" y="11" width="1" height="4" />
        </g>

        {/* Núcleo */}
        <rect x="4" y="4" width="8" height="8" fill={color} opacity="0.16" />
        <rect x="4" y="4" width="8" height="1" fill={color} opacity="0.5" />
        <rect x="4" y="11" width="8" height="1" fill={color} opacity="0.5" />

        <Ojo estado={clave} color={color} />

        {/* Línea de barrido: la única parte animada. Se apaga con
            prefers-reduced-motion (ver styles/nia.css). */}
        <rect className="nia-scan" x="4" y="4" width="8" height="1" fill={color} opacity="0.35" />
      </svg>
    </div>
  );
}
