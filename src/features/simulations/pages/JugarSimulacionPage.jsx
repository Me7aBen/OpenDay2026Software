import { useEffect, useMemo, useState } from 'react';
import { GameProvider } from '../../../engine/GameContext';
import { useGame } from '../../../engine/useGame';
import { gameReducer, estadoInicial } from '../../../engine/gameReducer';
import { aplicarMeta } from '../../../app/seo';
import { useRuta } from '../../../app/router/useRuta';
import { simulacionPorSlug, cargarEscenario } from '../catalogo';
import PantallaJuego from '../../../screens/PantallaJuego';
import PersonalizacionAvatar from '../../../screens/PersonalizacionAvatar';
import IntroHistorieta from '../../../screens/IntroHistorieta';
import ResultadoSimulacion from './ResultadoSimulacion';
import NoEncontrada from '../../../app/pages/NoEncontrada';
import '../../../styles/simulacion-shell.css';

// Ruta de juego: /simulaciones/:slug/jugar
//
// Acá se monta el MOTOR DE SIEMPRE, sin tocarlo. Lo único distinto es cómo
// arranca (modo libre, sin registro ni ranking) y cómo termina (una pantalla de
// resultado propia). Por eso Código Cero y Luz para Ccorca se pueden jugar
// desde la plataforma sin haber cambiado una línea de su contenido.
//
// El JSON del escenario llega por import dinámico, así que ni la home ni el
// catálogo lo descargan (§57).

const PANTALLAS = {
  personalizacion: PersonalizacionAvatar,
  intro: IntroHistorieta,
  jugando: PantallaJuego,
};

function Sesion({ simulacion, onReiniciar }) {
  const { state } = useGame();

  if (state.pantalla === 'resultado') {
    return <ResultadoSimulacion simulacion={simulacion} onReintentar={onReiniciar} />;
  }

  const Pantalla = PANTALLAS[state.pantalla];
  if (!Pantalla) return null;
  return <Pantalla />;
}

export default function JugarSimulacionPage({ params }) {
  const simulacion = simulacionPorSlug(params.slug);
  const { navegar } = useRuta();
  // Se guarda el escenario JUNTO con el slug al que pertenece. Así, cuando la
  // ruta cambia de una simulación a otra sin cambiar de patrón, el escenario
  // viejo deja de considerarse cargado por derivación, sin necesidad de
  // limpiarlo desde un efecto (que dispara renders en cascada).
  const [cargado, setCargado] = useState(null); // { slug, escenario } | { slug, error }
  // Cambiar esta llave remonta el motor entero: es el "volver a intentarlo"
  // del final, y garantiza que no quede ningún estado de la partida anterior.
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!simulacion) return undefined;
    aplicarMeta({
      titulo: `Jugar ${simulacion.titulo}`,
      descripcion: simulacion.descripcion,
      ruta: `/simulaciones/${simulacion.slug}/jugar`,
    });
    let vivo = true;
    cargarEscenario(simulacion)
      .then((datos) => vivo && setCargado({ slug: simulacion.slug, escenario: datos }))
      .catch(() => vivo && setCargado({ slug: simulacion.slug, error: true }));
    return () => {
      vivo = false;
    };
  }, [simulacion]);

  const listo = cargado?.slug === simulacion?.slug ? cargado : null;
  const escenario = listo?.escenario ?? null;
  const error = !!listo?.error;

  const semilla = useMemo(() => {
    if (!escenario) return null;
    return gameReducer(estadoInicial, { type: 'INICIAR_SIMULACION_LIBRE', escenario });
    // `intento` fuerza una semilla nueva al reintentar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escenario, intento]);

  if (!simulacion) return <NoEncontrada mensaje="No encontramos esa simulación." />;

  if (error) {
    return (
      <div className="sim-cargando">
        <p>No pudimos cargar esta simulación.</p>
        <button
          type="button"
          className="pf-boton"
          onClick={() => navegar(`/simulaciones/${simulacion.slug}`)}
        >
          Volver
        </button>
      </div>
    );
  }

  if (!semilla) {
    return (
      <div className="sim-cargando" role="status">
        <div className="sim-cargando-barra">
          <span />
        </div>
        <p>Cargando {simulacion.titulo}…</p>
      </div>
    );
  }

  return (
    <div className="sim-shell">
      {/* La llave incluye la simulación: montar otra simulación tiene que
          crear un motor nuevo, no reutilizar el reducer de la anterior. */}
      <GameProvider key={`${simulacion.id}-${intento}`} estadoSemilla={semilla}>
        <Sesion simulacion={simulacion} onReiniciar={() => setIntento((n) => n + 1)} />
      </GameProvider>
    </div>
  );
}
