import { getItem, setItem } from '../../lib/storage';

// "Mi exploración" (§49) — el rastro que va dejando el estudiante.
//
// Vive en localStorage, sin cuenta y sin servidor. Cuando exista Auth real
// (§63) esto se sincroniza; hasta entonces NO se simula ninguna sesión: no hay
// login falso, no hay usuario inventado. Lo que hay es un registro local, y la
// UI dice que es local.
//
// Se guardan cuatro cosas, deliberadamente separadas (§43): las carreras
// guardadas, las simulaciones completadas CON SU PUNTAJE, la opinión explícita
// del estudiante después de jugar, y los microcursos vistos. El puntaje y la
// opinión nunca se mezclan: uno mide desempeño en un juego, la otra es interés
// declarado, y confundirlos sería hacer un test vocacional encubierto.

const CLAVE = 'exploracion';

const VACIO = {
  carrerasGuardadas: [], // [carreraId]
  simulaciones: {}, // { [simulacionId]: { puntaje, maximo, fecha, perfil } }
  opiniones: {}, // { [simulacionId]: { valor, fecha } }
  cursos: {}, // { [cursoId]: { estado: 'visto'|'completado', fecha } }
  comparador: [], // [carreraId] máximo 3
};

const suscriptores = new Set();

export function leerExploracion() {
  const guardado = getItem(CLAVE);
  return { ...VACIO, ...(guardado ?? {}) };
}

function escribir(siguiente) {
  setItem(CLAVE, siguiente);
  suscriptores.forEach((fn) => fn(siguiente));
  return siguiente;
}

// Suscripción mínima para que varias pantallas abiertas a la vez (el header con
// su contador, la ficha con su corazón) se enteren del cambio sin recargar.
export function suscribir(fn) {
  suscriptores.add(fn);
  return () => suscriptores.delete(fn);
}

export function alternarCarreraGuardada(carreraId) {
  const actual = leerExploracion();
  const guardadas = actual.carrerasGuardadas.includes(carreraId)
    ? actual.carrerasGuardadas.filter((id) => id !== carreraId)
    : [...actual.carrerasGuardadas, carreraId];
  return escribir({ ...actual, carrerasGuardadas: guardadas });
}

export function estaGuardada(carreraId) {
  return leerExploracion().carrerasGuardadas.includes(carreraId);
}

export function registrarSimulacion(simulacionId, { puntaje, maximo, perfil = null }) {
  const actual = leerExploracion();
  const previo = actual.simulaciones[simulacionId];
  // Si vuelve a jugar, se queda el mejor intento: el historial es para que se
  // sienta un logro, no un examen con nota final.
  const mejor = previo && previo.puntaje > puntaje ? previo.puntaje : puntaje;
  return escribir({
    ...actual,
    simulaciones: {
      ...actual.simulaciones,
      [simulacionId]: {
        puntaje: mejor,
        ultimoPuntaje: puntaje,
        maximo,
        perfil,
        veces: (previo?.veces ?? 0) + 1,
        fecha: new Date().toISOString(),
      },
    },
  });
}

export function registrarOpinion(simulacionId, valor) {
  const actual = leerExploracion();
  return escribir({
    ...actual,
    opiniones: {
      ...actual.opiniones,
      [simulacionId]: { valor, fecha: new Date().toISOString() },
    },
  });
}

export function registrarCurso(cursoId, estado = 'visto') {
  const actual = leerExploracion();
  return escribir({
    ...actual,
    cursos: { ...actual.cursos, [cursoId]: { estado, fecha: new Date().toISOString() } },
  });
}

export const MAX_COMPARAR = 3;

export function alternarComparar(carreraId) {
  const actual = leerExploracion();
  const dentro = actual.comparador.includes(carreraId);
  if (dentro) {
    return escribir({
      ...actual,
      comparador: actual.comparador.filter((id) => id !== carreraId),
    });
  }
  if (actual.comparador.length >= MAX_COMPARAR) return actual;
  return escribir({ ...actual, comparador: [...actual.comparador, carreraId] });
}

export function limpiarComparador() {
  return escribir({ ...leerExploracion(), comparador: [] });
}
