import { normalizarAvatar } from './avatarOpciones';
import '../styles/escena-pixel.css';

// Escenas pixel art narrativas: las ilustraciones de la historieta y de las
// decisiones. Dibujos completos que cuentan algo, no iconos sobre la interfaz.
//
// --- Por qué la grilla es de 64x48 ----------------------------------------
// Antes era de 120x100. A 435px de ancho en pantalla eso daba un "píxel" de
// 3.6px, y con detalles de 1-2 unidades las formas se volvían ruido: no se
// entendía qué era cada cosa. Con 64x48 el píxel mide ~6.8px, más del doble,
// y obliga a dibujar con bloques grandes.
//
// La regla al dibujar acá: ningún detalle mide menos de 1 unidad, y las formas
// que hay que reconocer (cabeza, ventana, cruz) miden 2 o más. Si algo no se
// entiende a este tamaño, se simplifica; no se achica.
//
// --- Cómo está armado ------------------------------------------------------
// Una escena = un FONDO + PIEZAS colocadas encima + un EFECTO opcional.
// Componer por capas es lo que permite 31 escenas distintas sin dibujar 31
// ilustraciones desde cero.
//
// --- Paleta ---------------------------------------------------------------
// Synthwave sobre fondo oscuro: cian, azul, violeta y magenta. Rojo solo para
// interferencia, ámbar para luz cálida.

const C = {
  cielo: '#141c3a',
  cieloAtaque: '#2e1024',
  cieloAlba: '#0d2c3d',
  torre: '#232f58',
  torreOscura: '#18203f',
  torreAtaque: '#341a38',
  borde: '#44578c',
  linea: '#0a0f1f',
  cian: '#4ad9ff',
  magenta: '#ff5c9d',
  violeta: '#9b8cff',
  verde: '#2fe6a6',
  rojo: '#ff5c6a',
  ambar: '#ffd166',
  piel: '#f0c8a0',
  pielB: '#c98d5e',
  pielC: '#8d5a3b',
};

const HORIZONTE = 34;

// --- FONDOS ---------------------------------------------------------------

function Skyline({ cieloColor, torreColor, luz, densidad }) {
  const torres = [
    { x: 0, w: 9, h: 13 },
    { x: 10, w: 7, h: 19 },
    { x: 18, w: 10, h: 10 },
    { x: 29, w: 8, h: 16 },
    { x: 38, w: 9, h: 12 },
    { x: 48, w: 7, h: 20 },
    { x: 56, w: 8, h: 14 },
  ];
  const ventanas = [];
  torres.forEach((t) => {
    for (let cx = 2; cx + 2 <= t.w - 2; cx += 4) {
      for (let cy = 3; cy + 2 <= t.h - 1; cy += 4) {
        const x = t.x + cx;
        const y = HORIZONTE - t.h + cy;
        // Encendido determinista por posición: nunca titila entre renders.
        ventanas.push({ x, y, on: (x * 5 + y * 9) % 10 < densidad * 10 });
      }
    }
  });
  return (
    <>
      <rect x="0" y="0" width="64" height="48" fill={cieloColor} />
      <rect x="7" y="4" width="1" height="1" fill="#7d8fbe" />
      <rect x="27" y="2" width="1" height="1" fill="#7d8fbe" />
      <rect x="52" y="6" width="1" height="1" fill="#7d8fbe" />
      {torres.map((t) => (
        <g key={t.x}>
          <rect x={t.x} y={HORIZONTE - t.h} width={t.w} height={t.h} fill={torreColor} />
          <rect x={t.x} y={HORIZONTE - t.h} width={t.w} height="1" fill={luz} opacity="0.35" />
        </g>
      ))}
      {ventanas.map((v) => (
        <rect key={`${v.x}-${v.y}`} x={v.x} y={v.y} width="2" height="2" fill={v.on ? luz : C.linea} />
      ))}
      <rect x="0" y={HORIZONTE} width="64" height={48 - HORIZONTE} fill="#0a0f22" />
      <rect x="0" y={HORIZONTE} width="64" height="1" fill={luz} opacity="0.55" />
    </>
  );
}

