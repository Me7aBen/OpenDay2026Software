import {
  TIEMPO_TOTAL_DEFAULT_SEG,
  calcularPuntajeDecision,
  calcularPuntajeFinal,
  encontrarEpilogo,
} from './gameEngine';

export const estadoInicial = {
  pantalla: 'registro', // registro | seleccion-escenario | jugando | resultado
  jugador: null, // { nombre, colegio }
  escenario: null,
  faseIndex: 0,
  decisionIndex: 0,
  respuestas: {}, // decisionId -> { opcionIds, puntaje, bono, pistaUsada }
  puntajeAcumulado: 0, // decisiones + bonos, sin bono de tiempo (se calcula al final)
  pistasUsadasIds: [],
  tiempoGlobalRestante: TIEMPO_TOTAL_DEFAULT_SEG,
  tiempoFaseRestante: 0,
  resultado: null, // { puntajeDecisiones, puntajeBonos, bonoTiempo, penalizaciones, total, epilogo, tiempoUsadoSeg }
};

export function crearEstadoConEscenario(state, escenario) {
  const primeraFase = escenario.fases[0];
  return {
    ...estadoInicial,
    jugador: state.jugador,
    pantalla: 'jugando',
    escenario,
    faseIndex: 0,
    decisionIndex: 0,
    tiempoGlobalRestante: escenario.tiempoTotalSeg ?? TIEMPO_TOTAL_DEFAULT_SEG,
    tiempoFaseRestante: primeraFase.tiempoSegFase,
  };
}

function faseActual(state) {
  return state.escenario.fases[state.faseIndex];
}

function decisionActual(state) {
  return faseActual(state)?.decisiones[state.decisionIndex];
}

function avanzarPosicion(state) {
  const fase = faseActual(state);
  if (state.decisionIndex + 1 < fase.decisiones.length) {
    return { ...state, decisionIndex: state.decisionIndex + 1 };
  }
  return avanzarFase(state);
}

function avanzarFase(state) {
  const siguienteFaseIndex = state.faseIndex + 1;
  if (siguienteFaseIndex >= state.escenario.fases.length) {
    return terminarPartida(state);
  }
  const siguienteFase = state.escenario.fases[siguienteFaseIndex];
  return {
    ...state,
    faseIndex: siguienteFaseIndex,
    decisionIndex: 0,
    tiempoFaseRestante: siguienteFase.tiempoSegFase,
  };
}

function terminarPartida(state) {
  const resultado = calcularPuntajeFinal(state.escenario, state.respuestas, state.tiempoGlobalRestante);
  const tiempoTotalSeg = state.escenario.tiempoTotalSeg ?? TIEMPO_TOTAL_DEFAULT_SEG;
  const epilogo = encontrarEpilogo(state.escenario, resultado.total);
  return {
    ...state,
    pantalla: 'resultado',
    resultado: {
      ...resultado,
      epilogo,
      tiempoUsadoSeg: tiempoTotalSeg - state.tiempoGlobalRestante,
    },
  };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'REGISTRAR_JUGADOR':
      return { ...state, jugador: action.jugador, pantalla: 'seleccion-escenario' };

    case 'INICIAR_PARTIDA':
      return crearEstadoConEscenario(state, action.escenario);

    case 'RESPONDER_DECISION': {
      const decision = decisionActual(state);
      if (!decision || decision.id !== action.decisionId) return state;
      // Aceptamos un segundo parámetro opcional: puntajeDirecto. Lo usan
      // las decisiones compuestas (arquitectura-nodos) que ya acumularon
      // su puntaje internamente.
      const { puntaje, bono } = calcularPuntajeDecision(decision, action.opcionIds, action.puntajeDirecto);
      const pistaUsada = state.pistasUsadasIds.includes(decision.id);
      const respuesta = { opcionIds: action.opcionIds, puntaje, bono, pistaUsada };
      return {
        ...state,
        respuestas: { ...state.respuestas, [decision.id]: respuesta },
        puntajeAcumulado: state.puntajeAcumulado + puntaje + bono - (pistaUsada ? 20 : 0),
      };
    }

    case 'PEDIR_PISTA': {
      if (state.pistasUsadasIds.includes(action.decisionId)) return state;
      return { ...state, pistasUsadasIds: [...state.pistasUsadasIds, action.decisionId] };
    }

    case 'SIGUIENTE_DECISION':
      return avanzarPosicion(state);

    case 'TICK': {
      if (state.pantalla !== 'jugando') return state;

      const tiempoGlobalRestante = Math.max(0, state.tiempoGlobalRestante - 1);
      if (tiempoGlobalRestante <= 0) {
        return terminarPartida({ ...state, tiempoGlobalRestante: 0 });
      }

      const tiempoFaseRestante = Math.max(0, state.tiempoFaseRestante - 1);
      if (tiempoFaseRestante <= 0) {
        return avanzarFase({ ...state, tiempoGlobalRestante, tiempoFaseRestante: 0 });
      }

      return { ...state, tiempoGlobalRestante, tiempoFaseRestante };
    }

    case 'REINICIAR':
      return { ...estadoInicial };

    default:
      return state;
  }
}
