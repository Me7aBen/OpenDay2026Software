// Microcursos (§46, §47).
//
// El precio se modela, no se escribe en la UI: `precioCentimos` + `moneda`, y
// un único formateador. Cambiar S/3 por otro valor, o hacerlo gratis, es tocar
// este archivo. Ningún componente conoce el número.
//
// PAGOS (§48): todavía NO existe backend de cobro, así que la plataforma NO
// simula un pago. El CTA queda en "Próximamente" y así lo dice. No hay claves,
// no hay pasarela, no hay pantalla de tarjeta.

export const ESTADO_COMERCIAL = {
  // Cambiar a 'checkout' el día que exista backend seguro. Hasta entonces,
  // ningún flujo debe hacer creer que se cobró dinero.
  modo: 'proximamente',
};

export const CURSOS = [
  {
    id: 'python-01',
    slug: 'python-01-tu-primera-decision',
    titulo: 'Tu primera decisión con Python',
    subtitulo: 'Python 01',
    nivel: 'Desde cero',
    duracionLabel: '20–30 min',
    precioCentimos: 300,
    moneda: 'PEN',
    esGratis: false,
    carreraIds: ['ingenieria-de-software'],
    simulacionRelacionadaId: 'pedido-fantasma',
    descripcion:
      'Aprende variables y condiciones construyendo una pequeña versión de la lógica que utilizaste en El Pedido Fantasma.',
    loQueAprenderas: [
      'Qué es una variable y para qué sirve',
      'Cómo se representa verdadero y falso',
      'Cómo funciona una condición IF',
      'Cómo evitar que un pedido se duplique',
    ],
    lecciones: [
      {
        id: 'l1',
        titulo: '¿Qué es una variable?',
        resumen: 'Una caja con nombre donde guardas un dato para usarlo después.',
        codigo: 'pedido_id = "KM-84921"\nprint(pedido_id)',
      },
      {
        id: 'l2',
        titulo: 'Verdadero y falso',
        resumen: 'Las computadoras deciden respondiendo preguntas de sí o no.',
        codigo: 'pedido_existe = True\nprint(pedido_existe)',
      },
      {
        id: 'l3',
        titulo: 'La condición IF',
        resumen: 'Si pasa esto, haz aquello. Si no, haz esto otro.',
        codigo: 'if pedido_existe:\n    print("No crear pedido")\nelse:\n    print("Crear pedido")',
      },
      {
        id: 'l4',
        titulo: 'Resuelve un pedido duplicado',
        resumen: 'La misma lógica que construiste en el Flow Debugger, ahora en código.',
        codigo:
          'pedido_existe = True\n\nif pedido_existe:\n    print("No crear pedido")\nelse:\n    print("Crear pedido")',
      },
    ],
  },
];

export function cursoPorSlug(slug) {
  return CURSOS.find((c) => c.slug === slug) ?? null;
}

export function cursoPorId(id) {
  return CURSOS.find((c) => c.id === id) ?? null;
}

const SIMBOLOS = { PEN: 'S/', USD: '$' };

export function formatearPrecio(curso) {
  if (curso.esGratis || curso.precioCentimos === 0) return 'GRATIS';
  const simbolo = SIMBOLOS[curso.moneda] ?? '';
  return `${simbolo}${(curso.precioCentimos / 100).toFixed(2)}`;
}
