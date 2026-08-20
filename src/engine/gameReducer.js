import {
  TIEMPO_TOTAL_DEFAULT_SEG,
  calcularPuntajeDecision,
  calcularPuntajeFinal,
  encontrarEpilogo,
} from './gameEngine';
import { calcularPerfil } from '../lib/perfilVocacional';

export const estadoInicial = {
  // registro | seleccion-escenario | personalizacion | intro | jugando | resultado
  pantalla: 'registro',
  jugador: null, // { nombre, colegio, numeroColegio, avatar? }
  // Misiones que este alumno ya terminó en la jornada:
  //   { [escenarioId]: { puntaje, tiempoSeg } }
  // Sobrevive al fin de cada misión (no lo limpia INICIAR_PARTIDA) porque el
  // ranking es la suma de todas. Solo REINICIAR lo borra, que es "siguiente
  // alumno en esta PC".
  completadas: {},
  escenario: null,
  faseIndex: 0,
  decisionIndex: 0,
  respuestas: {}, // decisionId -> { opcionIds, puntaje, bono, pistaUsada }
  puntajeAcumulado: 0, // decisiones + bonos, sin bono de tiempo (se calcula al final)
  pistasUsadasIds: [],
  tiempoGlobalRestante: TIEMPO_TOTAL_DEFAULT_SEG,
  tiempoFaseRestante: 0,
  // Medidor narrativo opcional (ej. "CIUDAD RECUPERADA"). Solo lo mueven los
  // escenarios que declaran `presentacion.indicadorGlobal` y `hitoIndicador`
  // en sus decisiones; para el resto queda en 0 y nadie lo mira.
  indicadorValor: 0,
  resultado: null, // { ...puntajes, epilogo, tiempoUsadoSeg, perfil }
};

export function crearEstadoConEscenario(state, escenario) {
  const primeraFase = escenario.fases[0];
  // Si el escenario pide personalizar al personaje, esa pantalla va primero.
  // El reloj no corre ahí (ver GameContext: solo tickea en 'jugando'), así que
  // elegir avatar no le cuesta tiempo de partida a nadie.
  const pideAvatar = !!escenario.presentacion?.personalizacionAvatar;
  const hayIntro = !!escenario.presentacion?.historietaIntro?.length;
  return {
    ...estadoInicial,
    jugador: state.jugador,
    // El progreso de la jornada se arrastra entre misiones: arrancar la misión 2
    // no borra lo que sumó la 1.
    completadas: state.completadas,
    pantalla: pideAvatar ? 'personalizacion' : hayIntro ? 'intro' : 'jugando',
    escenario,
    faseIndex: 0,
    decisionIndex: 0,
    tiempoGlobalRestante: escenario.tiempoTotalSeg ?? TIEMPO_TOTAL_DEFAULT_SEG,
    tiempoFaseRestante: primeraFase.tiempoSegFase,
    indicadorValor: escenario.presentacion?.indicadorGlobal?.inicial ?? 0,
  };
}

function faseActual(state) {
  return state.escenario.fases[state.faseIndex];
}

function decisionActual(state) {
  return faseActual(state)?.decisiones[state.decisionIndex];
}

