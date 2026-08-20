import { normalizarAvatar } from './avatarOpciones';
import '../styles/escena-pixel.css';

// Escenas pixel art narrativas: las ilustraciones de la historieta y de las
// decisiones. Dibujos completos que cuentan algo, no iconos sobre la interfaz.
//
// --- Por qué la grilla es de 96x72 ----------------------------------------
// Pasó por dos versiones antes de esta, y las dos fallaban por lados opuestos:
//
//   120x100 -> el píxel medía 3.6px y los detalles de 1 unidad se volvían
//              ruido: no se distinguía qué era cada cosa.
//   64x48   -> el píxel creció, pero una persona entraba en 7x12 bloques y con
//              tan pocos cuadrados no alcanza para leer una figura.
//
// El problema nunca fue solo el tamaño del píxel: era que los objetos ocupaban
// una porción chica del lienzo y estaban dibujados con muy pocos bloques.
//
// 96x72 da ~4.5px por unidad (sigue siendo pixel art evidente) y, sobre todo,
// deja dibujar objetos GRANDES: una persona mide ahora 18x32 unidades, casi la
// mitad del alto del cuadro, con cabeza de 10x8, ojos de 2x2 y boca propia.
//
// Reglas al dibujar acá:
//   1. El objeto principal ocupa entre un tercio y la mitad del lienzo.
//   2. Como mucho tres objetos por escena. Si hay que agregar un cuarto, la
//      escena está contando demasiadas cosas.
//   3. Ningún rasgo que haya que reconocer (ojo, ventana, cruz) baja de 2x2.
//
// --- Cómo está armado ------------------------------------------------------
// Una escena = un FONDO + PIEZAS colocadas encima + un EFECTO opcional.
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
  metal: '#1e2749',
  metalClaro: '#2f3a5e',
  cian: '#4ad9ff',
  magenta: '#ff5c9d',
  violeta: '#9b8cff',
  verde: '#2fe6a6',
  rojo: '#ff5c6a',
  ambar: '#ffd166',
  blanco: '#eef2f9',
  piel: '#f0c8a0',
  pielSombra: '#d4a97f',
  pielB: '#c98d5e',
  pielBSombra: '#a86f45',
  pielC: '#8d5a3b',
  pielCSombra: '#6d4227',
};

const HORIZONTE = 52;

// --- FONDOS ---------------------------------------------------------------

function Skyline({ cieloColor, torreColor, luz, densidad }) {
  const torres = [
    { x: -2, w: 16, h: 22 },
    { x: 15, w: 12, h: 34 },
    { x: 28, w: 18, h: 16 },
    { x: 47, w: 14, h: 28 },
    { x: 62, w: 16, h: 20 },
    { x: 79, w: 12, h: 36 },
    { x: 92, w: 10, h: 24 },
  ];
  const ventanas = [];
  torres.forEach((t) => {
    for (let cx = 3; cx + 4 <= t.w - 3; cx += 7) {
      for (let cy = 5; cy + 4 <= t.h - 2; cy += 7) {
        const x = t.x + cx;
        const y = HORIZONTE - t.h + cy;
        // Encendido determinista por posición: nunca titila entre renders.
        ventanas.push({ x, y, on: (x * 5 + y * 9) % 10 < densidad * 10 });
      }
    }
  });
  return (
    <>
      <rect x="0" y="0" width="96" height="72" fill={cieloColor} />
      <rect x="11" y="6" width="2" height="2" fill="#7d8fbe" />
      <rect x="41" y="3" width="2" height="2" fill="#7d8fbe" />
      <rect x="76" y="9" width="2" height="2" fill="#7d8fbe" />
      {torres.map((t) => (
        <g key={t.x}>
          <rect x={t.x} y={HORIZONTE - t.h} width={t.w} height={t.h} fill={torreColor} />
          <rect x={t.x} y={HORIZONTE - t.h} width={t.w} height="2" fill={luz} opacity="0.3" />
          <rect x={t.x} y={HORIZONTE - t.h} width="2" height={t.h} fill="#ffffff" opacity="0.05" />
        </g>
      ))}
      {ventanas.map((v) => (
        <rect key={`${v.x}-${v.y}`} x={v.x} y={v.y} width="4" height="4" fill={v.on ? luz : C.linea} />
      ))}
      <rect x="0" y={HORIZONTE} width="96" height={72 - HORIZONTE} fill="#0a0f22" />
      <rect x="0" y={HORIZONTE} width="96" height="2" fill={luz} opacity="0.5" />
    </>
  );
}

