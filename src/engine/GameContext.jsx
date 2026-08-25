import { useEffect, useReducer, useRef } from 'react';
import { gameReducer, estadoInicial } from './gameReducer';
import { GameContext } from './gameContextObject';

// `estadoSemilla` permite montar el motor ya arrancado en una simulación
// concreta, que es lo que hace la plataforma vocacional al entrar por URL a
// /simulaciones/:slug/jugar. Sin él, el provider arranca en el registro del
// evento, como siempre.
export function GameProvider({ children, estadoSemilla = estadoInicial }) {
  const [state, dispatch] = useReducer(gameReducer, estadoSemilla);
  const intervalRef = useRef(null);
  const sinReloj = state.escenario?.presentacion?.temporizador === false;

  useEffect(() => {
    if (state.pantalla !== 'jugando' || sinReloj) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(intervalRef.current);
  }, [state.pantalla, sinReloj]);

  const api = {
    state,
    registrarJugador: (jugador) => dispatch({ type: 'REGISTRAR_JUGADOR', jugador }),
    iniciarPartida: (escenario) => dispatch({ type: 'INICIAR_PARTIDA', escenario }),
    iniciarSimulacionLibre: (escenario) =>
      dispatch({ type: 'INICIAR_SIMULACION_LIBRE', escenario }),
    confirmarAvatar: (avatar) => dispatch({ type: 'CONFIRMAR_AVATAR', avatar }),
    comenzarPartida: () => dispatch({ type: 'COMENZAR_PARTIDA' }),
    responderDecision: (decisionId, opcionIds, puntajeDirecto) =>
      dispatch({ type: 'RESPONDER_DECISION', decisionId, opcionIds, puntajeDirecto }),
    pedirPista: (decisionId) => dispatch({ type: 'PEDIR_PISTA', decisionId }),
    siguienteDecision: () => dispatch({ type: 'SIGUIENTE_DECISION' }),
    volverAMisiones: () => dispatch({ type: 'VOLVER_A_MISIONES' }),
    reiniciar: () => dispatch({ type: 'REINICIAR' }),
  };

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}
