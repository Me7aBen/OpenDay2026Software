// Identidad de la plataforma, en un solo lugar.
//
// El nombre comercial todavía no está decidido (§8 del brief), así que ningún
// componente escribe "PRIMER DÍA" a mano: todos leen de acá. Cambiar el nombre
// definitivo es editar este archivo y nada más.

export const APP_NAME = 'PRIMER DÍA';
export const APP_NAME_CORTO = 'PRIMER DÍA';
export const APP_TAGLINE = 'Explora. Experimenta. Decide.';
export const APP_DESCRIPCION =
  'Descubre qué carreras existen, dónde puedes estudiarlas y experimenta cómo sería trabajar en ellas antes de tomar una decisión.';

// El logo es un dato de marca, no un componente: un glifo SVG simple que se
// dibuja en el header, el footer y el favicon. Provisional y reemplazable por
// una imagen sin tocar quien lo usa.
export const APP_LOGO = {
  // Amanecer: un sol que asoma. "Primer día" es el primer día de algo.
  viewBox: '0 0 24 24',
  trazos: [
    { tipo: 'circulo', cx: 12, cy: 13, r: 5 },
    { tipo: 'linea', d: 'M2 19h20' },
    { tipo: 'linea', d: 'M12 3v2M4.6 6.6l1.4 1.4M19.4 6.6 18 8' },
  ],
};

// Cómo se llama públicamente una "misión" del motor. Adentro el código sigue
// hablando de misiones y escenarios (§8): esto es solo la palabra que ve el
// estudiante.
export const PALABRA_SIMULACION = 'simulación';
export const PALABRA_SIMULACIONES = 'simulaciones';