const FONDOS = {
  'ciudad-calma': () => <Skyline cieloColor={C.cielo} torreColor={C.torre} luz={C.ambar} densidad={0.8} />,
  'ciudad-ataque': () => (
    <>
      <Skyline cieloColor={C.cieloAtaque} torreColor={C.torreAtaque} luz={C.rojo} densidad={0.25} />
      <rect x="0" y="0" width="64" height="48" fill={C.rojo} opacity="0.07" />
    </>
  ),
  'ciudad-parcial': () => <Skyline cieloColor={C.cielo} torreColor={C.torre} luz={C.ambar} densidad={0.5} />,
  'ciudad-plena': () => (
    <>
      <Skyline cieloColor={C.cieloAlba} torreColor={C.torre} luz={C.cian} densidad={1} />
      <rect x="0" y="0" width="64" height="48" fill={C.cian} opacity="0.06" />
    </>
  ),
  // Sala de control: pared con franja de monitores y piso reflejante.
  interior: () => (
    <>
      <rect x="0" y="0" width="64" height="48" fill="#151d3d" />
      <rect x="0" y="0" width="64" height="30" fill="#101736" />
      {[3, 17, 31, 45].map((x) => (
        <rect key={x} x={x} y="3" width="10" height="1" fill={C.borde} opacity="0.55" />
      ))}
      <rect x="0" y="36" width="64" height="12" fill="#0c1230" />
      <rect x="0" y="36" width="64" height="1" fill={C.cian} opacity="0.4" />
      {[5, 24, 43].map((x) => (
        <rect key={x} x={x} y="39" width="8" height="1" fill={C.cian} opacity="0.14" />
      ))}
    </>
  ),
  // Fondo liso para las tarjetas de opción: la pieza de encima manda.
  plano: () => (
    <>
      <rect x="0" y="0" width="64" height="48" fill="#101736" />
      {[8, 20, 32, 44].map((y) => (
        <rect key={y} x="0" y={y} width="64" height="1" fill={C.borde} opacity="0.16" />
      ))}
    </>
  ),
  // Explanada de la feria: carpas, guirnalda y ciudad chica al fondo.
  feria: () => (
    <>
      <rect x="0" y="0" width="64" height="48" fill={C.cielo} />
      {[[1, 20, 6, 10], [8, 16, 5, 14], [54, 18, 5, 12], [60, 22, 4, 8]].map(([x, y, w, h]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={w} height={h} fill={C.torreOscura} />
          <rect x={x + 1} y={y + 2} width="2" height="2" fill={C.ambar} />
        </g>
      ))}
      <rect x="0" y="30" width="64" height="18" fill="#1a2348" />
      <rect x="0" y="30" width="64" height="1" fill={C.borde} />
      <rect x="4" y="7" width="56" height="1" fill={C.borde} opacity="0.6" />
      {[6, 17, 28, 39, 50, 58].map((x, i) => (
        <rect key={x} x={x} y="8" width="2" height="2" fill={i % 2 ? C.magenta : C.cian} />
      ))}
    </>
  ),
};

// --- PIEZAS ---------------------------------------------------------------
// Cada pieza se dibuja desde el origen (0,0) hacia abajo-derecha. El tamaño va
// comentado porque las escenas y el centrado de tarjetas lo usan.

// Persona: 7 de ancho (con brazos) x 12 de alto. La cabeza mide 5x4 y un ojo
// 1x1 — a ~7px por unidad, un ojo es un cuadrado visible, no una mota.
function Figura({ ropa, piel = C.piel, pelo = '#241a33' }) {
  return (
    <>
      <rect x="0" y="0" width="5" height="1" fill={pelo} />
      <rect x="0" y="1" width="5" height="3" fill={piel} />
      <rect x="1" y="2" width="1" height="1" fill={C.linea} />
      <rect x="3" y="2" width="1" height="1" fill={C.linea} />
      <rect x="0" y="4" width="5" height="5" fill={ropa} />
      <rect x="0" y="4" width="5" height="1" fill="#ffffff" opacity="0.22" />
      <rect x="-1" y="5" width="1" height="3" fill={piel} />
      <rect x="5" y="5" width="1" height="3" fill={piel} />
      <rect x="0" y="9" width="2" height="3" fill="#2b2440" />
      <rect x="3" y="9" width="2" height="3" fill="#2b2440" />
    </>
  );
}

// 10 x 14 — proyector abajo, cono de luz y núcleo con un "ojo" de 4x2.
function NucleoNIA({ color }) {
  return (
    <>
      <rect x="1" y="13" width="8" height="1" fill={C.borde} />
      <path d="M2 13 L0 2 L10 2 L8 13 Z" fill={color} opacity="0.14" />
      <rect x="1" y="2" width="8" height="9" fill={color} opacity="0.22" />
      <rect x="1" y="2" width="8" height="1" fill={color} />
      <rect x="1" y="10" width="8" height="1" fill={color} />
      <rect x="0" y="1" width="3" height="1" fill={color} />
      <rect x="7" y="1" width="3" height="1" fill={color} />
      <rect x="3" y="5" width="4" height="2" fill={color} />
    </>
  );
}

