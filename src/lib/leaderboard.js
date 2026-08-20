// Ranking acumulado de la jornada.
//
// Una fila POR ALUMNO (no por partida) con el total de las misiones que
// completó. Si Supabase está configurado, la fuente de verdad es Supabase y el
// facilitador puede ver el ranking de todas las PCs del lab. Si no, todo cae a
// localStorage y el ranking es el de esta máquina: el juego funciona igual, sin
// avisos ni errores (regla 3 de docs/CLAUDE.md).

import { getItem, setItem } from './storage';
import { estaConfigurado, guardarParticipante, leerParticipantes } from './supabase';

const CLAVE_FILAS = 'ranking';
const CLAVE_ID = 'participante-id';

export { estaConfigurado };

// Id estable del alumno que está jugando en esta PC. Se genera una vez y vive
// hasta que el facilitador reinicia para el siguiente alumno.
export function idParticipante() {
  let id = getItem(CLAVE_ID);
  if (!id) {
    id = crypto.randomUUID();
    setItem(CLAVE_ID, id);
  }
  return id;
}

export function nuevoParticipante() {
  const id = crypto.randomUUID();
  setItem(CLAVE_ID, id);
  return id;
}

function ordenar(filas) {
  // Desempate por tiempo: a igual puntaje, gana quien tardó menos (§6 de la
  // propuesta).
  return [...filas].sort(
    (a, b) => b.puntajeTotal - a.puntajeTotal || a.tiempoTotalSeg - b.tiempoTotalSeg,
  );
}

function guardarLocal(fila) {
  const filas = getItem(CLAVE_FILAS) ?? [];
  const i = filas.findIndex((f) => f.id === fila.id);
  if (i >= 0) filas[i] = fila;
  else filas.push(fila);
  setItem(CLAVE_FILAS, ordenar(filas));
}

function leerLocal({ numeroColegio = null } = {}) {
  const filas = getItem(CLAVE_FILAS) ?? [];
  const filtradas = numeroColegio
    ? filas.filter((f) => Number(f.numeroColegio) === Number(numeroColegio))
    : filas;
  return ordenar(filtradas);
}

// Guarda el progreso completo del alumno: qué misiones lleva y el total.
// Se llama al terminar cada misión, así que la fila se va actualizando.
//
// Escribe SIEMPRE en local, y además en Supabase si está configurado. El local
// es la red de seguridad: si el wifi falla, el facilitador todavía puede ver el
// puntaje en la pantalla del alumno.
export async function guardarProgreso({ jugador, completadas, puntajeTotal, tiempoTotalSeg }) {
  const id = idParticipante();
  const fila = {
    id,
    nombre: jugador.nombre,
    colegio: jugador.colegio,
    numeroColegio: jugador.numeroColegio,
    misiones: completadas,
    puntajeTotal,
    tiempoTotalSeg,
  };

  guardarLocal(fila);

  if (estaConfigurado()) {
    // Nombres en snake_case porque así se llaman las columnas en Postgres.
    await guardarParticipante({
      id,
      nombre: fila.nombre,
      colegio: fila.colegio,
      numero_colegio: fila.numeroColegio,
      misiones: completadas,
      puntaje_total: puntajeTotal,
      tiempo_total_seg: tiempoTotalSeg,
    });
  }
}

// Lee el ranking. Devuelve además de dónde salió, para que el panel del
// facilitador pueda decir la verdad sobre lo que está mostrando.
export async function obtenerRanking({ numeroColegio = null, limite = 100 } = {}) {
  if (estaConfigurado()) {
    const filas = await leerParticipantes({ numeroColegio, limite });
    if (filas) {
      return {
        origen: 'supabase',
        filas: filas.map((f) => ({
          id: f.id,
          nombre: f.nombre,
          colegio: f.colegio,
          numeroColegio: f.numero_colegio,
          misiones: f.misiones ?? {},
          puntajeTotal: f.puntaje_total ?? 0,
          tiempoTotalSeg: f.tiempo_total_seg ?? 0,
        })),
      };
    }
    // Supabase configurado pero sin responder: seguimos con lo local.
    return { origen: 'local-sin-conexion', filas: leerLocal({ numeroColegio }).slice(0, limite) };
  }
  return { origen: 'local', filas: leerLocal({ numeroColegio }).slice(0, limite) };
}
