import { Enlace } from '../../../app/router/Router';
import { alternarCarreraGuardada } from '../../exploration/almacen';
import { useExploracion } from '../../exploration/useExploracion';

// Tarjeta del explorador (§13). Muestra solo lo que sabemos de verdad: nombre,
// área, descripción corta, duración aproximada y si tiene simulación. Nada de
// universidades ni salarios acá.
export default function CarreraCard({ carrera }) {
  const exploracion = useExploracion();
  const guardada = exploracion.carrerasGuardadas.includes(carrera.id);

  return (
    <article className="pf-carrera-card">
      <div className="cabecera">
        <span className="emoji" aria-hidden="true">
          {carrera.areaInfo?.emoji}
        </span>
        <div>
          <div className="area" style={{ color: carrera.areaInfo?.color }}>
            {carrera.areaInfo?.nombre}
          </div>
          <h3>{carrera.nombre}</h3>
        </div>
      </div>

      <p className="desc">{carrera.descripcionCorta}</p>

      <div className="meta">
        <span>⏱ {carrera.duracionLabel}</span>
        {carrera.tieneSimulacion && (
          <span className="pf-etiqueta gratis">🎮 Simulación gratis</span>
        )}
      </div>

      <div className="acciones">
        <Enlace to={`/carreras/${carrera.slug}`} className="pf-boton">
          Explorar
        </Enlace>
        <button
          type="button"
          className={`pf-icono-boton${guardada ? ' on' : ''}`}
          aria-pressed={guardada}
          aria-label={guardada ? `Quitar ${carrera.nombre} de guardadas` : `Guardar ${carrera.nombre}`}
          onClick={() => alternarCarreraGuardada(carrera.id)}
        >
          {guardada ? '♥' : '♡'}
        </button>
      </div>
    </article>
  );
}