// 8 x 14 — pantalla de 6x5 con dos líneas, teclado y base.
function Terminal({ roto = false }) {
  return (
    <>
      <rect x="1" y="12" width="6" height="2" fill="#1e2749" />
      <rect x="0" y="0" width="8" height="12" fill="#1a2245" />
      <rect x="0" y="0" width="8" height="1" fill={C.borde} />
      <rect x="1" y="2" width="6" height="5" fill={roto ? C.rojo : C.cian} opacity={roto ? 0.5 : 0.7} />
      <rect x="2" y="3" width="3" height="1" fill={roto ? C.magenta : C.linea} />
      <rect x="2" y="5" width="4" height="1" fill={roto ? C.rojo : C.linea} />
      <rect x="1" y="9" width="6" height="2" fill="#101736" />
    </>
  );
}

// 22 x 15 — marco compartido por los tres paneles de alerta.
function PanelAlerta({ filas }) {
  return (
    <>
      <rect x="0" y="0" width="22" height="15" fill="#0b1224" />
      <rect x="0" y="0" width="22" height="1" fill={C.borde} />
      {filas}
    </>
  );
}

const PIEZAS = {
  // 19 x 12
  estudiantes: () => (
    <>
      <g transform="translate(1,0)"><Figura ropa={C.cian} /></g>
      <g transform="translate(8,1)"><Figura ropa={C.magenta} piel={C.pielB} pelo="#3a2418" /></g>
      <g transform="translate(15,0)"><Figura ropa={C.violeta} piel={C.pielC} pelo="#141026" /></g>
    </>
  ),
  // 9 x 12 — el signo de duda son dos bloques, no un emoji.
  operadora: () => (
    <>
      <g transform="translate(1,0)"><Figura ropa="#3f52a0" piel={C.pielB} pelo="#3a2418" /></g>
      <rect x="7" y="0" width="2" height="4" fill={C.ambar} />
      <rect x="7" y="5" width="2" height="2" fill={C.ambar} />
    </>
  ),
  'nia-holo': () => <NucleoNIA color={C.cian} />,
  'nia-alerta': () => <NucleoNIA color={C.rojo} />,
  terminal: () => <Terminal />,
  'terminal-glitch': () => <Terminal roto />,
  // 20 x 15 — monitor grande de pared.
  'pantalla-grande': () => (
    <>
      <rect x="0" y="0" width="20" height="13" fill="#0b1224" />
      <rect x="0" y="0" width="20" height="1" fill={C.borde} />
      <rect x="0" y="12" width="20" height="1" fill={C.borde} />
      <rect x="0" y="0" width="1" height="13" fill={C.borde} />
      <rect x="19" y="0" width="1" height="13" fill={C.borde} />
      <rect x="9" y="13" width="2" height="2" fill={C.borde} />
    </>
  ),
  // 14 x 14 — anillo roto con una diagonal: se lee como un sello.
  'simbolo-cero': () => (
    <>
      <rect x="4" y="0" width="6" height="2" fill={C.rojo} />
      <rect x="2" y="2" width="2" height="2" fill={C.rojo} />
      <rect x="10" y="2" width="2" height="2" fill={C.rojo} />
      <rect x="0" y="4" width="2" height="6" fill={C.rojo} />
      <rect x="12" y="4" width="2" height="6" fill={C.rojo} />
      <rect x="2" y="10" width="2" height="2" fill={C.rojo} />
      <rect x="10" y="10" width="2" height="2" fill={C.rojo} />
      <rect x="4" y="12" width="6" height="2" fill={C.rojo} />
      <rect x="4" y="3" width="2" height="2" fill={C.magenta} />
      <rect x="6" y="6" width="2" height="2" fill={C.magenta} />
      <rect x="8" y="9" width="2" height="2" fill={C.magenta} />
    </>
  ),
  // 14 x 16 — la cruz mide 4 unidades de grosor: se reconoce de lejos.
  hospital: ({ on }) => (
    <>
      <rect x="3" y="0" width="8" height="3" fill={on ? C.cian : '#2a3358'} />
      <rect x="0" y="3" width="14" height="13" fill={on ? '#22406b' : '#1a2245'} />
      <rect x="0" y="3" width="14" height="1" fill={on ? C.cian : C.borde} />
      <rect x="5" y="5" width="4" height="9" fill={on ? '#ffffff' : '#3c476b'} />
      <rect x="2" y="8" width="10" height="3" fill={on ? '#ffffff' : '#3c476b'} />
      <rect x="1" y="5" width="2" height="2" fill={on ? C.ambar : '#141b34'} />
      <rect x="11" y="5" width="2" height="2" fill={on ? C.ambar : '#141b34'} />
      <rect x="1" y="12" width="2" height="2" fill={on ? C.ambar : '#141b34'} />
      <rect x="11" y="12" width="2" height="2" fill={on ? C.ambar : '#141b34'} />
    </>
  ),
  // 6 x 15 — tres luces de 3x3 y el poste.
  semaforo: ({ on }) => (
    <>
      <rect x="0" y="0" width="6" height="11" fill="#1a2245" />
      <rect x="0" y="0" width="6" height="1" fill={C.borde} />
      <rect x="2" y="1" width="3" height="3" fill={on ? '#3a1c22' : C.rojo} />
      <rect x="2" y="4" width="3" height="3" fill="#33301c" />
      <rect x="2" y="7" width="3" height="3" fill={on ? C.verde : '#16281f'} />
      <rect x="2" y="11" width="2" height="4" fill="#141b34" />
    </>
  ),
  // 9 x 15 — plato, mástil y ondas.
  antena: ({ on }) => (
    <>
      <rect x="4" y="4" width="2" height="10" fill="#1e2749" />
      <rect x="2" y="14" width="6" height="1" fill="#141b34" />
      <rect x="3" y="1" width="4" height="3" fill={on ? C.cian : '#2a3358'} />
      {on ? (
        <>
          <rect x="1" y="0" width="1" height="3" fill={C.cian} opacity="0.8" />
          <rect x="8" y="0" width="1" height="3" fill={C.cian} opacity="0.8" />
        </>
      ) : null}
    </>
  ),
  // 22 x 15 — pared de avisos amontonados: el ruido ES el mensaje.
  'panel-saturado': () => (
    <PanelAlerta
      filas={[
        [1, 2, 7, C.rojo], [9, 2, 5, C.ambar], [15, 2, 6, C.magenta],
        [1, 5, 10, C.violeta], [12, 5, 4, C.rojo], [17, 5, 4, C.cian],
        [1, 8, 4, C.ambar], [6, 8, 8, C.rojo], [15, 8, 6, C.violeta],
        [1, 11, 9, C.magenta], [11, 11, 5, C.ambar], [17, 11, 4, C.rojo],
      ].map(([x, y, w, f]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height="2" fill={f} opacity="0.8" />
      ))}
    />
  ),
  // 22 x 15 — tres avisos: cuadro de color + icono + barra de texto.
  'panel-limpio': () => (
    <PanelAlerta
      filas={[[2, C.rojo], [6, C.ambar], [10, C.verde]].map(([y, f]) => (
        <g key={y}>
          <rect x="1" y={y} width="3" height="3" fill={f} />
          <rect x="2" y={y + 1} width="1" height="1" fill="#0b1224" />
          <rect x="5" y={y} width="11" height="2" fill={f} opacity="0.9" />
          <rect x="17" y={y} width="4" height="2" fill="#4a5578" />
        </g>
      ))}
    />
  ),
  // 22 x 15 — solo barras de color, sin icono ni etiqueta.
  'alerta-solo-color': () => (
    <PanelAlerta
      filas={[[3, C.rojo], [7, C.ambar], [11, C.verde]].map(([y, f]) => (
        <rect key={y} x="2" y={y} width="18" height="3" fill={f} />
      ))}
    />
  ),
  // 22 x 15 — manchas luminosas sin forma reconocible.
  'alerta-brillos': () => (
    <PanelAlerta
      filas={[[3, 3, C.magenta], [12, 2, C.cian], [7, 9, C.violeta], [16, 8, C.magenta]].map(([x, y, f]) => (
        <g key={`${x}-${y}`}>
          <rect x={x - 1} y={y - 1} width="6" height="6" fill={f} opacity="0.22" />
          <rect x={x} y={y} width="4" height="4" fill={f} opacity="0.9" />
        </g>
      ))}
    />
  ),
  // 18 x 14 — lista con una fila enmarcada: la sospechosa.
  'registro-lista': () => (
    <>
      <rect x="0" y="0" width="18" height="14" fill="#0b1224" />
      <rect x="0" y="0" width="18" height="1" fill={C.borde} />
      {[2, 5, 8, 11].map((y, i) => (
        <g key={y}>
          <rect x="2" y={y} width="2" height="2" fill={i === 1 ? C.magenta : '#3c476b'} />
          <rect x="5" y={y} width={i === 1 ? 11 : 8} height="2" fill={i === 1 ? C.magenta : '#2f3a5e'} />
        </g>
      ))}
      <rect x="1" y="4" width="16" height="1" fill={C.magenta} />
      <rect x="1" y="8" width="16" height="1" fill={C.magenta} />
      <rect x="1" y="4" width="1" height="5" fill={C.magenta} />
      <rect x="16" y="4" width="1" height="5" fill={C.magenta} />
    </>
  ),
  // 12 x 10 — cuerpo, lente y soporte.
  camara: () => (
    <>
      <rect x="4" y="0" width="2" height="3" fill="#141b34" />
      <rect x="2" y="0" width="6" height="1" fill={C.borde} />
      <rect x="0" y="3" width="10" height="6" fill="#1e2749" />
      <rect x="10" y="4" width="2" height="3" fill="#2a3358" />
      <rect x="1" y="4" width="3" height="3" fill={C.cian} opacity="0.9" />
      <rect x="1" y="9" width="2" height="1" fill={C.rojo} />
    </>
  ),
  // 10 x 10 — bloque con marco y núcleo de 4x4.
  nodo: ({ on, malo }) => {
    const c = malo ? C.rojo : on ? C.cian : '#2f3a5e';
    return (
      <>
        <rect x="1" y="0" width="8" height="10" fill={malo ? '#33131f' : '#141b34'} />
        <rect x="1" y="0" width="8" height="1" fill={c} />
        <rect x="1" y="9" width="8" height="1" fill={c} />
        <rect x="1" y="0" width="1" height="10" fill={c} />
        <rect x="8" y="0" width="1" height="10" fill={c} />
        <rect x="3" y="3" width="4" height="4" fill={c} />
        {malo ? (
          <>
            <rect x="0" y="2" width="1" height="2" fill={C.rojo} />
            <rect x="9" y="6" width="1" height="2" fill={C.magenta} />
          </>
        ) : null}
      </>
    );
  },
  // 5 x 14 — muro con remaches.
  barrera: () => (
    <>
      <rect x="0" y="0" width="3" height="14" fill={C.verde} />
      <rect x="0" y="0" width="3" height="2" fill="#ffffff" opacity="0.35" />
      {[3, 7, 11].map((y) => (
        <rect key={y} x="3" y={y} width="2" height="2" fill={C.verde} opacity="0.65" />
      ))}
    </>
  ),
  // 16 x 12 — dos cables cortados, con la rotura marcada en rojo.
  'cables-danados': () => (
    <>
      <rect x="0" y="2" width="6" height="2" fill={C.cian} opacity="0.8" />
      <rect x="9" y="2" width="7" height="2" fill="#2f3a5e" />
      <rect x="6" y="1" width="2" height="2" fill={C.rojo} />
      <rect x="0" y="8" width="4" height="2" fill="#2f3a5e" />
      <rect x="7" y="8" width="9" height="2" fill="#2f3a5e" />
      <rect x="4" y="9" width="2" height="2" fill={C.rojo} />
    </>
  ),
  // 20 x 12 — bloque de código flotante.
  'codigo-flotante': () => (
    <>
      <rect x="0" y="0" width="20" height="12" fill="#060c1c" />
      <rect x="0" y="0" width="20" height="1" fill={C.cian} opacity="0.7" />
      {[[2, 7, C.cian], [5, 12, C.verde], [8, 9, C.cian]].map(([y, w, f]) => (
        <rect key={y} x="2" y={y} width={w} height="2" fill={f} opacity="0.9" />
      ))}
      <rect x="16" y="8" width="2" height="2" fill={C.magenta} />
    </>
  ),
  // 10 x 15 — rack con bandejas y luces.
  'servidor-rack': () => (
    <>
      <rect x="0" y="0" width="10" height="15" fill="#161e3d" />
      <rect x="0" y="0" width="10" height="1" fill={C.borde} />
      {[2, 6, 10].map((y) => (
        <g key={y}>
          <rect x="1" y={y} width="8" height="3" fill="#0c1230" />
          <rect x="7" y={y + 1} width="1" height="1" fill={C.verde} />
        </g>
      ))}
    </>
  ),
  // 16 x 15 — galería con vitrinas.
  'centro-comercial': ({ on }) => (
    <>
      <rect x="2" y="0" width="12" height="4" fill={on ? C.violeta : '#2a3358'} />
      <rect x="0" y="4" width="16" height="11" fill={on ? '#2d2551' : '#1a2245'} />
      <rect x="0" y="4" width="16" height="1" fill={on ? C.violeta : C.borde} />
      {[2, 7, 12].map((x) => (
        <rect key={x} x={x} y="7" width="3" height="5" fill={on ? C.magenta : '#141b34'} opacity="0.85" />
      ))}
    </>
  ),
  // 10 x 15 — cartel sobre poste.
  publicidad: ({ on }) => (
    <>
      <rect x="4" y="9" width="2" height="6" fill="#141b34" />
      <rect x="0" y="0" width="10" height="9" fill={on ? C.magenta : '#1a2245'} opacity={on ? 0.9 : 1} />
      <rect x="0" y="0" width="10" height="1" fill={on ? C.violeta : C.borde} />
      <rect x="2" y="3" width="6" height="2" fill={on ? '#ffffff' : '#2f3a5e'} />
      <rect x="2" y="6" width="4" height="1" fill={on ? '#ffffff' : '#2f3a5e'} opacity="0.85" />
    </>
  ),
  // 16 x 12 — cuatro franjas de color, tamaño botón.
  'paleta-colores': () => (
    <>
      <rect x="0" y="0" width="16" height="12" fill="#0b1224" />
      <rect x="0" y="0" width="16" height="1" fill={C.borde} />
      {[[1, C.rojo], [5, C.ambar], [9, C.cian], [13, C.violeta]].map(([x, f]) => (
        <rect key={x} x={x} y="3" width="3" height="7" fill={f} />
      ))}
    </>
  ),
  // 23 x 14 — media ciudad encendida de golpe, con la línea de sobrecarga.
  'toda-red': () => (
    <>
      {[0, 6, 12, 18].map((x) =>
        [0, 7].map((y) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width="5" height="6" fill="#22406b" />
            <rect x={x} y={y} width="5" height="1" fill={C.ambar} />
            <rect x={x + 1} y={y + 2} width="2" height="2" fill={C.ambar} />
          </g>
        )),
      )}
      <rect x="0" y="13" width="23" height="1" fill={C.rojo} />
    </>
  ),
};

