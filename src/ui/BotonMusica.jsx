import { useSyncExternalStore } from 'react';
import { alternarSilencio, estadoMusica, suscribirMusica } from '../lib/musica';

// Botón de silencio de la música de fondo, en la barra superior.
//
// Se muestra solo cuando hay música que silenciar: durante la partida y si el
// archivo de audio existe. En el registro no aparece, y si el equipo nunca puso
// el mp3 tampoco (así no queda un control que no hace nada).
//
// El estado vive fuera de React (src/lib/musica.js), por eso se lee con
// useSyncExternalStore en lugar de useState.
export default function BotonMusica() {
  const { disponible, silenciada, activa } = useSyncExternalStore(
    suscribirMusica,
    estadoMusica,
  );

  if (!disponible || !activa) return null;

  return (
    <button
      type="button"
      className="topbar-musica"
      onClick={alternarSilencio}
      aria-pressed={silenciada}
      title={silenciada ? 'Activar música' : 'Silenciar música'}
      aria-label={silenciada ? 'Activar música' : 'Silenciar música'}
    >
      {silenciada ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <path d="m17 9 4 6M21 9l-4 6" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      )}
    </button>
  );
}