const FONDOS = {
  'ciudad-calma': () => <Skyline cieloColor={C.cielo} torreColor={C.torre} luz={C.ambar} densidad={0.8} />,
  'ciudad-ataque': () => (
    <>
      <Skyline cieloColor={C.cieloAtaque} torreColor={C.torreAtaque} luz={C.rojo} densidad={0.25} />
      <rect x="0" y="0" width="96" height="72" fill={C.rojo} opacity="0.07" />
    </>
  ),
  'ciudad-parcial': () => <Skyline cieloColor={C.cielo} torreColor={C.torre} luz={C.ambar} densidad={0.5} />,
  'ciudad-plena': () => (
    <>
      <Skyline cieloColor={C.cieloAlba} torreColor={C.torre} luz={C.cian} densidad={1} />
      <rect x="0" y="0" width="96" height="72" fill={C.cian} opacity="0.06" />
    </>
  ),
  // Sala de control: pared con monitores y piso reflejante.
  interior: () => (
    <>
      <rect x="0" y="0" width="96" height="72" fill="#151d3d" />
      <rect x="0" y="0" width="96" height="46" fill="#101736" />
      {[5, 27, 49, 71].map((x) => (
        <g key={x}>
          <rect x={x} y="4" width="16" height="10" fill="#0c1230" />
          <rect x={x} y="4" width="16" height="2" fill={C.borde} opacity="0.6" />
        </g>
      ))}
      <rect x="0" y="54" width="96" height="18" fill="#0c1230" />
      <rect x="0" y="54" width="96" height="2" fill={C.cian} opacity="0.35" />
      {[8, 38, 68].map((x) => (
        <rect key={x} x={x} y="60" width="14" height="2" fill={C.cian} opacity="0.12" />
      ))}
    </>
  ),
  // Fondo liso para tarjetas de opción: la pieza de encima manda.
  plano: () => (
    <>
      <rect x="0" y="0" width="96" height="72" fill="#101736" />
      {[12, 30, 48, 66].map((y) => (
        <rect key={y} x="0" y={y} width="96" height="2" fill={C.borde} opacity="0.14" />
      ))}
    </>
  ),
  // Explanada de la feria: carpas, guirnalda y ciudad al fondo.
  feria: () => (
    <>
      <rect x="0" y="0" width="96" height="72" fill={C.cielo} />
      {[[-2, 28, 12, 18], [11, 22, 10, 24], [80, 26, 10, 20], [90, 32, 8, 14]].map(([x, y, w, h]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={w} height={h} fill={C.torreOscura} />
          <rect x={x + 2} y={y + 4} width="4" height="4" fill={C.ambar} />
        </g>
      ))}
      <rect x="0" y="46" width="96" height="26" fill="#1a2348" />
      <rect x="0" y="46" width="96" height="2" fill={C.borde} />
      <rect x="6" y="11" width="84" height="2" fill={C.borde} opacity="0.6" />
      {[10, 26, 42, 58, 74, 86].map((x, i) => (
        <rect key={x} x={x} y="13" width="4" height="4" fill={i % 2 ? C.magenta : C.cian} />
      ))}
    </>
  ),
};

// --- PIEZAS ---------------------------------------------------------------
// Cada pieza se dibuja desde (0,0) hacia abajo-derecha. El tamaño va comentado
// porque las escenas y el centrado de tarjetas lo usan.

// Persona: 18 de ancho (con brazos) x 32 de alto. Casi la mitad del alto del
// lienzo, que es lo que hace que se lea como una persona y no como un bloque.
// Cabeza 10x8, ojos de 2x2 con brillo, boca propia, manos y zapatos aparte.
function Figura({ ropa, ropaOscura, piel, pielSombra, pelo, brazoAlzado = false }) {
  return (
    <>
      {/* Pelo y cabeza */}
      <rect x="3" y="0" width="10" height="4" fill={pelo} />
      <rect x="2" y="2" width="2" height="7" fill={pelo} />
      <rect x="12" y="2" width="2" height="7" fill={pelo} />
      <rect x="3" y="4" width="10" height="9" fill={piel} />
      <rect x="11" y="4" width="2" height="9" fill={pielSombra} />
      {/* Ojos: 2x2 con un punto de brillo de 1x1 */}
      <rect x="5" y="7" width="2" height="2" fill={C.linea} />
      <rect x="9" y="7" width="2" height="2" fill={C.linea} />
      <rect x="5" y="7" width="1" height="1" fill={C.blanco} opacity="0.75" />
      <rect x="9" y="7" width="1" height="1" fill={C.blanco} opacity="0.75" />
      {/* Boca */}
      <rect x="6" y="11" width="4" height="1" fill={pielSombra} />
      {/* Cuello */}
      <rect x="6" y="13" width="4" height="2" fill={pielSombra} />
      {/* Torso */}
      <rect x="1" y="15" width="14" height="11" fill={ropa} />
      <rect x="1" y="15" width="14" height="2" fill={C.blanco} opacity="0.18" />
      <rect x="1" y="15" width="14" height="11" fill="none" />
      <rect x="11" y="17" width="4" height="9" fill={ropaOscura} />
      {/* Cuello de la ropa, en V */}
      <rect x="6" y="15" width="4" height="2" fill={pielSombra} />
      <rect x="7" y="17" width="2" height="1" fill={pielSombra} />
      {/* Brazos y manos */}
      <rect x="-2" y={brazoAlzado ? 11 : 16} width="3" height={brazoAlzado ? 8 : 8} fill={ropa} />
      <rect x="-2" y={brazoAlzado ? 19 : 24} width="3" height="3" fill={piel} />
      <rect x="15" y="16" width="3" height="8" fill={ropaOscura} />
      <rect x="15" y="24" width="3" height="3" fill={piel} />
      {/* Piernas */}
      <rect x="2" y="26" width="5" height="8" fill="#2b2440" />
      <rect x="9" y="26" width="5" height="8" fill="#241d38" />
      {/* Zapatos */}
      <rect x="1" y="34" width="6" height="3" fill="#15112a" />
      <rect x="9" y="34" width="6" height="3" fill="#15112a" />
    </>
  );
}