// --- ESCENAS --------------------------------------------------------------

// Escena de "objeto": fondo liso y una sola pieza grande centrada. La usan las
// tarjetas de opción, donde importa reconocer QUÉ es, no dónde pasa.
// `ancho`/`alto` son constantes conocidas del dibujo (van comentadas en cada
// pieza), así el centrado no depende de medir nada en tiempo de ejecución.
function objeto(id, { props = {}, s = 2, ancho, alto } = {}) {
  return {
    fondo: 'plano',
    piezas: [{ id, x: 32 - (ancho * s) / 2, y: 24 - (alto * s) / 2, s, props }],
  };
}

const ESCENAS = {
  // --- Introducción ---
  'feria-tranquila': {
    fondo: 'feria',
    piezas: [
      { id: 'terminal', x: 3, y: 22, s: 1.2 },
      { id: 'estudiantes', x: 17, y: 24, s: 1.5 },
      { id: 'pantalla-grande', x: 42, y: 12, s: 1 },
    ],
  },
  'protocolo-cero': {
    fondo: 'ciudad-ataque',
    piezas: [
      { id: 'pantalla-grande', x: 2, y: 12, s: 1.1 },
      { id: 'simbolo-cero', x: 26, y: 13, s: 1.6 },
      { id: 'terminal-glitch', x: 52, y: 22, s: 1.3 },
    ],
    efecto: 'glitch',
  },
  'servicios-caen': {
    fondo: 'ciudad-ataque',
    piezas: [
      { id: 'hospital', x: 2, y: 18, s: 1.2, props: { on: false } },
      { id: 'semaforo', x: 24, y: 20, s: 1.2, props: { on: false } },
      { id: 'nia-holo', x: 42, y: 14, s: 1.7 },
    ],
    efecto: 'alerta',
  },

  // --- Descubrir ---
  'terminal-sola': {
    fondo: 'interior',
    piezas: [
      { id: 'terminal', x: 24, y: 13, s: 2.2 },
      { id: 'camara', x: 48, y: 5, s: 1.2 },
    ],
    efecto: 'foco',
  },
  'pistas-nia': {
    fondo: 'interior',
    piezas: [
      { id: 'registro-lista', x: 4, y: 13, s: 1.4 },
      { id: 'nia-holo', x: 44, y: 12, s: 1.7 },
    ],
  },

  // --- Diseñar ---
  'control-saturado': {
    fondo: 'interior',
    piezas: [
      { id: 'panel-saturado', x: 3, y: 11, s: 1.5 },
      { id: 'operadora', x: 46, y: 20, s: 1.6 },
    ],
    efecto: 'alerta',
  },
  'control-limpio': {
    fondo: 'interior',
    piezas: [
      { id: 'panel-limpio', x: 3, y: 11, s: 1.5 },
      { id: 'operadora', x: 46, y: 20, s: 1.6 },
    ],
    efecto: 'calma',
  },

  // --- Construir ---
  'hospital-sin-senal': {
    fondo: 'ciudad-ataque',
    piezas: [
      { id: 'hospital', x: 5, y: 13, s: 1.7, props: { on: false } },
      { id: 'cables-danados', x: 36, y: 16, s: 1.4 },
      { id: 'antena', x: 46, y: 20, s: 1.4, props: { on: false } },
    ],
    efecto: 'glitch',
  },
  'jugador-terminal': {
    fondo: 'interior',
    piezas: [
      { id: 'jugador', x: 9, y: 17, s: 1.8 },
      { id: 'codigo-flotante', x: 26, y: 14, s: 1.6 },
    ],
    efecto: 'foco',
  },
  'hospital-encendido': {
    fondo: 'ciudad-parcial',
    piezas: [
      { id: 'hospital', x: 8, y: 13, s: 1.7, props: { on: true } },
      { id: 'antena', x: 44, y: 19, s: 1.5, props: { on: true } },
    ],
    efecto: 'calma',
  },

  // --- Probar ---
  'nodos-transmitiendo': {
    fondo: 'interior',
    piezas: [
      { id: 'nodo', x: 5, y: 9, s: 1.4, props: { on: true } },
      { id: 'nodo', x: 23, y: 9, s: 1.4, props: { on: true } },
      { id: 'nodo', x: 41, y: 9, s: 1.4, props: { on: true, malo: true } },
      { id: 'nodo', x: 5, y: 27, s: 1.4, props: { on: true } },
      { id: 'nodo', x: 23, y: 27, s: 1.4, props: { on: true } },
      { id: 'nodo', x: 41, y: 27, s: 1.4, props: { on: true } },
    ],
    efecto: 'glitch',
  },
  'amenaza-sigue': {
    fondo: 'interior',
    piezas: [
      { id: 'nia-alerta', x: 7, y: 12, s: 1.8 },
      { id: 'nodo', x: 38, y: 14, s: 2, props: { on: true, malo: true } },
    ],
    efecto: 'alerta',
  },
  'barreras-cerradas': {
    fondo: 'interior',
    piezas: [
      { id: 'barrera', x: 15, y: 14, s: 1.4 },
      { id: 'nodo', x: 27, y: 16, s: 1.6, props: { on: false, malo: true } },
      { id: 'barrera', x: 45, y: 14, s: 1.4 },
    ],
    efecto: 'calma',
  },

  // --- Desplegar ---
  'servicios-esperando': {
    fondo: 'ciudad-parcial',
    piezas: [
      { id: 'hospital', x: 2, y: 19, s: 1.1, props: { on: false } },
      { id: 'semaforo', x: 22, y: 21, s: 1.1, props: { on: false } },
      { id: 'centro-comercial', x: 32, y: 21, s: 1.1, props: { on: false } },
      { id: 'publicidad', x: 52, y: 21, s: 1.1, props: { on: false } },
    ],
  },
  'hospital-primero': {
    fondo: 'ciudad-parcial',
    piezas: [
      { id: 'hospital', x: 2, y: 16, s: 1.3, props: { on: true } },
      { id: 'semaforo', x: 26, y: 21, s: 1.1, props: { on: true } },
      { id: 'centro-comercial', x: 36, y: 21, s: 1.1, props: { on: false } },
      { id: 'publicidad', x: 54, y: 21, s: 1.1, props: { on: false } },
    ],
    efecto: 'calma',
  },
  'programa-antiguo': {
    fondo: 'interior',
    piezas: [
      { id: 'servidor-rack', x: 5, y: 15, s: 1.5 },
      { id: 'simbolo-cero', x: 24, y: 13, s: 1.6 },
      { id: 'nia-holo', x: 48, y: 14, s: 1.6 },
    ],
    efecto: 'glitch',
  },
  reescribiendo: {
    fondo: 'interior',
    piezas: [
      { id: 'jugador', x: 9, y: 17, s: 1.8 },
      { id: 'codigo-flotante', x: 26, y: 12, s: 1.7 },
      { id: 'simbolo-cero', x: 50, y: 26, s: 0.9 },
    ],
    efecto: 'foco',
  },

  // --- Epílogo ---
  'ciudad-recuperada': {
    fondo: 'ciudad-plena',
    piezas: [
      { id: 'hospital', x: 3, y: 20, s: 1.1, props: { on: true } },
      { id: 'semaforo', x: 22, y: 22, s: 1.1, props: { on: true } },
      { id: 'antena', x: 32, y: 21, s: 1.1, props: { on: true } },
      { id: 'centro-comercial', x: 45, y: 22, s: 1, props: { on: true } },
    ],
    efecto: 'calma',
  },
  'nia-y-jugador': {
    fondo: 'ciudad-plena',
    piezas: [
      { id: 'jugador', x: 17, y: 15, s: 2 },
      { id: 'nia-holo', x: 37, y: 12, s: 2 },
    ],
    efecto: 'calma',
  },

  // --- Apoyo para decisiones ---
  'opciones-servicios': {
    fondo: 'ciudad-parcial',
    piezas: [
      { id: 'hospital', x: 2, y: 19, s: 1.1, props: { on: false } },
      { id: 'publicidad', x: 22, y: 21, s: 1.1, props: { on: false } },
      { id: 'centro-comercial', x: 34, y: 21, s: 1.1, props: { on: false } },
      { id: 'antena', x: 54, y: 21, s: 1.2, props: { on: false } },
    ],
  },
  'opciones-pistas': {
    fondo: 'interior',
    piezas: [
      { id: 'registro-lista', x: 2, y: 15, s: 1.2 },
      { id: 'camara', x: 26, y: 19, s: 1.4 },
      { id: 'publicidad', x: 46, y: 17, s: 1.1, props: { on: true } },
    ],
  },

  // --- Tarjetas de opción ---
  'op-registro': objeto('registro-lista', { s: 2.4, ancho: 18, alto: 14 }),
  'op-camara': objeto('camara', { s: 3.4, ancho: 12, alto: 10 }),
  'op-publicidad': objeto('publicidad', { props: { on: true }, s: 2.6, ancho: 10, alto: 15 }),
  'op-colores': objeto('paleta-colores', { s: 2.6, ancho: 16, alto: 12 }),
  'op-alerta-completa': objeto('panel-limpio', { s: 2, ancho: 22, alto: 15 }),
  'op-alerta-color': objeto('alerta-solo-color', { s: 2, ancho: 22, alto: 15 }),
  'op-alerta-brillos': objeto('alerta-brillos', { s: 2, ancho: 22, alto: 15 }),
  'op-hospital': objeto('hospital', { props: { on: true }, s: 2.6, ancho: 14, alto: 16 }),
  'op-comercial': objeto('centro-comercial', { props: { on: true }, s: 2.5, ancho: 16, alto: 15 }),
  'op-toda-red': objeto('toda-red', { s: 1.9, ancho: 23, alto: 14 }),
};

