// Catálogo público de simulaciones.
//
// PUNTO CLAVE DE RENDIMIENTO (§57): acá NO se importa ningún JSON de escenario.
// `codigo-cero.json` solo pesa ~40 kB, pero cargarlo en la home junto con sus
// minijuegos es exactamente lo que el brief pide evitar. El contenido se trae
// con `cargar()`, que es un import dinámico y por lo tanto un chunk aparte que
// Vite solo baja cuando el estudiante entra a jugar.
//
// La metadata (título, duración, precio, a qué carrera pertenece) sí vive acá:
// es lo que necesitan la home, el catálogo y la ficha de carrera, y son pocos
// bytes.

export const SIMULACIONES = [
  {
    id: 'pedido-fantasma',
    slug: 'el-pedido-fantasma',
    titulo: 'El Pedido Fantasma',
    etiqueta: 'E-commerce · Backend',
    resumen:
      'Un cliente compró una sola vez, pero el sistema generó cinco pedidos.',
    descripcion:
      'Eres desarrollador junior en Kawsay Market. Hoy empieza la campaña más grande del año y los pedidos se están duplicando. Encuentra la causa, corrige el flujo y despliega antes de que arranque la campaña.',
    duracionLabel: '8–11 minutos',
    dificultad: 'Media',
    dificultadNivel: 2,
    recompensaXp: 250,
    precio: { esGratis: true, monto: 0, moneda: 'PEN' },
    carreraIds: ['ingenieria-de-software'],
    tecnologias: ['APIs REST', 'Bases de datos', 'Eventos / Tareas', 'Logs y monitoreo'],
    // Etapas visibles del recorrido (la barra inferior de la intro).
    etapas: ['INTRO', 'INVESTIGACIÓN', 'FLUJO', 'IMPLEMENTACIÓN', 'PRUEBAS', 'DESPLIEGUE'],
    conceptos: [
      'lógica',
      'condiciones',
      'bases de datos',
      'validación',
      'debugging',
      'APIs',
      'testing',
      'deploy',
    ],
    cursoRelacionadoId: 'python-01',
    color: 'var(--cyan)',
    destacada: true,
    cargar: () => import('../../content/pedido-fantasma.json'),
  },
  {
    id: 'codigo-cero',
    slug: 'codigo-cero',
    titulo: 'Código Cero',
    etiqueta: 'Ciberseguridad · Ciudad inteligente',
    resumen: 'Alguien entró a la red de la ciudad y los servicios están fallando.',
    descripcion:
      'Una ciudad inteligente pierde el control de sus servicios. Investigas el ataque, reparas los sistemas críticos y devuelves la ciudad a la normalidad.',
    duracionLabel: '8–12 minutos',
    dificultad: 'Media',
    dificultadNivel: 2,
    recompensaXp: 300,
    precio: { esGratis: true, monto: 0, moneda: 'PEN' },
    carreraIds: ['ingenieria-de-software'],
    tecnologias: ['Ciberseguridad', 'Redes', 'Lógica de programación'],
    etapas: ['DESCUBRIR', 'DISEÑAR', 'CONSTRUIR', 'PROBAR', 'DESPLEGAR'],
    conceptos: ['lógica', 'condiciones', 'seguridad', 'debugging', 'deploy'],
    cursoRelacionadoId: 'python-01',
    color: 'var(--pink)',
    cargar: () => import('../../content/codigo-cero.json'),
  },
  {
    id: 'ccorca-v2',
    slug: 'luz-para-ccorca',
    titulo: 'Luz para Ccorca',
    etiqueta: 'Energía limpia · Arquitectura',
    resumen: 'Una comunidad altoandina necesita energía y no llega la red eléctrica.',
    descripcion:
      'Acompañas a una comunidad de Cusco a diseñar una solución energética real: entender la necesidad, decidir la tecnología y sostenerla en el tiempo.',
    duracionLabel: '10–14 minutos',
    dificultad: 'Media',
    dificultadNivel: 2,
    recompensaXp: 280,
    precio: { esGratis: true, monto: 0, moneda: 'PEN' },
    carreraIds: ['ingenieria-civil', 'arquitectura'],
    tecnologias: ['Energía renovable', 'Diseño de soluciones', 'Trabajo con comunidades'],
    etapas: ['DESCUBRIR', 'DISEÑAR', 'CONSTRUIR', 'PROBAR', 'DESPLEGAR'],
    conceptos: ['diagnóstico', 'diseño', 'sostenibilidad', 'validación'],
    cursoRelacionadoId: null,
    color: 'var(--gold)',
    cargar: () => import('../../content/ccorca-v2.json'),
  },
];

export function simulacionPorSlug(slug) {
  return SIMULACIONES.find((s) => s.slug === slug) ?? null;
}

export function simulacionPorId(id) {
  return SIMULACIONES.find((s) => s.id === id) ?? null;
}

// Trae el JSON del escenario. Se usa solo dentro de la ruta de juego.
export async function cargarEscenario(simulacion) {
  const modulo = await simulacion.cargar();
  return modulo.default ?? modulo;
}
