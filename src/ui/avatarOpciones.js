// Catálogo de piezas del avatar y helpers puros. Sin React, fácil de testear.
//
// El avatar se arma por CAPAS sobre una misma grilla de píxeles, no como una
// imagen por combinación. 3 rostros x 4 colores x 4 accesorios serían 48
// archivos; acá son 11 definiciones de datos y un SVG que las compone. Agregar
// un accesorio nuevo es agregar un objeto a esta lista.
//
// Los colores salen de la paleta de src/styles/tokens.css. No se inventan
// tonos nuevos: los `base`/`claro` son variantes oscura y clara del mismo token
// para que la chaqueta tenga volumen sin salirse de la identidad del producto.

export const ROSTROS = [
  { id: 'r1', nombre: 'Rostro A', piel: '#f0c8a0', pelo: '#2b2440', peinado: 'corto' },
  { id: 'r2', nombre: 'Rostro B', piel: '#c98d5e', pelo: '#3a2418', peinado: 'largo' },
  { id: 'r3', nombre: 'Rostro C', piel: '#8d5a3b', pelo: '#141026', peinado: 'rapado' },
];

export const COLORES = [
  { id: 'cian', nombre: 'Cian', base: '#1d6b86', claro: '#4ad9ff' },
  { id: 'magenta', nombre: 'Magenta', base: '#8f2f57', claro: '#ff5c9d' },
  { id: 'violeta', nombre: 'Violeta', base: '#4a3a8f', claro: '#9b8cff' },
  { id: 'verde', nombre: 'Verde', base: '#1c7a5c', claro: '#2fe6a6' },
];

export const ACCESORIOS = [
  { id: 'ninguno', nombre: 'Sin accesorio' },
  { id: 'audifonos', nombre: 'Audífonos' },
  { id: 'lentes', nombre: 'Lentes tec' },
  { id: 'visor', nombre: 'Visor' },
];

export const AVATAR_POR_DEFECTO = {
  rostro: ROSTROS[0].id,
  color: COLORES[0].id,
  accesorio: ACCESORIOS[0].id,
};

// Devuelve siempre un avatar dibujable, venga como venga la entrada. Es lo que
// permite que un jugador de Ccorca (que nunca pasa por la personalización y por
// lo tanto tiene `avatar: undefined`) no rompa ningún render que quiera
// mostrarlo: cae en los valores por defecto.
export function normalizarAvatar(avatar) {
  const rostro = ROSTROS.find((r) => r.id === avatar?.rostro) ?? ROSTROS[0];
  const color = COLORES.find((c) => c.id === avatar?.color) ?? COLORES[0];
  const accesorio = ACCESORIOS.find((a) => a.id === avatar?.accesorio) ?? ACCESORIOS[0];
  return { rostro, color, accesorio };
}
