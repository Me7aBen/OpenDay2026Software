import { useEffect } from 'react';
import { GameProvider } from './engine/GameContext';
import { useGame } from './engine/useGame';
import Registro from './screens/Registro';
import SeleccionEscenario from './screens/SeleccionEscenario';
import PantallaJuego from './screens/PantallaJuego';
import Resultado from './screens/Resultado';
import { activarMusica, desactivarMusica } from './lib/musica';

const PANTALLAS = {
  registro: Registro,
  'seleccion-escenario': SeleccionEscenario,
  jugando: PantallaJuego,
  resultado: Resultado,
};

// Pantallas con música de fondo: desde que arranca la partida (al elegir el
// escenario se pasa a 'jugando') hasta el resultado. Al volver al registro se
// corta y el track rebobina para la próxima partida.
const PANTALLAS_CON_MUSICA = new Set(['jugando', 'resultado']);

function Juego() {
  const { state } = useGame();
  const Pantalla = PANTALLAS[state.pantalla];

  // Se dispara con el cambio de pantalla, que viene del clic en "ELEGIR
  // ESCENARIO": eso le da al navegador el gesto de usuario que exige para
  // reproducir audio.
  useEffect(() => {
    if (PANTALLAS_CON_MUSICA.has(state.pantalla)) activarMusica();
    else desactivarMusica();
  }, [state.pantalla]);

  return <Pantalla />;
}

export default function App() {
  return (
    <GameProvider>
      <Juego />
    </GameProvider>
  );
}
