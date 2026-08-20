import ccorcaV2 from './ccorca-v2.json';
import codigoCero from './codigo-cero.json';

// Catálogo de misiones de la jornada: el JSON de contenido más lo que necesita
// la tarjeta de la pantalla de selección (etiqueta y portada).
//
// Vive acá y no dentro de cada pantalla porque lo miran dos: la selección de
// misión y el resultado (que tiene que saber cuál sigue). El ORDEN de juego no
// se decide acá sino en engine/misiones.js.
//
// Ccorca v1 (`ccorca.json`) queda fuera a propósito: v2 lo reemplaza. El JSON
// sigue en el repo, así que volver a mostrarlo es importarlo y agregarlo acá.

// También sirve de portada por defecto para un escenario que no declare una.
export const PORTADA_DEFECTO = {
  color: 'var(--gold)',
  fondo: 'linear-gradient(160deg,#1c2b57,#2c3f74)',
  icono: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
};

const PORTADA_CODIGO_CERO = {
  color: 'var(--cyan)',
  fondo: 'linear-gradient(160deg,#141d38,#2a1c4d 55%,#3d1638)',
  // Red de nodos con uno fuera de lugar: es la historia en un glifo.
  icono: (
    <>
      <path d="M12 4v5M12 15v5M6.5 7.5 10 10M14 14l3.5 2.5M17.5 7.5 14 10M10 14l-3.5 2.5" />
      <circle cx="12" cy="12" r="2.6" />
      <circle cx="12" cy="3" r="1.6" />
      <circle cx="12" cy="21" r="1.6" />
      <circle cx="5" cy="7" r="1.6" />
      <circle cx="19" cy="17" r="1.6" />
      <circle cx="19" cy="7" r="1.6" />
      <rect x="3.6" y="15.6" width="2.8" height="2.8" transform="rotate(45 5 17)" />
    </>
  ),
};

export const ESCENARIOS = [
  {
    ...codigoCero,
    etiqueta: 'CIBERSEGURIDAD · CIUDAD INTELIGENTE',
    portada: PORTADA_CODIGO_CERO,
  },
  {
    ...ccorcaV2,
    etiqueta: 'ENERGÍA LIMPIA · ARQUITECTURA',
    portada: PORTADA_DEFECTO,
  },
];
