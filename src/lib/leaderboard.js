// Leaderboard falso de esta etapa: vive solo en localStorage de esta PC.
// Cuando llegue Supabase, esta es la única pieza que cambia de fuente de datos.

import { getItem, setItem } from './storage';

const CLAVE = 'leaderboard-fake';
const MAX_FILAS = 20;

export function obtenerTop(limite = 5) {
  const filas = getItem(CLAVE) ?? [];
  return [...filas].sort((a, b) => b.puntaje - a.puntaje || a.tiempoSeg - b.tiempoSeg).slice(0, limite);
}

export function guardarPartida({ nombre, colegio, escenario, puntaje, tiempoSeg }) {
  const filas = getItem(CLAVE) ?? [];
  filas.push({ nombre, colegio, escenario, puntaje, tiempoSeg });
  filas.sort((a, b) => b.puntaje - a.puntaje || a.tiempoSeg - b.tiempoSeg);
  setItem(CLAVE, filas.slice(0, MAX_FILAS));
}
