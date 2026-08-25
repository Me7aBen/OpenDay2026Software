import { useState } from 'react';
import { useGame } from '../engine/useGame';
import BotonMusica from './BotonMusica';
import Avatar from './Avatar';
import ComoSeJuega from './ComoSeJuega';
import { Enlace } from '../app/router/Router';
import { APP_NAME, APP_TAGLINE, APP_LOGO } from '../config/marca';
import '../styles/topbar.css';

// Barra superior de las pantallas de juego.
//
// Antes mostraba el logo y el nombre de la institución del evento, más un
// enlace externo a una carrera concreta. La plataforma es de otra cosa: el
// logo ahora sale de `config/marca.js` (§7, §8) y el enlace vuelve al catálogo
// de la propia plataforma, que es a donde el estudiante quiere ir cuando sale
// de una simulación.
//
// El perfil de la derecha sale del estado del juego (`state.jugador`), no de
// props: así se actualiza solo en cuanto el jugador se registra. Si todavía no
// hay jugador (pantalla de registro del modo evento), el bloque no se muestra.
//
// Props:
//   mostrarPerfil  boolean - para ocultarlo aunque haya jugador

function LogoMarca() {
  return (
    <svg
      width="26"
      height="26"
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

export default function TopBar({ mostrarPerfil = true }) {
  const { state } = useGame();
  const jugador = state.jugador;
  // En modo libre no hay registro ni colegio: el "perfil" del evento no aplica.
  const verPerfil = mostrarPerfil && !!jugador && state.modo !== 'libre';
  const [ayudaAbierta, setAyudaAbierta] = useState(false);

  return (
    <div className="topbar">
      <Enlace to="/" className="topbar-logo" aria-label={`${APP_NAME} — inicio`}>
        <LogoMarca />
        <span>{APP_NAME}</span>
      </Enlace>

      {/* El centro de la barra es la SIMULACIÓN en curso, no la marca: la
          marca ya está a la izquierda y repetirla dos veces se veía como un
          error. Sin escenario (tablero de misiones del evento) queda el
          eslogan solo. */}
      <div className="topbar-wordmark">
        {state.escenario ? (
          <>
            <div className="word">{state.escenario.titulo}</div>
            <div className="tagline">{state.escenario.cliente.nombre} · {state.escenario.cliente.rol}</div>
          </>
        ) : (
          <div className="tagline">{APP_TAGLINE}</div>
        )}
      </div>

      <div className="topbar-right">
        <button type="button" className="topbar-link" onClick={() => setAyudaAbierta(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 3.7" />
            <circle cx="12" cy="17" r="0.3" fill="currentColor" />
          </svg>
          ¿Cómo se juega?
        </button>

        <Enlace className="topbar-link" to="/carreras">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10 12 5 2 10l10 5 10-5Z" />
            <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
          </svg>
          Ver carreras
        </Enlace>

        <BotonMusica />

        {verPerfil && (
          <div className="topbar-profile">
            <div className={`avatar${jugador.avatar ? ' con-pixel' : ''}`}>
              {jugador.avatar ? <Avatar avatar={jugador.avatar} tam={26} /> : '🧑'}
            </div>
            <div className="meta">
              <div className="nombre" title={jugador.nombre}>{jugador.nombre}</div>
              <div className="colegio" title={jugador.colegio}>{jugador.colegio}</div>
            </div>
          </div>
        )}
      </div>

      <ComoSeJuega abierto={ayudaAbierta} onCerrar={() => setAyudaAbierta(false)} />
    </div>
  );
}
