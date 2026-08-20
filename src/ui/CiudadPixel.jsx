import { useMemo } from 'react';
import IconoServicio from './IconoServicio';
import '../styles/ciudad.css';

// Skyline pixel art de la ciudad de NEXO. Es UN solo dibujo con tres estados
// (ataque / parcial / recuperada) que se logran cambiando capas de color, no
// tres imágenes distintas: eso mantiene el peso en cero archivos y evita que
// haya que precargar nada.
//
// Las ventanas se encienden solas con el porcentaje de recuperación. El orden
// de encendido es determinista (un hash de la posición de cada ventana), no
// aleatorio: así el dibujo no titila entre renders y siempre se ve igual para
// el mismo porcentaje. Nunca se llama a Math.random().
//
// Props:
//   progreso  number 0..100 - porcentaje de ciudad recuperada
//   estado    'ataque'|'parcial'|'recuperada' - opcional; si no se pasa se
//             deriva del progreso
//   alto      number - alto en px del bloque

const SUELO = 88;

// Skyline dibujado a mano. `cols`/`filas` definen la retícula de ventanas de
// cada torre.
const EDIFICIOS = [
  { x: 4, w: 30, h: 44, cols: 3, filas: 3 },
  { x: 40, w: 22, h: 62, cols: 2, filas: 5 },
  { x: 68, w: 34, h: 36, cols: 4, filas: 2 },
  { x: 108, w: 26, h: 70, cols: 3, filas: 5 },
  { x: 140, w: 30, h: 50, cols: 3, filas: 4 },
  { x: 176, w: 20, h: 38, cols: 2, filas: 3 },
  { x: 202, w: 32, h: 64, cols: 3, filas: 5 },
  { x: 240, w: 24, h: 42, cols: 2, filas: 3 },
  { x: 270, w: 34, h: 56, cols: 4, filas: 4 },
  { x: 310, w: 6, h: 30, cols: 1, filas: 2 },
];

// Los servicios se encienden por hitos, en el orden en que la historia los
// recupera: primero el respaldo, al final el transporte.
const SERVICIOS = [
  { tipo: 'servidor', x: 46, umbral: 10, etiqueta: 'Servidor de respaldo' },
  { tipo: 'hospital', x: 114, umbral: 40, etiqueta: 'Hospital' },
  { tipo: 'comunicaciones', x: 208, umbral: 65, etiqueta: 'Comunicaciones' },
  { tipo: 'semaforo', x: 148, umbral: 80, etiqueta: 'Semáforos' },
  { tipo: 'transporte', x: 276, umbral: 100, etiqueta: 'Transporte' },
];

function derivarEstado(progreso) {
  if (progreso >= 80) return 'recuperada';
  if (progreso >= 40) return 'parcial';
  return 'ataque';
}

// Hash determinista de la posición: reparte el encendido por toda la ciudad en
// vez de llenarla torre por torre, que se vería mecánico.
function umbralVentana(x, y) {
  return (Math.round(x) * 37 + Math.round(y) * 53) % 100;
}

function calcularVentanas() {
  const ventanas = [];
  EDIFICIOS.forEach((ed) => {
    const anchoUtil = ed.w - 6;
    const pasoX = anchoUtil / ed.cols;
    const altoUtil = ed.h - 10;
    const pasoY = altoUtil / ed.filas;
    for (let c = 0; c < ed.cols; c += 1) {
      for (let f = 0; f < ed.filas; f += 1) {
        const x = ed.x + 3 + c * pasoX + (pasoX - 4) / 2;
        const y = SUELO - ed.h + 6 + f * pasoY;
        ventanas.push({ x, y, umbral: umbralVentana(x, y) });
      }
    }
  });
  return ventanas;
}

export default function CiudadPixel({ progreso = 0, estado, alto = 132 }) {
  // La retícula de ventanas no depende de props: se calcula una sola vez y
  // sirve para todos los porcentajes (lo que cambia es cuáles se pintan).
  const ventanas = useMemo(() => calcularVentanas(), []);
  const modo = estado ?? derivarEstado(progreso);

  return (
    <div className={`ciudad ciudad-${modo}`} aria-hidden="true">
      <svg viewBox="0 0 320 100" width="100%" height={alto} shapeRendering="crispEdges">
        {/* Cielo: el mismo rect en los tres estados, distinto color por CSS. */}
        <rect className="ciudad-cielo" x="0" y="0" width="320" height="100" />

        {/* Estrellas fijas (no parpadean: nada de flashes rápidos). */}
        <g className="ciudad-estrellas">
          <rect x="24" y="10" width="2" height="2" />
          <rect x="96" y="6" width="2" height="2" />
          <rect x="188" y="14" width="2" height="2" />
          <rect x="256" y="8" width="2" height="2" />
          <rect x="300" y="18" width="2" height="2" />
        </g>

        {/* Luna / sol digital */}
        <circle className="ciudad-astro" cx="284" cy="20" r="10" />

        {/* Torres */}
        <g className="ciudad-torres">
          {EDIFICIOS.map((ed) => (
            <rect key={ed.x} x={ed.x} y={SUELO - ed.h} width={ed.w} height={ed.h} />
          ))}
        </g>

        {/* Ventanas: encendidas si su umbral quedó por debajo del progreso. */}
        <g className="ciudad-ventanas">
          {ventanas.map((v) => (
            <rect
              key={`${v.x}-${v.y}`}
              x={v.x}
              y={v.y}
              width="4"
              height="4"
              className={v.umbral < progreso ? 'on' : 'off'}
            />
          ))}
        </g>

        {/* Suelo */}
        <rect className="ciudad-suelo" x="0" y={SUELO} width="320" height={100 - SUELO} />
        <rect className="ciudad-linea" x="0" y={SUELO} width="320" height="1" />

        {/* Interferencia: solo en ataque. Son barras anchas y lentas, no
            parpadeos rápidos (ver styles/ciudad.css). */}
        <g className="ciudad-glitch">
          <rect x="0" y="30" width="320" height="3" />
          <rect x="0" y="58" width="320" height="2" />
        </g>
      </svg>

      {/* Marcadores de servicio sobre el skyline. Se encienden por hito. */}
      <div className="ciudad-servicios">
        {SERVICIOS.map((s) => (
          <span
            key={s.tipo}
            className={`ciudad-servicio${progreso >= s.umbral ? ' on' : ''}`}
            style={{ left: `${(s.x / 320) * 100}%` }}
            title={s.etiqueta}
          >
            <IconoServicio tipo={s.tipo} tam={16} />
          </span>
        ))}
      </div>
    </div>
  );
}
