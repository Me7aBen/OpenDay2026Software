// Capa de dominio (§61): source → normalization → domain data → UI.
//
// Los componentes NUNCA importan `data/carreras.js` directamente. Piden acá lo
// que necesitan y reciben objetos ya normalizados: con su área resuelta, sus
// simulaciones asociadas y su estado de fuente explícito. El día que los datos
// vengan de una API o de un dataset de SUNEDU, cambia este archivo y nada más.

import { CARRERAS } from './data/carreras';
import { areaPorId } from './data/areas';
import { SIMULACIONES } from '../simulations/catalogo';
import { programasDeCarrera } from '../institutions/data/instituciones';

function normalizar(carrera) {
  return {
    ...carrera,
    areaInfo: areaPorId(carrera.area),
    simulaciones: (carrera.simulacionIds ?? [])
      .map((id) => SIMULACIONES.find((s) => s.id === id))
      .filter(Boolean),
    tieneSimulacion: (carrera.simulacionIds ?? []).some((id) =>
      SIMULACIONES.some((s) => s.id === id),
    ),
  };
}

export function listarCarreras() {
  return CARRERAS.map(normalizar);
}

export function carreraPorSlug(slug) {
  const cruda = CARRERAS.find((c) => c.slug === slug);
  if (!cruda) return null;
  return { ...normalizar(cruda), programas: programasDeCarrera(cruda.id) };
}

export function carreraPorId(id) {
  const cruda = CARRERAS.find((c) => c.id === id);
  return cruda ? normalizar(cruda) : null;
}

// Quita tildes y pasa a minúsculas: "ingenieria" tiene que encontrar
// "Ingeniería". Un estudiante escribiendo desde el celular no pone tildes.
function normalizarTexto(texto) {
  // Se filtran los puntos de codigo de marcas diacriticas combinantes en
  // vez de usar una expresion regular con esos caracteres literales: el
  // rango U+0300..U+036F escrito a mano no sobrevive a un cambio de
  // codificacion del archivo, y esto si.
  const descompuesto = texto.toLowerCase().normalize('NFD');
  let salida = '';
  for (const caracter of descompuesto) {
    const punto = caracter.codePointAt(0);
    if (punto >= 0x0300 && punto <= 0x036f) continue;
    salida += caracter;
  }
  return salida;
}

export function buscarCarreras({ texto = '', area = null } = {}) {
  const consulta = normalizarTexto(texto.trim());
  return listarCarreras().filter((carrera) => {
    if (area && carrera.area !== area) return false;
    if (!consulta) return true;
    const heno = normalizarTexto(
      [
        carrera.nombre,
        carrera.descripcionCorta,
        carrera.areaInfo?.nombre ?? '',
        ...(carrera.campoLaboral ?? []),
        ...(carrera.cursosBase ?? []),
      ].join(' '),
    );
    return heno.includes(consulta);
  });
}

// Sugerencias del buscador de la home (§10).
export const SUGERENCIAS_BUSQUEDA = [
  'Ingeniería de Software',
  'Psicología',
  'Arquitectura',
  'Administración',
  'Medicina',
  'Marketing',
];
