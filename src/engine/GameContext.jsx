import { useEffect, useReducer, useRef } from 'react';
import { gameReducer, estadoInicial } from './gameReducer';
import { GameContext } from './gameContextObject';

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, estadoInicial);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (state.pantalla !== 'jugando') {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(intervalRef.current);
  }, [state.pantalla]);

  const api = {
    state,
    registrarJugador: (jugador) => dispatch({ type: 'REGISTRAR_JUGADOR', jugador }),
    iniciarPartida: (escenario) => dispatch({ type: 'INICIAR_PARTIDA', escenario }),
    responderDecision: (decisionId, opcionIds, puntajeDirecto) =>
      dispatch({ type: 'RESPONDER_DECISION', decisionId, opcionIds, puntajeDirecto }),
    pedirPista: (decisionId) => dispatch({ type: 'PEDIR_PISTA', decisionId }),
    siguienteDecision: () => dispatch({ type: 'SIGUIENTE_DECISION' }),
    reiniciar: () => dispatch({ type: 'REINICIAR' }),
  };

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}
