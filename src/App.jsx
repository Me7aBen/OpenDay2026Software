import { Suspense, lazy } from 'react';
import { RouterProvider } from './app/router/Router';
import { coincidir } from './app/router/navegacion';
import { useRuta } from './app/router/useRuta';
import { RUTAS } from './app/router/rutas';
import LayoutPlataforma from './app/layouts/LayoutPlataforma';
import NoEncontrada from './app/pages/NoEncontrada';

// El panel del facilitador no es una pantalla del producto: no tiene jugador,
// no tiene música y no se llega a él navegando. Se entra por
// `?vista=leaderboard`, así que se resuelve antes de montar nada más.
// Se mantiene tal cual estaba: es la herramienta del evento (§62).
const PanelLeaderboard = lazy(() => import('./screens/PanelLeaderboard'));

function esVistaLeaderboard() {
  return new URLSearchParams(window.location.search).get('vista') === 'leaderboard';
}

function Cargando() {
  return (
    <div className="sim-cargando" role="status" aria-live="polite">
      <div className="sim-cargando-barra">
        <span />
      </div>
      <p>Cargando…</p>
    </div>
  );
}

function Contenido() {
  const { ruta } = useRuta();

  for (const definicion of RUTAS) {
    const params = coincidir(definicion.patron, ruta);
    if (!params) continue;
    const Pagina = definicion.componente;
    const pagina = <Pagina params={params} />;
    if (definicion.layout === 'desnudo') return pagina;
    return <LayoutPlataforma>{pagina}</LayoutPlataforma>;
  }

  return (
    <LayoutPlataforma>
      <NoEncontrada />
    </LayoutPlataforma>
  );
}

export default function App() {
  if (esVistaLeaderboard()) {
    return (
      <Suspense fallback={<Cargando />}>
        <PanelLeaderboard />
      </Suspense>
    );
  }

  return (
    <RouterProvider>
      <Suspense fallback={<Cargando />}>
        <Contenido />
      </Suspense>
    </RouterProvider>
  );
}
