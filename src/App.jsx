import { useEffect } from 'react';
import { GameProvider } from './engine/GameContext';
import { useGame } from './engine/useGame';
import Registro from './screens/Registro';
import SeleccionEscenario from './screens/SeleccionEscenario';
import PersonalizacionAvatar from './screens/PersonalizacionAvatar';
import IntroHistorieta from './screens/IntroHistorieta';
import PantallaJuego from './screens/PantallaJuego';
import Resultado from './screens/Resultado';
import PanelLeaderboard from './screens/PanelLeaderboard';
import { activarMusica, desactivarMusica } from './lib/musica';

// El panel del facilitador no es una pantalla del juego: no tiene jugador, no
// tiene música y no se llega a él jugando. Se entra por `?vista=leaderboard`,
// así que se resuelve antes de montar el motor del juego.
function esVistaLeaderboard() {
  return new URLSearchParams(window.location.search).get('vista') === 'leaderboard';
}

const PANTALLAS = {
  registro: Registro,
  'seleccion-escenario': SeleccionEscenario,
  personalizacion: PersonalizacionAvatar,
  intro: IntroHistorieta,
  jugando: PantallaJuego,
  resultado: Resultado,
};

// Pantallas con música de fondo: desde que arranca la partida (al elegir el
// escenario se pasa a 'personalizacion' o a 'jugando') hasta el resultado. Al
// volver al registro se corta y el track rebobina para la próxima partida.
const PANTALLAS_CON_MUSICA = new Set(['personalizacion', 'intro', 'jugando', 'resultado']);

// Qué pista pedir en cada momento.
//
// Sin `presentacion.musica` en el JSON devuelve null, y null significa "el mp3
// de fondo de siempre": es lo que hacen Ccorca v1 y v2, cuya música no cambió.
//
// Con él, la pista sale de la fase actual (`fase.musica`), que es lo que hace
// que la banda sonora siga a la historia sin que nadie tenga que orquestarla
// desde un componente.
function pistaDeseada(state) {
  const musica = state.escenario?.presentacion?.musica;
  if (!musica) return null;
  if (state.pantalla === 'resultado') return musica.final ?? musica.porDefecto ?? null;
  if (state.pantalla === 'personalizacion' || state.pantalla === 'intro') {
    return musica.intro ?? musica.porDefecto ?? null;
  }
  const fase = state.escenario?.fases?.[state.faseIndex];
  return fase?.musica ?? musica.porDefecto ?? null;
}

function Juego() {
  const { state } = useGame();
  const Pantalla = PANTALLAS[state.pantalla];
  const pista = pistaDeseada(state);

  // Se dispara con el cambio de pantalla, que viene del clic en "ELEGIR
  // ESCENARIO": eso le da al navegador el gesto de usuario que exige para
  // reproducir audio. Cambiar de fase cambia `pista` y con eso la música, sin
  // cortar nada si la pista es la misma.
  useEffect(() => {
    if (PANTALLAS_CON_MUSICA.has(state.pantalla)) activarMusica(pista);
    else desactivarMusica();
  }, [state.pantalla, pista]);

  return <Pantalla />;
}

export default function App() {
  if (esVistaLeaderboard()) return <PanelLeaderboard />;

  return (
    <GameProvider>
      <Juego />
    </GameProvider>
  );
}