// 26 x 40 — proyector, cono de luz y núcleo con "ojo" ancho. Los corchetes de
// las esquinas son lo que lo hace leer como interfaz y no como una caja.
function NucleoNIA({ color }) {
  return (
    <>
      <rect x="7" y="37" width="12" height="3" fill={C.metal} />
      <rect x="9" y="35" width="8" height="2" fill={C.metalClaro} />
      <path d="M9 35 L2 6 L24 6 L17 35 Z" fill={color} opacity="0.12" />
      <rect x="4" y="6" width="18" height="26" fill={color} opacity="0.18" />
      <rect x="4" y="6" width="18" height="3" fill={color} />
      <rect x="4" y="29" width="18" height="3" fill={color} />
      <rect x="4" y="6" width="3" height="26" fill={color} opacity="0.55" />
      <rect x="19" y="6" width="3" height="26" fill={color} opacity="0.55" />
      <rect x="8" y="15" width="10" height="5" fill={color} />
      <rect x="8" y="22" width="6" height="2" fill={color} opacity="0.7" />
      {/* Corchetes */}
      <rect x="0" y="2" width="8" height="2" fill={color} />
      <rect x="0" y="2" width="2" height="8" fill={color} />
      <rect x="18" y="2" width="8" height="2" fill={color} />
      <rect x="24" y="2" width="2" height="8" fill={color} />
    </>
  );
}

// 26 x 34 — marco, pantalla con líneas de texto, pie y base.
function Terminal({ roto = false }) {
  const luz = roto ? C.rojo : C.cian;
  return (
    <>
      <rect x="0" y="0" width="26" height="22" fill={C.metal} />
      <rect x="0" y="0" width="26" height="2" fill={C.borde} />
      <rect x="0" y="0" width="2" height="22" fill={C.borde} opacity="0.7" />
      <rect x="3" y="3" width="20" height="15" fill="#050a18" />
      <rect x="3" y="3" width="20" height="15" fill={luz} opacity={roto ? 0.28 : 0.4} />
      <rect x="5" y="5" width="10" height="2" fill={luz} />
      <rect x="5" y="9" width="14" height="2" fill={luz} opacity="0.8" />
      <rect x="5" y="13" width="8" height="2" fill={roto ? C.magenta : luz} opacity="0.9" />
      {roto ? <rect x="3" y="10" width="20" height="2" fill={C.magenta} /> : null}
      <rect x="10" y="22" width="6" height="7" fill={C.metalClaro} />
      <rect x="4" y="29" width="18" height="4" fill={C.metal} />
      <rect x="4" y="29" width="18" height="2" fill={C.borde} opacity="0.6" />
    </>
  );
}

// Paletas de piel emparejadas con su sombra, para que las figuras tengan
// volumen sin salirse de la paleta.
const PIELES = {
  a: { piel: C.piel, sombra: C.pielSombra, pelo: '#2b2036' },
  b: { piel: C.pielB, sombra: C.pielBSombra, pelo: '#3a2418' },
  c: { piel: C.pielC, sombra: C.pielCSombra, pelo: '#171029' },
};

function Persona({ tono = 'a', ropa, ropaOscura, brazoAlzado }) {
  const t = PIELES[tono] ?? PIELES.a;
  return (
    <Figura
      ropa={ropa}
      ropaOscura={ropaOscura}
      piel={t.piel}
      pielSombra={t.sombra}
      pelo={t.pelo}
      brazoAlzado={brazoAlzado}
    />
  );
}

// 22 x 30 — marco compartido por los tres paneles de alerta.
function PanelAlerta({ filas }) {
  return (
    <>
      <rect x="0" y="0" width="44" height="30" fill="#080e1e" />
      <rect x="0" y="0" width="44" height="3" fill={C.borde} />
      <rect x="0" y="27" width="44" height="3" fill={C.borde} opacity="0.5" />
      {filas}
    </>
  );
}