function respuestaCumpleObjetivo(decision, opcionIds) {
  if (decision.tipoInteraccion === 'seleccion-unica') {
    const elegida = decision.opciones?.find((opcion) => opcion.id === opcionIds[0]);
    if (!elegida) return false;
    if (elegida.esCorrecta === true) return true;
    if (decision.opciones?.some((opcion) => opcion.esCorrecta === true)) return false;
    const maximo = Math.max(...decision.opciones.map((opcion) => opcion.puntaje ?? 0));
    return maximo > 0 && (elegida.puntaje ?? 0) === maximo;
  }

  if (decision.tipoInteraccion === 'seleccion-multiple') {
    const objetivo = decision.seleccionExacta ?? opcionIds.length;
    return opcionIds.length === objetivo && opcionIds.every((id) => (
      decision.opciones?.find((opcion) => opcion.id === id)?.esCorrecta === true
    ));
  }

  // Los minijuegos de código, circuito e intruso solo llaman onElegir cuando
  // se completó su objetivo; sus errores ya se descuentan en el puntaje.
  return true;
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
  const tiempoUsadoSeg = tiempoTotalSeg - state.tiempoGlobalRestante;
  return {
    ...state,
    pantalla: 'resultado',
    // La misión queda anotada acá, y de acá sale el total del ranking. Se
    // registra al terminar, no al guardar en el leaderboard, así que el total en
    // pantalla es correcto incluso sin red.
    completadas: {
      ...state.completadas,
      [state.escenario.id]: { puntaje: resultado.total, tiempoSeg: tiempoUsadoSeg },
    },
    resultado: {
      ...resultado,
      epilogo,
      tiempoUsadoSeg,
      // null salvo que el escenario declare `presentacion.perfiles`.
      perfil: calcularPerfil(state.escenario, state.respuestas),
    },
  };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'REGISTRAR_JUGADOR':
      return { ...state, jugador: action.jugador, pantalla: 'seleccion-escenario' };

    case 'INICIAR_PARTIDA':
      return crearEstadoConEscenario(state, action.escenario);

    // Cierra la pantalla de personalización y arranca la partida. Solo la
    // disparan los escenarios que la pidieron; el avatar se guarda dentro de
    // `jugador` como campo opcional, así que quien no lo tiene sigue siendo un
    // jugador válido para todo el resto del motor.
    case 'CONFIRMAR_AVATAR':
      return {
        ...state,
        jugador: { ...state.jugador, avatar: action.avatar },
        // Tras el avatar viene la historieta de apertura, si el escenario la
        // declara. Si no, se entra directo a jugar.
        pantalla: state.escenario?.presentacion?.historietaIntro?.length ? 'intro' : 'jugando',
      };

    // Cierra la historieta de apertura y arranca el reloj de la partida.
    case 'COMENZAR_PARTIDA':
      return { ...state, pantalla: 'jugando' };

    case 'RESPONDER_DECISION': {
      const decision = decisionActual(state);
      if (!decision || decision.id !== action.decisionId) return state;
      // Aceptamos un segundo parámetro opcional: puntajeDirecto. Lo usan
      // las decisiones compuestas (arquitectura-nodos) que ya acumularon
      // su puntaje internamente.
      const { puntaje, bono } = calcularPuntajeDecision(decision, action.opcionIds, action.puntajeDirecto);
      const pistaUsada = state.pistasUsadasIds.includes(decision.id);
      const respuesta = { opcionIds: action.opcionIds, puntaje, bono, pistaUsada };
      // Una respuesta incorrecta deja continuar la historia, pero no puede
      // pintar el medidor como si hubiera recuperado la ciudad. El hito solo
      // se alcanza cuando la decisión cumple su objetivo.
      const hito = respuestaCumpleObjetivo(decision, action.opcionIds)
        ? decision.hitoIndicador
        : null;
      return {
        ...state,
        respuestas: { ...state.respuestas, [decision.id]: respuesta },
        puntajeAcumulado: state.puntajeAcumulado + puntaje + bono - (pistaUsada ? 20 : 0),
        indicadorValor:
          typeof hito === 'number' ? Math.max(state.indicadorValor, hito) : state.indicadorValor,
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

    // Vuelve al tablero de misiones manteniendo al alumno y su progreso. Es lo
    // que dispara "SIGUIENTE MISIÓN" al terminar una: la jornada continúa, no
    // se empieza de cero.
    case 'VOLVER_A_MISIONES':
      return {
        ...estadoInicial,
        jugador: state.jugador,
        completadas: state.completadas,
        pantalla: 'seleccion-escenario',
      };

    // Siguiente alumno en esta PC: borra todo, incluido el progreso.
    case 'REINICIAR':
      return { ...estadoInicial };

    default:
      return state;
  }
}
