// Wrapper de localStorage con el prefijo `md:` que exige docs/CLAUDE.md.

const PREFIJO = 'md:';

export function getItem(clave) {
  try {
    const raw = localStorage.getItem(PREFIJO + clave);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setItem(clave, valor) {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
  } catch {
    // localStorage lleno o no disponible: el juego sigue funcionando en memoria.
  }
}

export function removeItem(clave) {
  localStorage.removeItem(PREFIJO + clave);
}

export function limpiarPartida() {
  removeItem('partida-en-curso');
}