const PIEZAS = {
  // 52 x 37 — tres personas de tamaño completo.
  estudiantes: () => (
    <>
      <g transform="translate(2,0)"><Persona tono="a" ropa={C.cian} ropaOscura="#2a8fb0" brazoAlzado /></g>
      <g transform="translate(20,2)"><Persona tono="b" ropa={C.magenta} ropaOscura="#b53c6e" /></g>
      <g transform="translate(38,0)"><Persona tono="c" ropa={C.violeta} ropaOscura="#6d61b8" /></g>
    </>
  ),
  // 26 x 37 — persona con signo de duda de bloques grandes.
  operadora: () => (
    <>
      <g transform="translate(2,0)"><Persona tono="b" ropa="#3f52a0" ropaOscura="#2c3a75" brazoAlzado /></g>
      <rect x="20" y="0" width="4" height="8" fill={C.ambar} />
      <rect x="20" y="10" width="4" height="4" fill={C.ambar} />
    </>
  ),
  'nia-holo': () => <NucleoNIA color={C.cian} />,
  'nia-alerta': () => <NucleoNIA color={C.rojo} />,
  terminal: () => <Terminal />,
  'terminal-glitch': () => <Terminal roto />,
  // 44 x 34 — monitor de pared con marco grueso y pie.
  'pantalla-grande': () => (
    <>
      <rect x="0" y="0" width="44" height="28" fill={C.metal} />
      <rect x="3" y="3" width="38" height="22" fill="#080e1e" />
      <rect x="0" y="0" width="44" height="3" fill={C.borde} />
      <rect x="0" y="25" width="44" height="3" fill={C.borde} opacity="0.7" />
      <rect x="0" y="0" width="3" height="28" fill={C.borde} opacity="0.7" />
      <rect x="41" y="0" width="3" height="28" fill={C.borde} opacity="0.7" />
      <rect x="19" y="28" width="6" height="4" fill={C.metalClaro} />
      <rect x="13" y="32" width="18" height="2" fill={C.metal} />
    </>
  ),
  // 30 x 30 — anillo roto con una diagonal. Trazo de 4 unidades: se lee como
  // un sello incluso de lejos.
  'simbolo-cero': () => (
    <>
      <rect x="9" y="0" width="12" height="4" fill={C.rojo} />
      <rect x="4" y="4" width="5" height="4" fill={C.rojo} />
      <rect x="21" y="4" width="5" height="4" fill={C.rojo} />
      <rect x="0" y="8" width="4" height="14" fill={C.rojo} />
      <rect x="26" y="8" width="4" height="14" fill={C.rojo} />
      <rect x="4" y="22" width="5" height="4" fill={C.rojo} />
      <rect x="21" y="22" width="5" height="4" fill={C.rojo} />
      <rect x="9" y="26" width="12" height="4" fill={C.rojo} />
      {/* Diagonal que lo tacha */}
      <rect x="7" y="6" width="4" height="4" fill={C.magenta} />
      <rect x="11" y="10" width="4" height="4" fill={C.magenta} />
      <rect x="15" y="14" width="4" height="4" fill={C.magenta} />
      <rect x="19" y="18" width="4" height="4" fill={C.magenta} />
    </>
  ),
  // 32 x 40 — edificio con letrero, cruz de 8 unidades de grosor, ventanas de
  // 5x5 y puerta. La cruz es lo primero que se reconoce.
  hospital: ({ on }) => {
    const muro = on ? '#22406b' : '#1a2245';
    const luz = on ? C.ambar : '#141b34';
    const cruz = on ? C.blanco : '#3c476b';
    return (
      <>
        <rect x="9" y="0" width="14" height="9" fill={on ? C.cian : '#2a3358'} />
        <rect x="11" y="2" width="3" height="5" fill={on ? C.linea : '#1a2245'} />
        <rect x="18" y="2" width="3" height="5" fill={on ? C.linea : '#1a2245'} />
        <rect x="0" y="9" width="32" height="31" fill={muro} />
        <rect x="0" y="9" width="32" height="3" fill={on ? C.cian : C.borde} />
        <rect x="0" y="9" width="3" height="31" fill="#ffffff" opacity="0.06" />
        {/* Cruz */}
        <rect x="12" y="15" width="8" height="20" fill={cruz} />
        <rect x="6" y="21" width="20" height="8" fill={cruz} />
        {/* Ventanas */}
        <rect x="2" y="15" width="5" height="5" fill={luz} />
        <rect x="25" y="15" width="5" height="5" fill={luz} />
        <rect x="2" y="30" width="5" height="5" fill={luz} />
        <rect x="25" y="30" width="5" height="5" fill={luz} />
        {/* Puerta */}
        <rect x="13" y="35" width="6" height="5" fill={on ? '#0e2338' : '#12182e'} />
      </>
    );
  },
  // 16 x 40 — caja con tres luces de 8x8 y poste. A este tamaño la luz
  // encendida se ve sin esfuerzo.
  semaforo: ({ on }) => (
    <>
      <rect x="0" y="0" width="16" height="28" fill="#1a2245" />
      <rect x="0" y="0" width="16" height="2" fill={C.borde} />
      <rect x="0" y="0" width="2" height="28" fill="#ffffff" opacity="0.07" />
      <rect x="4" y="2" width="8" height="7" fill={on ? '#3a1c22' : C.rojo} />
      <rect x="4" y="10" width="8" height="7" fill="#33301c" />
      <rect x="4" y="18" width="8" height="7" fill={on ? C.verde : '#16281f'} />
      <rect x="6" y="28" width="4" height="12" fill="#141b34" />
      <rect x="3" y="38" width="10" height="2" fill="#101736" />
    </>
  ),
  // 24 x 40 — plato, mástil, base y ondas de 3 unidades.
  antena: ({ on }) => (
    <>
      <rect x="10" y="10" width="4" height="26" fill={C.metal} />
      <rect x="4" y="36" width="16" height="4" fill="#141b34" />
      <rect x="7" y="3" width="10" height="7" fill={on ? C.cian : '#2a3358'} />
      <rect x="9" y="5" width="6" height="3" fill={on ? C.linea : '#1a2245'} />
      {on ? (
        <>
          <rect x="2" y="0" width="3" height="8" fill={C.cian} opacity="0.85" />
          <rect x="19" y="0" width="3" height="8" fill={C.cian} opacity="0.85" />
          <rect x="0" y="2" width="2" height="4" fill={C.cian} opacity="0.5" />
          <rect x="22" y="2" width="2" height="4" fill={C.cian} opacity="0.5" />
        </>
      ) : null}
    </>
  ),
  // 44 x 30 — pared de avisos amontonados: el ruido ES el mensaje.
  'panel-saturado': () => (
    <PanelAlerta
      filas={[
        [2, 5, 14, C.rojo], [18, 5, 10, C.ambar], [30, 5, 12, C.magenta],
        [2, 10, 20, C.violeta], [24, 10, 8, C.rojo], [34, 10, 8, C.cian],
        [2, 15, 8, C.ambar], [12, 15, 16, C.rojo], [30, 15, 12, C.violeta],
        [2, 20, 18, C.magenta], [22, 20, 10, C.ambar], [34, 20, 8, C.rojo],
      ].map(([x, y, w, f]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height="4" fill={f} opacity="0.85" />
      ))}
    />
  ),
  // 44 x 30 — tres avisos: cuadro de color con icono + barra de texto.
  'panel-limpio': () => (
    <PanelAlerta
      filas={[[5, C.rojo], [12, C.ambar], [19, C.verde]].map(([y, f]) => (
        <g key={y}>
          <rect x="3" y={y} width="6" height="6" fill={f} />
          <rect x="5" y={y + 2} width="2" height="2" fill="#080e1e" />
          <rect x="12" y={y + 1} width="20" height="4" fill={f} opacity="0.9" />
          <rect x="34" y={y + 1} width="7" height="4" fill="#4a5578" />
        </g>
      ))}
    />
  ),
  // 44 x 30 — solo barras de color, sin icono ni etiqueta.
  'alerta-solo-color': () => (
    <PanelAlerta
      filas={[[6, C.rojo], [13, C.ambar], [20, C.verde]].map(([y, f]) => (
        <rect key={y} x="4" y={y} width="36" height="5" fill={f} />
      ))}
    />
  ),
  // 44 x 30 — manchas luminosas sin forma reconocible.
  'alerta-brillos': () => (
    <PanelAlerta
      filas={[[6, 6, C.magenta], [24, 5, C.cian], [14, 17, C.violeta], [32, 16, C.magenta]].map(([x, y, f]) => (
        <g key={`${x}-${y}`}>
          <rect x={x - 2} y={y - 2} width="12" height="12" fill={f} opacity="0.2" />
          <rect x={x} y={y} width="8" height="8" fill={f} opacity="0.9" />
        </g>
      ))}
    />
  ),
  // 36 x 30 — lista con una fila enmarcada: la sospechosa.
  'registro-lista': () => (
    <>
      <rect x="0" y="0" width="36" height="30" fill="#080e1e" />
      <rect x="0" y="0" width="36" height="3" fill={C.borde} />
      {[5, 11, 17, 23].map((y, i) => (
        <g key={y}>
          <rect x="3" y={y} width="4" height="4" fill={i === 1 ? C.magenta : '#3c476b'} />
          <rect x="10" y={y} width={i === 1 ? 22 : 16} height="4" fill={i === 1 ? C.magenta : '#2f3a5e'} />
        </g>
      ))}
      {/* Marco de la fila sospechosa: forma, no solo color */}
      <rect x="1" y="9" width="34" height="2" fill={C.magenta} />
      <rect x="1" y="17" width="34" height="2" fill={C.magenta} />
      <rect x="1" y="9" width="2" height="10" fill={C.magenta} />
      <rect x="33" y="9" width="2" height="10" fill={C.magenta} />
    </>
  ),
  // 26 x 24 — cuerpo, lente grande, soporte y luz de grabación.
  camara: () => (
    <>
      <rect x="9" y="0" width="4" height="7" fill="#141b34" />
      <rect x="5" y="0" width="12" height="3" fill={C.borde} />
      <rect x="0" y="7" width="22" height="13" fill={C.metal} />
      <rect x="0" y="7" width="22" height="2" fill={C.borde} opacity="0.7" />
      <rect x="22" y="10" width="4" height="7" fill={C.metalClaro} />
      <rect x="3" y="10" width="7" height="7" fill={C.cian} />
      <rect x="5" y="12" width="3" height="3" fill="#0a1a2c" />
      <rect x="3" y="21" width="4" height="3" fill={C.rojo} />
    </>
  ),
  // 22 x 22 — marco de 3 unidades, núcleo de 8x8 y conectores.
  nodo: ({ on, malo }) => {
    const c = malo ? C.rojo : on ? C.cian : '#2f3a5e';
    return (
      <>
        <rect x="3" y="0" width="16" height="22" fill={malo ? '#33131f' : '#141b34'} />
        <rect x="3" y="0" width="16" height="3" fill={c} />
        <rect x="3" y="19" width="16" height="3" fill={c} />
        <rect x="3" y="0" width="3" height="22" fill={c} />
        <rect x="16" y="0" width="3" height="22" fill={c} />
        <rect x="7" y="7" width="8" height="8" fill={c} />
        <rect x="0" y="8" width="3" height="6" fill={c} opacity="0.6" />
        <rect x="19" y="8" width="3" height="6" fill={c} opacity="0.6" />
        {malo ? (
          <>
            <rect x="0" y="3" width="2" height="3" fill={C.rojo} />
            <rect x="20" y="16" width="2" height="3" fill={C.magenta} />
            <rect x="7" y="4" width="8" height="2" fill={C.magenta} opacity="0.8" />
          </>
        ) : null}
      </>
    );
  },
  // 12 x 30 — muro con remaches.
  barrera: () => (
    <>
      <rect x="0" y="0" width="7" height="30" fill={C.verde} />
      <rect x="0" y="0" width="7" height="3" fill="#ffffff" opacity="0.4" />
      <rect x="0" y="0" width="2" height="30" fill="#ffffff" opacity="0.2" />
      {[5, 13, 21].map((y) => (
        <rect key={y} x="7" y={y} width="5" height="4" fill={C.verde} opacity="0.7" />
      ))}
    </>
  ),
  // 34 x 26 — dos cables cortados, con la rotura en rojo bien visible.
  'cables-danados': () => (
    <>
      <rect x="0" y="4" width="13" height="5" fill={C.cian} opacity="0.85" />
      <rect x="20" y="4" width="14" height="5" fill={C.metalClaro} />
      <rect x="13" y="2" width="5" height="4" fill={C.rojo} />
      <rect x="15" y="7" width="4" height="4" fill={C.rojo} />
      <rect x="0" y="17" width="9" height="5" fill={C.metalClaro} />
      <rect x="16" y="17" width="18" height="5" fill={C.metalClaro} />
      <rect x="9" y="15" width="5" height="4" fill={C.rojo} />
      <rect x="12" y="20" width="4" height="4" fill={C.rojo} />
    </>
  ),
  // 42 x 26 — bloque de código con líneas de distinto largo.
  'codigo-flotante': () => (
    <>
      <rect x="0" y="0" width="42" height="26" fill="#050a18" />
      <rect x="0" y="0" width="42" height="3" fill={C.cian} opacity="0.7" />
      {[[5, 14, C.cian], [10, 26, C.verde], [15, 18, C.cian], [20, 10, C.violeta]].map(([y, w, f]) => (
        <rect key={y} x="4" y={y} width={w} height="3" fill={f} opacity="0.9" />
      ))}
      <rect x="34" y="20" width="4" height="3" fill={C.magenta} />
    </>
  ),
  // 22 x 34 — rack con bandejas y luces.
  'servidor-rack': () => (
    <>
      <rect x="0" y="0" width="22" height="34" fill="#161e3d" />
      <rect x="0" y="0" width="22" height="3" fill={C.borde} />
      <rect x="0" y="0" width="2" height="34" fill="#ffffff" opacity="0.07" />
      {[5, 13, 21, 28].map((y) => (
        <g key={y}>
          <rect x="3" y={y} width="16" height="6" fill="#0a1028" />
          <rect x="15" y={y + 2} width="3" height="2" fill={C.verde} />
          <rect x="5" y={y + 2} width="7" height="2" fill={C.metalClaro} />
        </g>
      ))}
    </>
  ),
  // 34 x 34 — galería con marquesina y vitrinas.
  'centro-comercial': ({ on }) => (
    <>
      <rect x="4" y="0" width="26" height="8" fill={on ? C.violeta : '#2a3358'} />
      <rect x="8" y="2" width="18" height="4" fill={on ? '#f0eaff' : '#3c476b'} opacity="0.75" />
      <rect x="0" y="8" width="34" height="26" fill={on ? '#2d2551' : '#1a2245'} />
      <rect x="0" y="8" width="34" height="3" fill={on ? C.violeta : C.borde} />
      {[3, 14, 25].map((x) => (
        <g key={x}>
          <rect x={x} y="15" width="7" height="12" fill={on ? C.magenta : '#141b34'} opacity="0.85" />
          <rect x={x} y="15" width="7" height="3" fill={on ? '#ffd0e5' : '#1e2749'} />
        </g>
      ))}
    </>
  ),
  // 22 x 34 — cartel sobre poste, con dos líneas de "texto".
  publicidad: ({ on }) => (
    <>
      <rect x="9" y="20" width="4" height="14" fill="#141b34" />
      <rect x="6" y="32" width="10" height="2" fill="#101736" />
      <rect x="0" y="0" width="22" height="20" fill={on ? C.magenta : '#1a2245'} />
      <rect x="0" y="0" width="22" height="3" fill={on ? C.violeta : C.borde} />
      <rect x="4" y="6" width="14" height="4" fill={on ? C.blanco : '#2f3a5e'} />
      <rect x="4" y="13" width="9" height="3" fill={on ? C.blanco : '#2f3a5e'} opacity="0.85" />
    </>
  ),
  // 34 x 26 — cuatro franjas de color, tamaño de botón real.
  'paleta-colores': () => (
    <>
      <rect x="0" y="0" width="34" height="26" fill="#080e1e" />
      <rect x="0" y="0" width="34" height="3" fill={C.borde} />
      {[[3, C.rojo], [11, C.ambar], [19, C.cian], [27, C.violeta]].map(([x, f]) => (
        <g key={x}>
          <rect x={x} y="6" width="5" height="16" fill={f} />
          <rect x={x} y="6" width="5" height="3" fill="#ffffff" opacity="0.3" />
        </g>
      ))}
    </>
  ),
  // 46 x 30 — media ciudad encendida de golpe, con la línea de sobrecarga.
  'toda-red': () => (
    <>
      {[0, 12, 24, 36].map((x) =>
        [0, 14].map((y) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width="10" height="12" fill="#22406b" />
            <rect x={x} y={y} width="10" height="2" fill={C.ambar} />
            <rect x={x + 2} y={y + 4} width="3" height="3" fill={C.ambar} />
            <rect x={x + 6} y={y + 4} width="2" height="3" fill={C.ambar} opacity="0.7" />
          </g>
        )),
      )}
      <rect x="0" y="27" width="46" height="3" fill={C.rojo} />
    </>
  ),
};

