import '../../../styles/kawsay.css';

// Escena central de El Pedido Fantasma: el centro de operaciones de Kawsay
// Market (§20, §25).
//
// Es SVG con `shapeRendering="crispEdges"` y una grilla de 160x90 — pixel art
// dibujado con rectángulos, no una ilustración vectorial suave y no una imagen
// generada. Pocos colores, bordes duros, sprites compactos (§21). Pesa menos
// de 8 kB y escala a cualquier pantalla sin un solo asset binario.
//
// De la referencia se toma la COMPOSICIÓN, no el pixel exacto: estantería con
// cajas a la izquierda, monitor grande de métricas al centro, muelle de carga a
// la derecha, Valeria de pie y el escritorio del desarrollador en primer plano.
//
// Props:
//   metricas   objeto con los números del panel; si falta, no se dibujan.
//   alerta     boolean, pinta la fila de "PEDIDOS DUPLICADOS" en rojo.

const MURO = '#141d33';
const MURO_LUZ = '#1b2745';
const LADRILLO = '#22304f';
const CAJA = '#8a5a35';
const CAJA_LUZ = '#a8703f';
const CAJA_CINTA = '#c98d51';
const METAL = '#2a3a5c';

function Caja({ x, y, w = 12, h = 9 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={CAJA} />
      <rect x={x} y={y} width={w} height="1" fill={CAJA_LUZ} />
      <rect x={x + Math.floor(w / 2) - 1} y={y} width="2" height={h} fill={CAJA_CINTA} />
    </g>
  );
}

function Estante({ x, y }) {
  return (
    <g>
      <rect x={x} y={y} width="30" height="52" fill="#1a2440" />
      {[0, 1, 2].map((fila) => (
        <g key={fila}>
          <rect x={x} y={y + 16 * fila + 12} width="30" height="2" fill="#0e1730" />
          <Caja x={x + 2} y={y + 16 * fila + 2} />
          <Caja x={x + 16} y={y + 16 * fila + 2} />
        </g>
      ))}
    </g>
  );
}

function Lampara({ x, y }) {
  return (
    <g>
      <rect x={x + 5} y={y} width="2" height="3" fill="#0e1730" />
      <rect x={x} y={y + 3} width="12" height="3" fill="#38445f" />
      <rect x={x + 1} y={y + 5} width="10" height="2" fill="#ffe08a" />
      <rect x={x - 2} y={y + 7} width="16" height="6" fill="#ffd166" opacity="0.10" />
    </g>
  );
}

function Valeria({ x, y }) {
  return (
    <g>
      {/* Pelo */}
      <rect x={x + 2} y={y} width="8" height="4" fill="#4a2f22" />
      <rect x={x + 9} y={y + 2} width="3" height="7" fill="#4a2f22" />
      {/* Cara */}
      <rect x={x + 3} y={y + 3} width="6" height="6" fill="#e8b48c" />
      <rect x={x + 3} y={y + 5} width="2" height="2" fill="#9fd8ff" />
      <rect x={x + 6} y={y + 5} width="2" height="2" fill="#9fd8ff" />
      {/* Cuerpo: casaca azul con brazos cruzados */}
      <rect x={x + 1} y={y + 9} width="10" height="14" fill="#2f4d7a" />
      <rect x={x + 1} y={y + 9} width="10" height="1" fill="#3d6199" />
      <rect x={x + 1} y={y + 14} width="10" height="3" fill="#26406a" />
      <rect x={x + 3} y={y + 14} width="6" height="3" fill="#e8b48c" />
      {/* Piernas */}
      <rect x={x + 2} y={y + 23} width="3" height="8" fill="#1c2b4a" />
      <rect x={x + 7} y={y + 23} width="3" height="8" fill="#1c2b4a" />
    </g>
  );
}

