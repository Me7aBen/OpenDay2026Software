// Instituciones y programas académicos (§17).
//
// El brief es explícito: NO inventar información de universidades. Lo que se
// construye acá es la ARQUITECTURA — dos entidades separadas, `Institution` y
// `AcademicProgram`, con su trazabilidad de fuente — poblada con registros
// claramente marcados como demostración.
//
// Por eso `carrera.universidades = ['...']` no existe en ninguna parte: un
// programa pertenece a una institución Y a una carrera, tiene su propia sede,
// modalidad y duración, y su propio enlace a la fuente. Cuando se conecte
// SUNEDU o el portal de cada casa de estudios, se reemplaza este arreglo por
// datos normalizados sin tocar un solo componente.

export const INSTITUCIONES = [
  {
    id: 'inst-demo-1',
    slug: 'institucion-demo-lima',
    nombre: 'Institución de ejemplo — Lima',
    tipo: 'universidad', // universidad | instituto
    region: 'Lima',
    ciudad: 'Lima',
    web: null,
    fuenteEstado: 'demo',
    fuenteNombre: null,
    fuenteUrl: null,
    verificadoEn: null,
  },
  {
    id: 'inst-demo-2',
    slug: 'institucion-demo-arequipa',
    nombre: 'Institución de ejemplo — Arequipa',
    tipo: 'instituto',
    region: 'Arequipa',
    ciudad: 'Arequipa',
    web: null,
    fuenteEstado: 'demo',
    fuenteNombre: null,
    fuenteUrl: null,
    verificadoEn: null,
  },
  {
    id: 'inst-demo-3',
    slug: 'institucion-demo-trujillo',
    nombre: 'Institución de ejemplo — Trujillo',
    tipo: 'universidad',
    region: 'La Libertad',
    ciudad: 'Trujillo',
    web: null,
    fuenteEstado: 'demo',
    fuenteNombre: null,
    fuenteUrl: null,
    verificadoEn: null,
  },
];

export const PROGRAMAS = [
  {
    id: 'prog-demo-soft-1',
    carreraId: 'ingenieria-de-software',
    institucionId: 'inst-demo-1',
    nombreOficial: 'Ingeniería de Software (programa de ejemplo)',
    sede: 'Lima',
    modalidad: 'Presencial',
    duracionLabel: '10 ciclos',
    fuenteEstado: 'demo',
    fuenteNombre: null,
    enlaceExterno: null,
    verificadoEn: null,
  },
  {
    id: 'prog-demo-soft-2',
    carreraId: 'ingenieria-de-software',
    institucionId: 'inst-demo-2',
    nombreOficial: 'Diseño y Desarrollo de Software (programa de ejemplo)',
    sede: 'Arequipa',
    modalidad: 'Presencial',
    duracionLabel: '6 ciclos',
    fuenteEstado: 'demo',
    fuenteNombre: null,
    enlaceExterno: null,
    verificadoEn: null,
  },
  {
    id: 'prog-demo-arq-1',
    carreraId: 'arquitectura',
    institucionId: 'inst-demo-3',
    nombreOficial: 'Arquitectura (programa de ejemplo)',
    sede: 'Trujillo',
    modalidad: 'Presencial',
    duracionLabel: '10 ciclos',
    fuenteEstado: 'demo',
    fuenteNombre: null,
    enlaceExterno: null,
    verificadoEn: null,
  },
];

export function institucionPorId(id) {
  return INSTITUCIONES.find((i) => i.id === id) ?? null;
}

// Programas de una carrera, ya unidos con su institución para que la UI no
// tenga que cruzar tablas.
export function programasDeCarrera(carreraId) {
  return PROGRAMAS.filter((p) => p.carreraId === carreraId).map((programa) => ({
    ...programa,
    institucion: institucionPorId(programa.institucionId),
  }));
}