// --- ESCENAS --------------------------------------------------------------

// Escena de "objeto": fondo liso y una sola pieza grande centrada. La usan las
// tarjetas de opción, donde importa reconocer QUÉ es, no dónde pasa.
// `ancho`/`alto` son constantes conocidas del dibujo (van comentadas en cada
// pieza), así el centrado no depende de medir nada en tiempo de ejecución.
function objeto(id, { props = {}, s = 1.4, ancho, alto } = {}) {
  return {
    fondo: 'plano',
    piezas: [{ id, x: 48 - (ancho * s) / 2, y: 36 - (alto * s) / 2, s, props }],
  };
}

const ESCENAS = {
  // --- Introducción ---
  'feria-tranquila': {
    fondo: 'feria',
    piezas: [
      { id: 'estudiantes', x: 6, y: 20, s: 1 },
      { id: 'terminal', x: 66, y: 23, s: 1 },
    ],
  },
  'protocolo-cero': {
    fondo: 'ciudad-ataque',
    piezas: [
      { id: 'pantalla-grande', x: 17, y: 4, s: 1.4 },
      { id: 'simbolo-cero', x: 32, y: 11, s: 1.1 },
    ],
    efecto: 'glitch',
  },
  'servicios-caen': {
    fondo: 'ciudad-ataque',
    piezas: [
      { id: 'hospital', x: 4, y: 13, s: 1, props: { on: false } },
      { id: 'nia-holo', x: 58, y: 10, s: 1.1 },
    ],
    efecto: 'alerta',
  },

  // --- Descubrir ---
  'terminal-sola': {
    fondo: 'interior',
    piezas: [
      { id: 'terminal', x: 27, y: 8, s: 1.6 },
      { id: 'camara', x: 68, y: 4, s: 0.9 },
    ],
    efecto: 'foco',
  },
  'pistas-nia': {
    fondo: 'interior',
    piezas: [
      { id: 'registro-lista', x: 3, y: 14, s: 1.5 },
      { id: 'nia-holo', x: 64, y: 16, s: 1 },
    ],
  },

  // --- Diseñar ---
  'control-saturado': {
    fondo: 'interior',
    piezas: [
      { id: 'panel-saturado', x: 2, y: 8, s: 1.4 },
      { id: 'operadora', x: 68, y: 22, s: 0.95 },
    ],
    efecto: 'alerta',
  },
  'control-limpio': {
    fondo: 'interior',
    piezas: [
      { id: 'panel-limpio', x: 2, y: 8, s: 1.4 },
      { id: 'operadora', x: 68, y: 22, s: 0.95 },
    ],
    efecto: 'calma',
  },

  // --- Construir ---
  'hospital-sin-senal': {
    fondo: 'ciudad-ataque',
    piezas: [
      { id: 'hospital', x: 5, y: 6, s: 1.25, props: { on: false } },
      { id: 'cables-danados', x: 50, y: 22, s: 1.3 },
    ],
    efecto: 'glitch',
  },
  'jugador-terminal': {
    fondo: 'interior',
    piezas: [
      { id: 'jugador', x: 12, y: 14, s: 1.2 },
      { id: 'codigo-flotante', x: 38, y: 18, s: 1.2 },
    ],
    efecto: 'foco',
  },
  'hospital-encendido': {
    fondo: 'ciudad-parcial',
    piezas: [
      { id: 'hospital', x: 8, y: 6, s: 1.25, props: { on: true } },
      { id: 'antena', x: 60, y: 16, s: 1, props: { on: true } },
    ],
    efecto: 'calma',
  },

  // --- Probar ---
  'nodos-transmitiendo': {
    fondo: 'interior',
    piezas: [
      { id: 'nodo', x: 6, y: 10, s: 1.1, props: { on: true } },
      { id: 'nodo', x: 36, y: 10, s: 1.1, props: { on: true } },
      { id: 'nodo', x: 66, y: 10, s: 1.1, props: { on: true, malo: true } },
      { id: 'nodo', x: 6, y: 40, s: 1.1, props: { on: true } },
      { id: 'nodo', x: 36, y: 40, s: 1.1, props: { on: true } },
      { id: 'nodo', x: 66, y: 40, s: 1.1, props: { on: true } },
    ],
    efecto: 'glitch',
  },
  'amenaza-sigue': {
    fondo: 'interior',
    piezas: [
      { id: 'nia-alerta', x: 8, y: 12, s: 1.2 },
      { id: 'nodo', x: 50, y: 16, s: 1.8, props: { on: true, malo: true } },
    ],
    efecto: 'alerta',
  },
  'barreras-cerradas': {
    fondo: 'interior',
    piezas: [
      { id: 'barrera', x: 12, y: 16, s: 1.3 },
      { id: 'nodo', x: 32, y: 18, s: 1.6, props: { on: false, malo: true } },
      { id: 'barrera', x: 70, y: 16, s: 1.3 },
    ],
    efecto: 'calma',
  },

  // --- Desplegar ---
  'servicios-esperando': {
    fondo: 'ciudad-parcial',
    piezas: [
      { id: 'hospital', x: 2, y: 18, s: 0.85, props: { on: false } },
      { id: 'semaforo', x: 32, y: 18, s: 0.85, props: { on: false } },
      { id: 'centro-comercial', x: 50, y: 23, s: 0.85, props: { on: false } },
      { id: 'publicidad', x: 76, y: 23, s: 0.85, props: { on: false } },
    ],
  },
  'hospital-primero': {
    fondo: 'ciudad-parcial',
    piezas: [
      { id: 'hospital', x: 2, y: 12, s: 1, props: { on: true } },
      { id: 'semaforo', x: 38, y: 18, s: 0.85, props: { on: true } },
      { id: 'centro-comercial', x: 54, y: 24, s: 0.8, props: { on: false } },
      { id: 'publicidad', x: 78, y: 24, s: 0.8, props: { on: false } },
    ],
    efecto: 'calma',
  },
  'programa-antiguo': {
    fondo: 'interior',
    piezas: [
      { id: 'servidor-rack', x: 4, y: 11, s: 1.2 },
      { id: 'simbolo-cero', x: 33, y: 14, s: 1.2 },
      { id: 'nia-holo', x: 68, y: 12, s: 1 },
    ],
    efecto: 'glitch',
  },
  reescribiendo: {
    fondo: 'interior',
    piezas: [
      { id: 'jugador', x: 10, y: 14, s: 1.2 },
      { id: 'codigo-flotante', x: 36, y: 14, s: 1.2 },
      { id: 'simbolo-cero', x: 74, y: 36, s: 0.7 },
    ],
    efecto: 'foco',
  },

  // --- Epílogo ---
  'ciudad-recuperada': {
    fondo: 'ciudad-plena',
    piezas: [
      { id: 'hospital', x: 4, y: 20, s: 0.8, props: { on: true } },
      { id: 'semaforo', x: 34, y: 20, s: 0.8, props: { on: true } },
      { id: 'antena', x: 50, y: 20, s: 0.8, props: { on: true } },
      { id: 'centro-comercial', x: 68, y: 26, s: 0.75, props: { on: true } },
    ],
    efecto: 'calma',
  },
  'nia-y-jugador': {
    fondo: 'ciudad-plena',
    piezas: [
      { id: 'jugador', x: 24, y: 8, s: 1.4 },
      { id: 'nia-holo', x: 54, y: 8, s: 1.3 },
    ],
    efecto: 'calma',
  },

  // --- Apoyo para decisiones ---
  'opciones-servicios': {
    fondo: 'ciudad-parcial',
    piezas: [
      { id: 'hospital', x: 2, y: 18, s: 0.85, props: { on: false } },
      { id: 'publicidad', x: 32, y: 23, s: 0.85, props: { on: false } },
      { id: 'centro-comercial', x: 52, y: 23, s: 0.85, props: { on: false } },
      { id: 'antena', x: 80, y: 20, s: 0.85, props: { on: false } },
    ],
  },
  'opciones-pistas': {
    fondo: 'interior',
    piezas: [
      { id: 'registro-lista', x: 3, y: 20, s: 1 },
      { id: 'camara', x: 44, y: 22, s: 1 },
      { id: 'publicidad', x: 74, y: 20, s: 0.85, props: { on: true } },
    ],
  },

  // --- Tarjetas de opción ---
  'op-registro': objeto('registro-lista', { s: 1.7, ancho: 36, alto: 30 }),
  'op-camara': objeto('camara', { s: 2.2, ancho: 26, alto: 24 }),
  'op-publicidad': objeto('publicidad', { props: { on: true }, s: 1.7, ancho: 22, alto: 34 }),
  'op-colores': objeto('paleta-colores', { s: 1.8, ancho: 34, alto: 26 }),
  'op-alerta-completa': objeto('panel-limpio', { s: 1.5, ancho: 44, alto: 30 }),
  'op-alerta-color': objeto('alerta-solo-color', { s: 1.5, ancho: 44, alto: 30 }),
  'op-alerta-brillos': objeto('alerta-brillos', { s: 1.5, ancho: 44, alto: 30 }),
  'op-hospital': objeto('hospital', { props: { on: true }, s: 1.6, ancho: 32, alto: 40 }),
  'op-comercial': objeto('centro-comercial', { props: { on: true }, s: 1.7, ancho: 34, alto: 34 }),
  'op-toda-red': objeto('toda-red', { s: 1.5, ancho: 46, alto: 30 }),
};

