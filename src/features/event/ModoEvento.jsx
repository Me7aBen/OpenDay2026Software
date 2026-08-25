import { useEffect } from 'react';
import { GameProvider } from '../../engine/GameContext';
import { useGame } from '../../engine/useGame';
import Registro from '../../screens/Registro';
import SeleccionEscenario from '../../screens/SeleccionEscenario';
import PersonalizacionAvatar from '../../screens/PersonalizacionAvatar';
import IntroHistorieta from '../../screens/IntroHistorieta';
import PantallaJuego from '../../screens/PantallaJuego';
import Resultado from '../../screens/Resultado';
import { activarMusica, desactivarMusica } from '../../lib/musica';
import { aplicarMeta } from '../../app/seo';

// MODO EVENTO — la jornada del Open Day, intacta.
//
// Esto es literalmente lo que antes era `App.jsx`: registro por colegio,
// misiones en secuencia, ranking acumulado y epílogo. Se movió a `/evento` sin
// cambiarle el comportamiento, porque sigue siendo útil para colegios y ferias
// (§62) y porque romperlo habría roto las dos misiones que ya funcionaban.
//
// La única diferencia con la versión anterior: ahora vive detrás de una ruta,
// así que la plataforma no lo carga nunca a menos que alguien entre a /evento.

const PANTALLAS = {
  registro: Registro,
  'seleccion-escenario': SeleccionEscenario,
  personalizacion: PersonalizacionAvatar,
  intro: IntroHistorieta,
  jugando: PantallaJuego,
  resultado: Resultado,
};

// Pantallas con música de fondo: desde que arranca la partida hasta el
// resultado. Al volver al registro se corta y el track rebobina.
const PANTALLAS_CON_MUSICA = new Set(['personalizacion', 'intro', 'jugando', 'resultado']);

// Qué pista pedir en cada momento. Sin `presentacion.musica` en el JSON
// devuelve null, que significa "el mp3 de fondo de siempre".
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

  // Se dispara con el cambio de pantalla, que viene de un clic: eso le da al
  // navegador el gesto de usuario que exige para reproducir audio.
  useEffect(() => {
    if (PANTALLAS_CON_MUSICA.has(state.pantalla)) activarMusica(pista);
    else desactivarMusica();
  }, [state.pantalla, pista]);

  // Al salir del modo evento hay que cortar la música: si no, sigue sonando
  // mientras el estudiante navega por la plataforma.
  useEffect(() => () => desactivarMusica(), []);

  return <Pantalla />;
}

export default function ModoEvento() {
  useEffect(() => {
    aplicarMeta({
      titulo: 'Modo evento',
      descripcion: 'Jornada guiada con registro por colegio y ranking, para ferias y visitas escolares.',
      ruta: '/evento',
    });
  }, []);

  return (
    <GameProvider>
      <Juego />
    </GameProvider>
  );
}