function Desarrollador({ x, y }) {
  return (
    <g>
      {/* Visto de espaldas, como en la referencia */}
      <rect x={x + 2} y={y} width="8" height="5" fill="#5a3a26" />
      <rect x={x + 1} y={y + 5} width="10" height="12" fill="#2c4066" />
      <rect x={x + 1} y={y + 5} width="10" height="1" fill="#3a5486" />
      {/* Silla */}
      <rect x={x} y={y + 6} width="12" height="12" fill="#182338" />
      <rect x={x + 1} y={y + 5} width="10" height="12" fill="#2c4066" />
      <rect x={x + 5} y={y + 18} width="2" height="5" fill="#0f1830" />
      <rect x={x + 1} y={y + 23} width="10" height="2" fill="#0f1830" />
    </g>
  );
}

function Monitor({ x, y, w, h, children }) {
  return (
    <g>
      <rect x={x - 1} y={y - 1} width={w + 2} height={h + 2} fill="#38445f" />
      <rect x={x} y={y} width={w} height={h} fill="#08101f" />
      {children}
    </g>
  );
}

function Barras({ x, y, color }) {
  // Gráfico de la alerta: una línea quebrada que sube. Se dibuja con rects
  // de 1px para que se vea pixelada de verdad.
  const alturas = [2, 4, 3, 6, 4, 7, 5, 8, 6, 9, 7, 10];
  return (
    <g fill={color}>
      {alturas.map((alto, i) => (
        <rect key={i} x={x + i * 2} y={y + 10 - alto} width="1" height={alto} />
      ))}
    </g>
  );
}

