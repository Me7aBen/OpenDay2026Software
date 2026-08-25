// Orden y desbloqueo de las misiones de la jornada.
//
// La jornada es una secuencia: el alumno hace la misión 1, y al terminarla se
// le abre la 2. El puntaje del ranking es la SUMA de las misiones que completó,
// no una fila por partida.
//
// El orden vive acá y no en el JSON de cada escenario a propósito: es una
// decisión del evento (qué se juega primero hoy), no del contenido. Cambiar el
// orden o agregar una tercera misión es editar esta lista.

export const ORDEN_MISIONES = ['codigo-cero', 'ccorca-v2'];

// Devuelve las misiones en orden de juego a partir de la lista de escenarios
// disponibles, con su estado para el alumno actual:
//   'completada' | 'disponible' | 'bloqueada'
//
// completadas: { [escenarioId]: { puntaje, tiempoSeg } }
// `secuencial` decide si una misión se bloquea hasta terminar la anterior.
//
//   true  (default) — la jornada del evento: misión 1, después la 2. Es la
//                     regla del Open Day y no cambia.
//   false           — el catálogo de la plataforma vocacional: un estudiante
//                     elige la simulación que quiera, cuando quiera. Nada se
//                     bloquea (§5 del brief).
export function estadoMisiones(escenarios, completadas = {}, { secuencial = true } = {}) {
  if (!secuencial) {
    return escenarios.map((escenario, i) => ({
      escenario,
      estado: completadas[escenario.id] ? 'completada' : 'disponible',
      numero: i + 1,
      resultado: completadas[escenario.id] ?? null,
    }));
  }

  const porId = new Map(escenarios.map((e) => [e.id, e]));
  const ordenados = ORDEN_MISIONES.map((id) => porId.get(id)).filter(Boolean);

  // Un escenario disponible que no figura en ORDEN_MISIONES (uno nuevo que
  // alguien agregó sin tocar esta lista) se juega al final y nunca queda
  // bloqueado: es preferible que se pueda jugar que que desaparezca.
  const sueltos = escenarios.filter((e) => !ORDEN_MISIONES.includes(e.id));

  let anteriorCompletada = true;
  const secuencia = ordenados.map((escenario, i) => {
    const completada = !!completadas[escenario.id];
    const estado = completada ? 'completada' : anteriorCompletada ? 'disponible' : 'bloqueada';
    anteriorCompletada = completada;
    return { escenario, estado, numero: i + 1, resultado: completadas[escenario.id] ?? null };
  });

  return [
    ...secuencia,
    ...sueltos.map((escenario, i) => ({
      escenario,
      estado: completadas[escenario.id] ? 'completada' : 'disponible',
      numero: secuencia.length + i + 1,
      resultado: completadas[escenario.id] ?? null,
    })),
  ];
}

// La próxima misión que le toca jugar, o null si ya terminó todas.
export function siguienteMision(escenarios, completadas = {}) {
  return estadoMisiones(escenarios, completadas).find((m) => m.estado === 'disponible') ?? null;
}

export function puntajeTotal(completadas = {}) {
  return Object.values(completadas).reduce((total, m) => total + (m.puntaje ?? 0), 0);
}

export function tiempoTotal(completadas = {}) {
  return Object.values(completadas).reduce((total, m) => total + (m.tiempoSeg ?? 0), 0);
}
