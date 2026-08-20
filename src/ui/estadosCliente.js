// Constantes y funciones puras para los 5 estados del personaje.
// Sin dependencias de React, fácil de testear.

export const ESTADO_IDLE = 'idle';
export const ESTADO_FELIZ = 'feliz';
export const ESTADO_CONFUNDIDO = 'confundido';
export const ESTADO_MOLESTO = 'molesto';
export const ESTADO_SORPRENDIDO = 'sorprendido';

export const ESTADOS = {
  [ESTADO_IDLE]:        { emoji: '😐', label: 'Esperando' },
  [ESTADO_FELIZ]:       { emoji: '😊', label: 'Feliz' },
  [ESTADO_CONFUNDIDO]:  { emoji: '🤔', label: 'Confundido' },
  [ESTADO_MOLESTO]:     { emoji: '😠', label: 'Molesto' },
  [ESTADO_SORPRENDIDO]: { emoji: '😮', label: 'Sorprendido' },
};

// Mapea el puntaje de una decisión recién resuelta a un estado.
// 60 pts -> feliz. 30 pts -> confundido. 0 pts o esTrampa -> molesto.
// (Sorprendido se dispara por puntaje parcial alto, no por respuesta individual.)
export function calcularEstadoPorRespuesta({ puntaje, esTrampa }) {
  if (esTrampa || puntaje === 0) return ESTADO_MOLESTO;
  if (puntaje >= 60) return ESTADO_FELIZ;
  if (puntaje >= 30) return ESTADO_CONFUNDIDO;
  return ESTADO_IDLE;
}

// Mira el conjunto de respuestas del escenario y devuelve el estado "último"
// del personaje. Prioridad: el de la decisión más reciente (orden de aparición).
// Si no hay respuestas, idle. NO considera la decisión en curso: muestra el
// estado de la última decisión ya resuelta, incluso si el usuario está parado
// en el feedback de la misma.
export function calcularEstadoActual(respuestas, escenario) {
  if (!respuestas || !escenario) return ESTADO_IDLE;
  let ultimoEstado = ESTADO_IDLE;
  for (const fase of escenario.fases) {
    for (const decision of fase.decisiones) {
      const r = respuestas[decision.id];
      if (!r) continue;
      const opcion = decision.opciones?.find((o) => o.id === r.opcionIds?.[0]);
      ultimoEstado = calcularEstadoPorRespuesta({
        puntaje: r.puntaje,
        esTrampa: opcion?.esTrampa ?? false,
      });
    }
  }
  return ultimoEstado;
}

// Estado del personaje EN FUNCIÓN de la decisión en curso. Si la decisión
// todavía no fue resuelta, devuelve idle. Si fue resuelta, devuelve la
// reacción correspondiente. Esto es lo que usamos en el HUD para que el
// emoji "reaccione" a lo que el usuario acaba de hacer.
// También resetea a idle entre decisiones: cuando el usuario avanzo a la
// siguiente decisión sin haber respondido, la cara vuelve a estar neutra.
export function calcularEstadoActualDecision(decision, respuesta) {
  if (!decision || !respuesta) return ESTADO_IDLE;
  const opcion = decision.opciones?.find((o) => o.id === respuesta.opcionIds?.[0]);
  return calcularEstadoPorRespuesta({
    puntaje: respuesta.puntaje,
    esTrampa: opcion?.esTrampa ?? false,
  });
}