// --- Render ---------------------------------------------------------------

export default function EscenaPixel({ escena, avatar, className = '' }) {
  const def = ESCENAS[escena];
  if (!def) return null;
  const Fondo = FONDOS[def.fondo] ?? FONDOS.interior;
  const idFoco = `foco-${escena}`;

  return (
    <div className={`esc esc-${def.efecto ?? 'normal'} ${className}`.trim()}>
      <svg
        viewBox="0 0 64 48"
        shapeRendering="crispEdges"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        {def.efecto === 'foco' ? (
          <defs>
            <radialGradient id={idFoco} cx="50%" cy="48%" r="62%">
              <stop offset="52%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
            </radialGradient>
          </defs>
        ) : null}

        <Fondo />

        {def.piezas.map((p, i) => {
          // El jugador no es una pieza fija: se dibuja con los colores que el
          // estudiante eligió, así el personaje de la historieta es el suyo.
          if (p.id === 'jugador') {
            const { rostro, color } = normalizarAvatar(avatar);
            return (
              <g key={`${p.id}-${i}`} transform={`translate(${p.x},${p.y}) scale(${p.s ?? 1})`}>
                <Figura ropa={color.claro} piel={rostro.piel} pelo={rostro.pelo} />
              </g>
            );
          }
          const Pieza = PIEZAS[p.id];
          if (!Pieza) return null;
          return (
            <g key={`${p.id}-${i}`} transform={`translate(${p.x},${p.y}) scale(${p.s ?? 1})`}>
              <Pieza {...(p.props ?? {})} />
            </g>
          );
        })}

        {/* Efectos: capas encima del dibujo, controladas por CSS. */}
        {def.efecto === 'glitch' ? (
          <g className="esc-glitch">
            <rect x="0" y="10" width="64" height="2" />
            <rect x="0" y="24" width="64" height="1" />
            <rect x="0" y="34" width="64" height="1" />
          </g>
        ) : null}
        {def.efecto === 'alerta' ? (
          <rect className="esc-alerta" x="0" y="0" width="64" height="48" />
        ) : null}
        {def.efecto === 'foco' ? (
          <rect x="0" y="0" width="64" height="48" fill={`url(#${idFoco})`} />
        ) : null}
      </svg>
    </div>
  );
}
