// Sprites de Valeria.
//
// Los originales viven en `src/assets/sprites/valeria/` (9,3 MB en total, hasta
// 512x512 por expresión). Para la web se usa la carpeta `web/`, con las mismas
// imágenes reducidas a 256 px: el retrato nunca se muestra a más de ~120 px, y
// bajar 240 kB por expresión a un celular en Perú para pintarla en 96 px no se
// justifica. Los originales quedan intactos para material gráfico y para el día
// que haga falta más resolución.
//
// Nota sobre el renderizado: el README del paquete sugiere
// `image-rendering: pixelated`, pero estas ilustraciones no son pixel art puro
// (tienen contorno suave y sombreado). Al reducirlas, `pixelated` produce
// dientes de sierra, así que se dejan con el suavizado normal del navegador.

import neutral from '../../../assets/sprites/valeria/web/valeria-neutral.png';
import happy from '../../../assets/sprites/valeria/web/valeria-happy.png';
import concerned from '../../../assets/sprites/valeria/web/valeria-concerned.png';
import thinking from '../../../assets/sprites/valeria/web/valeria-thinking.png';
import busto from '../../../assets/sprites/valeria/web/valeria-busto.png';

export const VALERIA_BUSTO = busto;

// El motor habla en cinco estados; Valeria tiene cuatro expresiones.
export const EXPRESION_POR_ESTADO = {
  idle: neutral,
  feliz: happy,
  confundido: thinking,
  molesto: concerned,
  sorprendido: concerned,
};

export const DESCRIPCION_POR_ESTADO = {
  idle: 'Valeria, atenta',
  feliz: 'Valeria, satisfecha',
  confundido: 'Valeria, pensando',
  molesto: 'Valeria, preocupada',
  sorprendido: 'Valeria, preocupada',
};

export function spriteDeValeria(estado = 'idle') {
  return EXPRESION_POR_ESTADO[estado] ?? neutral;
}

export function descripcionDeValeria(estado = 'idle') {
  return DESCRIPCION_POR_ESTADO[estado] ?? DESCRIPCION_POR_ESTADO.idle;
}
