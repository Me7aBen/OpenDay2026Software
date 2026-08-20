import { useGame } from '../engine/useGame';
import BotonMusica from './BotonMusica';
import '../styles/topbar.css';

// Barra superior, presente en todas las pantallas.
//
// El perfil de la derecha sale del estado del juego (`state.jugador`), no de
// props: así se actualiza solo en cuanto el jugador se registra y no hay que
// ir pantalla por pantalla pasándole el nombre. Antes cada pantalla mandaba el
// colegio a mano — dos de ellas con un string fijo — y el nombre no se mostraba
// en ninguna, así que el perfil recién parecía correcto en el resultado.
//
// Si todavía no hay jugador (pantalla de registro), el bloque no se muestra.
//
// Props:
//   mostrarPerfil  boolean - para ocultarlo aunque haya jugador
export default function TopBar({ mostrarPerfil = true }) {
  const { state } = useGame();
  const jugador = state.jugador;
  const verPerfil = mostrarPerfil && !!jugador;

  return (
    <div className="topbar">
      <div className="topbar-logo">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="13" fill="var(--tecsup)" />
          <circle cx="15" cy="9" r="2.6" fill="#0b1220" />
          <circle cx="9.5" cy="17" r="2.6" fill="#0b1220" />
          <circle cx="20.5" cy="17" r="2.6" fill="#0b1220" />
        </svg>
        <span>TECSUP</span>
      </div>

      <div className="topbar-wordmark">
        <div className="word">
          <span style={{ color: 'var(--cyan)' }}>MISIÓN</span> DEPLOY
        </div>
        <div className="tagline">Decidir. Programar. Impactar.</div>
      </div>

      <div className="topbar-right">
        <a className="topbar-link" href="#como-se-juega">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 3.7" />
            <circle cx="12" cy="17" r="0.3" fill="currentColor" />
          </svg>
          ¿Cómo se juega?
        </a>
        <a className="topbar-link" href="#ranking">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 21h8M12 17v4M6 4h12v5a6 6 0 0 1-12 0V4Z" />
            <path d="M6 6H3a3 3 0 0 0 3 5M18 6h3a3 3 0 0 1-3 5" />
          </svg>
          Ranking
        </a>
        <a className="topbar-link" href="#sobre-la-carrera">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10 12 5 2 10l10 5 10-5Z" />
            <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
          </svg>
          Sobre la carrera
        </a>

        <BotonMusica />

        {verPerfil && (
          <div className="topbar-profile">
            <div className="avatar">🧑</div>
            <div className="meta">
              <div className="nombre" title={jugador.nombre}>{jugador.nombre}</div>
              <div className="colegio" title={jugador.colegio}>{jugador.colegio}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
