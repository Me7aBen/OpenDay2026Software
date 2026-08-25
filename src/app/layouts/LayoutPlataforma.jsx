import { useState } from 'react';
import { Enlace } from '../router/Router';
import { useRuta } from '../router/useRuta';
import { APP_NAME, APP_TAGLINE, APP_LOGO } from '../../config/marca';
import { useExploracion } from '../../features/exploration/useExploracion';
import '../../styles/plataforma.css';

// Marco de la plataforma: header, navegación y pie.
//
// La simulación NO usa este layout — vive a pantalla completa con su propio HUD
// pixel art (§6: la plataforma se ve como un producto, el juego se ve como un
// juego).

function Logo({ tam = 28 }) {
  return (
    <svg
      width={tam}
      height={tam}
      viewBox={APP_LOGO.viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {APP_LOGO.trazos.map((trazo, i) =>
        trazo.tipo === 'circulo' ? (
          <circle key={i} cx={trazo.cx} cy={trazo.cy} r={trazo.r} />
        ) : (
          <path key={i} d={trazo.d} />
        ),
      )}
    </svg>
  );
}

const NAV = [
  { to: '/carreras', texto: 'Carreras', icono: '🎓' },
  { to: '/simulaciones', texto: 'Simulaciones', icono: '🎮' },
  { to: '/aprender', texto: 'Aprender', icono: '📘' },
  { to: '/mi-exploracion', texto: 'Mi exploración', icono: '⭐' },
];

function activa(ruta, to) {
  return ruta === to || ruta.startsWith(`${to}/`);
}

export default function LayoutPlataforma({ children }) {
  const { ruta } = useRuta();
  const exploracion = useExploracion();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const guardadas = exploracion.carrerasGuardadas.length;

  // Cambiar de página cierra el menú: en móvil quedaba abierto tapando la
  // pantalla nueva. Se ajusta DURANTE el render comparando con la ruta previa
  // (el patrón que recomienda React) en vez de con un efecto, que dispararía un
  // render en cascada en cada navegación.
  const [rutaPrevia, setRutaPrevia] = useState(ruta);
  if (rutaPrevia !== ruta) {
    setRutaPrevia(ruta);
    setMenuAbierto(false);
  }

  return (
    <div className="pf">
      <a className="pf-saltar" href="#contenido">
        Saltar al contenido
      </a>

      <header className="pf-header">
        <div className="pf-header-fila">
          <Enlace to="/" className="pf-marca" aria-label={`${APP_NAME} — inicio`}>
            <span className="pf-marca-logo">
              <Logo />
            </span>
            <span className="pf-marca-texto">
              <span className="pf-marca-nombre">{APP_NAME}</span>
              <span className="pf-marca-tagline">{APP_TAGLINE}</span>
            </span>
          </Enlace>

          <nav className="pf-nav-desktop" aria-label="Navegación principal">
            {NAV.map((item) => (
              <Enlace
                key={item.to}
                to={item.to}
                className={`pf-nav-link${activa(ruta, item.to) ? ' activo' : ''}`}
                aria-current={activa(ruta, item.to) ? 'page' : undefined}
              >
                {item.texto}
                {item.to === '/mi-exploracion' && guardadas > 0 && (
                  <span className="pf-badge">{guardadas}</span>
                )}
              </Enlace>
            ))}
          </nav>

          <button
            type="button"
            className="pf-menu-boton"
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            onClick={() => setMenuAbierto((v) => !v)}
          >
            <span className="pf-menu-icono" aria-hidden="true">
              {menuAbierto ? '✕' : '☰'}
            </span>
            <span className="pf-sr">{menuAbierto ? 'Cerrar menú' : 'Abrir menú'}</span>
          </button>
        </div>

        {menuAbierto && (
          <nav id="menu-movil" className="pf-nav-movil" aria-label="Navegación">
            {NAV.map((item) => (
              <Enlace
                key={item.to}
                to={item.to}
                className={`pf-nav-movil-link${activa(ruta, item.to) ? ' activo' : ''}`}
              >
                <span aria-hidden="true">{item.icono}</span>
                {item.texto}
              </Enlace>
            ))}
            <Enlace to="/comparar" className="pf-nav-movil-link">
              <span aria-hidden="true">⚖️</span>
              Comparar carreras
            </Enlace>
          </nav>
        )}
      </header>

      <main id="contenido" className="pf-main">
        {children}
      </main>

      <footer className="pf-footer">
        <div className="pf-footer-marca">
          <Logo tam={22} />
          <div>
            <div className="pf-footer-nombre">{APP_NAME}</div>
            <div className="pf-footer-tagline">{APP_TAGLINE}</div>
          </div>
        </div>
        <nav className="pf-footer-nav" aria-label="Pie de página">
          <Enlace to="/carreras">Carreras</Enlace>
          <Enlace to="/simulaciones">Simulaciones</Enlace>
          <Enlace to="/aprender">Aprender</Enlace>
          <Enlace to="/comparar">Comparar</Enlace>
        </nav>
        <p className="pf-footer-nota">
          Plataforma de exploración vocacional para estudiantes. La información de carreras es
          contenido orientativo, no reemplaza la información oficial de cada institución.
        </p>
      </footer>
    </div>
  );
}
