// Iconos pixel art de los servicios de NEXO y de las piezas de red.
//
// Son SVG de rectángulos sobre una grilla de 12x12, con `crispEdges` para que
// no se antialiasen al escalar. Reemplazan a los emojis: Código Cero no usa
// emojis como elemento visual (a diferencia de Ccorca, que sí y sigue igual).
//
// Todos comparten grilla y peso visual para que en el tablero del circuito y en
// la ciudad se lean como piezas del mismo sistema.
//
// Props:
//   tipo   'hospital'|'semaforo'|'comunicaciones'|'transporte'|'servidor'
//          |'seguridad'|'infectado'|'nodo'
//   tam    number - lado en px
//   color  string - color principal; por defecto currentColor, así el icono
//                   hereda el estado (activo/apagado) de su contenedor

const DIBUJOS = {
  // Cruz médica dentro de un recuadro.
  hospital: (c) => (
    <>
      <rect x="1" y="2" width="10" height="9" fill={c} opacity="0.25" />
      <rect x="1" y="2" width="10" height="1" fill={c} />
      <rect x="1" y="10" width="10" height="1" fill={c} />
      <rect x="1" y="2" width="1" height="9" fill={c} />
      <rect x="10" y="2" width="1" height="9" fill={c} />
      <rect x="5" y="4" width="2" height="5" fill={c} />
      <rect x="3" y="5.5" width="6" height="2" fill={c} />
    </>
  ),
  // Semáforo: poste y tres luces.
  semaforo: (c) => (
    <>
      <rect x="4" y="1" width="4" height="8" fill={c} opacity="0.3" />
      <rect x="4" y="1" width="4" height="1" fill={c} />
      <rect x="4" y="8" width="4" height="1" fill={c} />
      <rect x="4" y="1" width="1" height="8" fill={c} />
      <rect x="7" y="1" width="1" height="8" fill={c} />
      <rect x="5" y="2" width="2" height="2" fill={c} />
      <rect x="5" y="5" width="2" height="2" fill={c} opacity="0.55" />
      <rect x="5" y="9" width="2" height="3" fill={c} />
    </>
  ),
  // Antena con ondas.
  comunicaciones: (c) => (
    <>
      <rect x="5" y="4" width="2" height="7" fill={c} />
      <rect x="3" y="10" width="6" height="1" fill={c} />
      <rect x="4" y="2" width="1" height="1" fill={c} />
      <rect x="7" y="2" width="1" height="1" fill={c} />
      <rect x="2" y="1" width="1" height="2" fill={c} opacity="0.6" />
      <rect x="9" y="1" width="1" height="2" fill={c} opacity="0.6" />
      <rect x="5" y="1" width="2" height="2" fill={c} />
    </>
  ),
  // Vagón de tren.
  transporte: (c) => (
    <>
      <rect x="1" y="3" width="10" height="6" fill={c} opacity="0.25" />
      <rect x="1" y="3" width="10" height="1" fill={c} />
      <rect x="1" y="3" width="1" height="6" fill={c} />
      <rect x="10" y="3" width="1" height="6" fill={c} />
      <rect x="1" y="8" width="10" height="1" fill={c} />
      <rect x="3" y="5" width="2" height="2" fill={c} />
      <rect x="7" y="5" width="2" height="2" fill={c} />
      <rect x="2" y="9" width="2" height="2" fill={c} />
      <rect x="8" y="9" width="2" height="2" fill={c} />
    </>
  ),
  // Rack de servidor: tres bandejas.
  servidor: (c) => (
    <>
      <rect x="2" y="1" width="8" height="10" fill={c} opacity="0.22" />
      <rect x="2" y="1" width="8" height="1" fill={c} />
      <rect x="2" y="1" width="1" height="10" fill={c} />
      <rect x="9" y="1" width="1" height="10" fill={c} />
      <rect x="2" y="10" width="8" height="1" fill={c} />
      <rect x="3" y="3" width="6" height="1" fill={c} />
      <rect x="3" y="6" width="6" height="1" fill={c} />
      <rect x="8" y="4" width="1" height="1" fill={c} />
      <rect x="8" y="7" width="1" height="1" fill={c} />
    </>
  ),
  // Escudo.
  seguridad: (c) => (
    <>
      <rect x="2" y="2" width="8" height="5" fill={c} opacity="0.28" />
      <rect x="2" y="2" width="8" height="1" fill={c} />
      <rect x="2" y="2" width="1" height="6" fill={c} />
      <rect x="9" y="2" width="1" height="6" fill={c} />
      <rect x="3" y="8" width="6" height="1" fill={c} />
      <rect x="4" y="9" width="4" height="1" fill={c} />
      <rect x="5" y="10" width="2" height="1" fill={c} />
      <rect x="5" y="4" width="2" height="4" fill={c} />
      <rect x="4" y="5" width="4" height="1" fill={c} />
    </>
  ),
  // Nodo corrompido: rombo roto con esquirlas. La forma (no el color) es lo que
  // lo distingue, para no depender del color como única señal.
  infectado: (c) => (
    <>
      <rect x="5" y="1" width="2" height="2" fill={c} />
      <rect x="3" y="3" width="6" height="2" fill={c} />
      <rect x="1" y="5" width="4" height="2" fill={c} />
      <rect x="7" y="5" width="4" height="2" fill={c} />
      <rect x="3" y="7" width="2" height="2" fill={c} />
      <rect x="7" y="7" width="2" height="2" fill={c} />
      <rect x="5" y="9" width="2" height="2" fill={c} />
    </>
  ),
  // Nodo sano: hexágono compacto.
  nodo: (c) => (
    <>
      <rect x="4" y="1" width="4" height="1" fill={c} />
      <rect x="2" y="2" width="8" height="2" fill={c} opacity="0.4" />
      <rect x="2" y="2" width="1" height="8" fill={c} />
      <rect x="9" y="2" width="1" height="8" fill={c} />
      <rect x="2" y="4" width="8" height="4" fill={c} opacity="0.25" />
      <rect x="4" y="4" width="4" height="4" fill={c} />
      <rect x="2" y="9" width="8" height="1" fill={c} />
      <rect x="4" y="10" width="4" height="1" fill={c} />
    </>
  ),
};

export default function IconoServicio({ tipo, tam = 20, color = 'currentColor' }) {
  const dibujo = DIBUJOS[tipo];
  if (!dibujo) return null;
  return (
    <svg
      width={tam}
      height={tam}
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {dibujo(color)}
    </svg>
  );
}