// --- Render ---------------------------------------------------------------

// El tono de piel del avatar viene como color; acá se traduce al par
// piel+sombra que usan las figuras, para que el personaje del jugador tenga el
// mismo volumen que el resto.
function tonoDelAvatar(piel) {
  if (piel === C.pielB) return 'b';
  if (piel === C.pielC) return 'c';
  return 'a';
}

export default function EscenaPixel({ escena, avatar, className = '' }) {
  const def = ESCENAS[escena];
  if (!def) return null;
  const Fondo = FONDOS[def.fondo] ?? FONDOS.interior;
  const idFoco = `foco-${escena}`;

  return (
    <div className={`esc esc-${def.efecto ?? 'normal'} ${className}`.trim()}>
      <svg
        viewBox="0 0 96 72"
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
                <Persona tono={tonoDelAvatar(rostro.piel)} ropa={color.claro} ropaOscura={color.base} />
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

        {/* Efectos: capas encima del dibujo, controladas por CSS.

            OJO con los nombres de clase: el contenedor de afuera lleva
            `esc-<efecto>` (esc-glitch, esc-alerta...). Si estas capas usaran
            el mismo nombre, la regla del efecto le pegaria tambien al
            contenedor y por lo tanto a TODO el dibujo. Ya paso: `.esc-glitch
            rect` pintaba de rojo cada rectangulo de la escena, y `.esc-alerta`
            dejaba la escena entera al 10% de opacidad. Por eso van con nombre
            propio: `esc-lineas` y `esc-velo`. */}
        {def.efecto === 'glitch' ? (
          <g className="esc-lineas">
            <rect x="0" y="14" width="96" height="3" />
            <rect x="0" y="36" width="96" height="2" />
            <rect x="0" y="52" width="96" height="2" />
          </g>
        ) : null}
        {def.efecto === 'alerta' ? (
          <rect className="esc-velo" x="0" y="0" width="96" height="72" />
        ) : null}
        {def.efecto === 'foco' ? (
          <rect x="0" y="0" width="96" height="72" fill={`url(#${idFoco})`} />
        ) : null}
      </svg>
    </div>
  );
}
