import { useState } from 'react';
import { useGame } from '../engine/useGame';
import BotonMusica from './BotonMusica';
import Avatar from './Avatar';
import ComoSeJuega from './ComoSeJuega';
import logoTecsup from '../assets/tecsup-logo.png';
import '../styles/topbar.css';

const URL_CARRERA = 'https://www.tecsup.edu.pe/carrera/diseno-y-desarrollo-de-software-2/';

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
  const [ayudaAbierta, setAyudaAbierta] = useState(false);

  return (
    <div className="topbar">
      <div className="topbar-logo">
        <img src={logoTecsup} alt="Tecsup" width="30" height="30" />
        <span>TECSUP</span>
      </div>

      <div className="topbar-wordmark">
        <div className="word">
          <span style={{ color: 'var(--cyan)' }}>MISIÓN</span> DEPLOY
        </div>
        <div className="tagline">Decidir. Programar. Impactar.</div>
      </div>

      <div className="topbar-right">
        {/* Botón, no enlace: abre el modal de ayuda. Antes era un href a un
            ancla que no existía en ninguna pantalla y por lo tanto no hacía
            nada al clickearlo. */}
        <button type="button" className="topbar-link" onClick={() => setAyudaAbierta(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 3.7" />
            <circle cx="12" cy="17" r="0.3" fill="currentColor" />
          </svg>
          ¿Cómo se juega?
        </button>
        {/* El "Ranking" queda fuera hasta que exista el leaderboard por sesión
            (Supabase). Hoy el ranking solo vive en el localStorage de la PC y
            se muestra al final de la partida. */}
        <a
          className="topbar-link"
          href={URL_CARRERA}
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10 12 5 2 10l10 5 10-5Z" />
            <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
          </svg>
          Sobre la carrera
        </a>

        <BotonMusica />

        {verPerfil && (
          <div className="topbar-profile">
            {/* Si el escenario pidió personalizar personaje, el perfil muestra
                el avatar del jugador. Quien viene de un escenario sin
                personalización (Ccorca) sigue viendo el mismo icono de antes. */}
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
