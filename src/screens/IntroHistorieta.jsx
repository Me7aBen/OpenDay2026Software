import { useGame } from '../engine/useGame';
import TopBar from '../ui/TopBar';
import HistorietaPixel from '../ui/HistorietaPixel';
import '../styles/intro-historieta.css';
import { APP_NAME, APP_TAGLINE } from '../config/marca';

// Historieta de apertura del escenario: lo que pasa ANTES de la primera fase.
//
// Se muestra entre la personalización y la partida, y solo si el escenario
// declara `presentacion.historietaIntro`. El reloj de la partida todavía no
// corre acá (el TICK del motor solo avanza en 'jugando'), así que leer la
// introducción no le cuesta tiempo a nadie.

export default function IntroHistorieta() {
  const { state, comenzarPartida } = useGame();
  const { escenario, jugador } = state;
  const paneles = escenario?.presentacion?.historietaIntro ?? [];

  return (
    <div className="intro">
      <TopBar />
      <div className="intro-cuerpo">
        <HistorietaPixel
          paneles={paneles}
          avatar={jugador?.avatar}
          textoBoton={escenario?.presentacion?.textoBotonIntro ?? 'ENTRAR A LA RED'}
          onTerminar={comenzarPartida}
        />
      </div>
      <div className="intro-footer">
        <span>{APP_NAME}</span>
        <span>{APP_TAGLINE}</span>
      </div>
    </div>
  );
}
