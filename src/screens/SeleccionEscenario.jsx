import { useGame } from '../engine/useGame';
import { estadoMisiones, puntajeTotal } from '../engine/misiones';
import { ESCENARIOS, PORTADA_DEFECTO } from '../content/catalogo';
import TopBar from '../ui/TopBar';
import '../styles/seleccion.css';
import { APP_NAME, APP_TAGLINE } from '../config/marca';

export default function SeleccionEscenario() {
  const { state, iniciarPartida } = useGame();
  const misiones = estadoMisiones(ESCENARIOS, state.completadas);
  const total = puntajeTotal(state.completadas);
  const hechas = Object.keys(state.completadas).length;

  return (
    <div className="seleccion">
      <TopBar />

      <div className="seleccion-cuerpo">
        <div className="seleccion-encabezado">
          <div className="titulo">
            {hechas === 0 ? 'Tu primera misión' : 'Sigue tu jornada'}
          </div>
          <div className="subtitulo">
            {hechas === 0
              ? 'Las misiones se juegan en orden: termina la primera y se abre la siguiente. Al final se suman las dos.'
              : `Llevas ${total} puntos sumados en ${hechas} de ${misiones.length} misiones.`}
          </div>
        </div>

        <div className="seleccion-escenarios">
          {misiones.map(({ escenario, estado, numero, resultado }) => {
            const portada = escenario.portada ?? PORTADA_DEFECTO;
            const bloqueada = estado === 'bloqueada';
            const completada = estado === 'completada';
            return (
              <div
                className={`seleccion-card ${bloqueada || completada ? 'bloqueada' : 'disponible'}`}
                key={escenario.id}
              >
                <div className="portada" style={{ background: portada.fondo }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={portada.color} strokeWidth="1.6">
                    {bloqueada ? (
                      <>
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                      </>
                    ) : (
                      portada.icono
                    )}
                  </svg>
                </div>
                <div>
                  <div className="etiqueta" style={{ color: portada.color }}>
                    MISIÓN {numero} · {escenario.etiqueta}
                  </div>
                  <div className="titulo">{escenario.titulo}</div>
                  <div className="dolor">
                    {bloqueada
                      ? 'Se abre cuando termines la misión anterior.'
                      : escenario.cliente.dolorFrase}
                  </div>
                </div>

                {completada ? (
                  <button type="button" className="btn-proximamente" disabled>
                    COMPLETADA · {resultado.puntaje} PTS
                  </button>
                ) : bloqueada ? (
                  <button type="button" className="btn-proximamente" disabled>
                    BLOQUEADA
                  </button>
                ) : (
                  <button type="button" className="btn-elegir" onClick={() => iniciarPartida(escenario)}>
                    {hechas === 0 ? 'EMPEZAR MISIÓN' : `EMPEZAR MISIÓN ${numero}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="seleccion-footer">
        <span>{APP_NAME}</span>
        <span>{APP_TAGLINE}</span>
      </div>
    </div>
  );
}