export default function EscenaKawsay({ metricas = null, alerta = true, className = '' }) {
  return (
    <svg
      className={`kawsay-escena ${className}`}
      viewBox="0 0 160 90"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Centro de operaciones de Kawsay Market: estanterías con cajas, un tablero de pedidos y el muelle de carga al fondo."
    >
      {/* Muro de fondo */}
      <rect x="0" y="0" width="160" height="90" fill={MURO} />
      <g fill={LADRILLO} opacity="0.55">
        {Array.from({ length: 9 }).map((_, fila) =>
          Array.from({ length: 20 }).map((__, col) => (
            <rect
              key={`${fila}-${col}`}
              x={col * 8 + (fila % 2 ? 4 : 0)}
              y={fila * 7}
              width="7"
              height="6"
            />
          )),
        )}
      </g>
      <rect x="0" y="62" width="160" height="28" fill={MURO_LUZ} />
      <rect x="0" y="62" width="160" height="1" fill="#2c3b60" />

      <Lampara x="26" y="4" />
      <Lampara x="122" y="4" />

      {/* Estantería izquierda */}
      <Estante x="4" y="10" />
      <rect x="2" y="62" width="34" height="2" fill="#0f1830" />

      {/* Muelle de carga a la derecha */}
      <g>
        <rect x="126" y="16" width="30" height="46" fill="#0d1425" />
        <rect x="128" y="18" width="26" height="20" fill="#16233d" />
        <rect x="132" y="20" width="4" height="5" fill="#ffd166" opacity="0.5" />
        <rect x="140" y="20" width="4" height="5" fill="#ffd166" opacity="0.3" />
        {/* Camioneta */}
        <rect x="130" y="42" width="22" height="12" fill="#22304f" />
        <rect x="130" y="42" width="22" height="1" fill="#31456e" />
        <rect x="148" y="45" width="6" height="6" fill="#1a2440" />
        <rect x="133" y="54" width="5" height="4" fill="#0b1220" />
        <rect x="145" y="54" width="5" height="4" fill="#0b1220" />
        {/* Marcas del piso */}
        <rect x="120" y="70" width="10" height="2" fill={CAJA_CINTA} opacity="0.6" />
        <rect x="136" y="70" width="10" height="2" fill={CAJA_CINTA} opacity="0.6" />
      </g>

      {/* Cajas apiladas cerca del muelle */}
      <Caja x="112" y="52" w="14" h="10" />
      <Caja x="112" y="42" w="14" h="10" />
      <Caja x="100" y="56" w="11" h="8" />

      {/* Tablero central de métricas */}
      <Monitor x="46" y="10" w="72" h="42">
        {metricas && (
          <>
            {/* Columna izquierda: órdenes del día */}
            <rect x="49" y="13" width="34" height="18" fill="#0f1c33" />
            <rect x="49" y="13" width="34" height="1" fill={METAL} />
            <text x="51" y="19" className="kawsay-rotulo">
              ÓRDENES
            </text>
            <text x="51" y="28" className="kawsay-cifra">
              {metricas.total}
            </text>

            {/* Columna derecha: estados */}
            <rect x="86" y="13" width="29" height="9" fill="#0f1c33" />
            <text x="88" y="17" className="kawsay-rotulo">
              PENDIENTES
            </text>
            <text x="88" y="21" className="kawsay-cifra-min" fill="var(--red)">
              {metricas.pendientes}
            </text>

            <rect x="86" y="24" width="29" height="9" fill="#0f1c33" />
            <text x="88" y="28" className="kawsay-rotulo">
              EN PROCESO
            </text>
            <text x="88" y="32" className="kawsay-cifra-min" fill="var(--cyan)">
              {metricas.enProceso}
            </text>

            <rect x="86" y="35" width="29" height="9" fill="#0f1c33" />
            <text x="88" y="39" className="kawsay-rotulo">
              COMPLETADAS
            </text>
            <text x="88" y="43" className="kawsay-cifra-min" fill="var(--green)">
              {metricas.completadas}
            </text>

            {/* Alerta de duplicados con su gráfico */}
            <text x="51" y="37" className="kawsay-rotulo" fill={alerta ? 'var(--red)' : 'var(--green)'}>
              PEDIDOS DUPLICADOS
            </text>
            <Barras x="51" y="39" color={alerta ? 'var(--red)' : 'var(--green)'} />
          </>
        )}
      </Monitor>

      {/* Carrito de compras dibujado sobre el tablero, como en la referencia */}
      <g fill="#cfe0ff" opacity="0.9">
        <rect x="66" y="16" width="10" height="1" />
        <rect x="66" y="16" width="1" height="6" />
        <rect x="75" y="17" width="1" height="5" />
        <rect x="67" y="22" width="9" height="1" />
        <rect x="68" y="24" width="2" height="2" />
        <rect x="73" y="24" width="2" height="2" />
      </g>

      {/* Escritorio en primer plano */}
      <rect x="40" y="66" width="86" height="4" fill="#3a2b1e" />
      <rect x="40" y="66" width="86" height="1" fill="#4d3a28" />
      <rect x="44" y="70" width="3" height="14" fill="#2b2016" />
      <rect x="119" y="70" width="3" height="14" fill="#2b2016" />

      {/* Monitores del escritorio */}
      <Monitor x="42" y="54" w="22" h="12">
        <g fill="var(--green)" opacity="0.8">
          <rect x="44" y="57" width="10" height="1" />
          <rect x="44" y="59" width="14" height="1" />
          <rect x="44" y="61" width="7" height="1" />
        </g>
      </Monitor>
      <Monitor x="98" y="54" w="22" h="12">
        <g fill="var(--cyan)" opacity="0.7">
          <rect x="100" y="57" width="12" height="1" />
          <rect x="100" y="59" width="8" height="1" />
          <rect x="100" y="61" width="14" height="1" />
        </g>
      </Monitor>

      {/* Taza */}
      <rect x="88" y="62" width="5" height="4" fill="#4a5a7c" />
      <rect x="93" y="63" width="2" height="2" fill="#4a5a7c" />

      <Desarrollador x="72" y="46" />
      <Valeria x="24" y="30" />

      {/* Planta, para que la esquina no quede vacía */}
      <g>
        <rect x="6" y="74" width="8" height="8" fill="#7a4a2c" />
        <rect x="4" y="66" width="4" height="8" fill="#2fe6a6" opacity="0.7" />
        <rect x="9" y="64" width="4" height="10" fill="#2fe6a6" opacity="0.55" />
        <rect x="13" y="68" width="3" height="6" fill="#2fe6a6" opacity="0.45" />
      </g>
    </svg>
  );
}
