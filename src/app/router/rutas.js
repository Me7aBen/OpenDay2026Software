import { lazy } from 'react';

// Tabla de rutas. El orden importa: gana la primera que coincide.
//
// TODO lo pesado va con `lazy()` (§57). En la práctica eso significa que la
// home descarga la home y nada más: ni el motor de simulación, ni los
// minijuegos, ni los JSON de escenario, ni el pixel art de Ccorca. El chunk de
// una simulación se pide recién cuando el estudiante entra a ella.
//
// `layout: 'plataforma'` envuelve la página con header/nav/footer.
// `layout: 'desnudo'` la deja a pantalla completa: es lo que necesitan la
// simulación en curso y el modo evento, que tienen su propio HUD.

export const RUTAS = [
  {
    patron: '/',
    layout: 'plataforma',
    componente: lazy(() => import('../../features/home/pages/HomePage')),
  },
  {
    patron: '/carreras',
    layout: 'plataforma',
    componente: lazy(() => import('../../features/careers/pages/CarrerasPage')),
  },
  {
    patron: '/carreras/:slug',
    layout: 'plataforma',
    componente: lazy(() => import('../../features/careers/pages/CarreraDetallePage')),
  },
  {
    patron: '/simulaciones',
    layout: 'plataforma',
    componente: lazy(() => import('../../features/simulations/pages/SimulacionesPage')),
  },
  {
    patron: '/simulaciones/:slug',
    layout: 'plataforma',
    componente: lazy(() => import('../../features/simulations/pages/SimulacionDetallePage')),
  },
  {
    // La simulación en curso ocupa la pantalla completa: su HUD ya trae su
    // propia barra y su propio pie.
    patron: '/simulaciones/:slug/jugar',
    layout: 'desnudo',
    componente: lazy(() => import('../../features/simulations/pages/JugarSimulacionPage')),
  },
  {
    patron: '/aprender',
    layout: 'plataforma',
    componente: lazy(() => import('../../features/learning/pages/AprenderPage')),
  },
  {
    patron: '/aprender/:slug',
    layout: 'plataforma',
    componente: lazy(() => import('../../features/learning/pages/CursoDetallePage')),
  },
  {
    patron: '/mi-exploracion',
    layout: 'plataforma',
    componente: lazy(() => import('../../features/exploration/pages/MiExploracionPage')),
  },
  {
    patron: '/comparar',
    layout: 'plataforma',
    componente: lazy(() => import('../../features/compare/pages/CompararPage')),
  },
  {
    // EVENT MODE (§62): la jornada completa del Open Day sigue viva y entera
    // acá, con su registro por colegio, su secuencia obligatoria y su ranking.
    // No se eliminó nada; se movió a su propia ruta y se sacó de la navegación
    // principal, porque un estudiante que explora carreras no debería ver un
    // ranking donde va puesto 500.
    patron: '/evento',
    layout: 'desnudo',
    componente: lazy(() => import('../../features/event/ModoEvento')),
  },
];
