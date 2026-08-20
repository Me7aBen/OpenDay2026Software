import { useRef, useState } from 'react';
import IconoServicio from '../ui/IconoServicio';
import { reproducirEfecto } from '../lib/musica';
import '../styles/puerta-seguridad.css';

// Prueba visual de acceso: sustituye el ejercicio abstracto de true/false.
// El jugador ve una cuenta bloqueada, cambia el estado real de la puerta y
// ejecuta una simulación. Solo se informa al motor cuando la prueba es segura.
export default function PuertaSeguridad({ decision, onElegir }) {
  const meta = decision.metaMinijuego ?? {};
  const [cerrada, setCerrada] = useState(false);
  const [estado, setEstado] = useState('lista'); // lista | error | correcto
  const [fallos, setFallos] = useState(0);
  const notificado = useRef(false);

  function alternarPuerta() {
    if (estado === 'correcto') return;
    setCerrada((valor) => !valor);
    setEstado('lista');
    reproducirEfecto('girar');
  }

  function probarAcceso() {
    if (estado === 'correcto') return;

    if (!cerrada) {
      setFallos((valor) => valor + 1);
      setEstado('error');
      reproducirEfecto('error');
      return;
    }

    const maximo = meta.puntosMax ?? 30;
    const minimo = meta.puntosMin ?? 20;
    const penalizacion = meta.penalizacionPorFallo ?? 5;
    const puntos = Math.max(minimo, maximo - fallos * penalizacion);
    setEstado('correcto');
    reproducirEfecto('puzzleCompleto');

    if (!notificado.current) {
      notificado.current = true;
      onElegir([meta.idRespuesta ?? 'puerta-cerrada'], puntos);
    }
  }

  return (
    <div className="puerta">
      <div className="label-pixel">PRUEBA DE ACCESO · FIREWALL</div>
      {decision.contexto && (
        <div className="puerta-contexto">
          <span>PROBLEMA</span>
          {decision.contexto}
        </div>
      )}
      <h2>{decision.pregunta}</h2>

      <div className="puerta-pasos" aria-label="Cómo resolver la prueba">
        <span><b>1</b> CAMBIA LA PUERTA</span>
        <span aria-hidden="true">→</span>
        <span><b>2</b> SIMULA EL ACCESO</span>
        <span aria-hidden="true">→</span>
        <span><b>3</b> REVISA EL RESULTADO</span>
      </div>

      <div className={`puerta-escena ${cerrada ? 'cerrada' : 'abierta'} ${estado}`}>
        <div className="puerta-cuenta">
          <IconoServicio tipo="infectado" tam={42} />
          <strong>CUENTA BLOQUEADA</strong>
          <span>solicita acceso</span>
        </div>

        <div className="puerta-flecha" aria-hidden="true">→ → →</div>

        <button
          type="button"
          className="puerta-control"
          onClick={alternarPuerta}
          aria-pressed={cerrada}
          aria-label={`Puerta del firewall ${cerrada ? 'cerrada' : 'abierta'}. Activar para cambiarla.`}
        >
          <span className="puerta-marco">
            <span className="puerta-hoja" />
          </span>
          <strong>{cerrada ? 'CERRADA' : 'ABIERTA'}</strong>
          <small>TOCA PARA CAMBIAR</small>
        </button>

        <div className="puerta-red">
          <IconoServicio tipo="servidor" tam={42} />
          <strong>RED NEXO</strong>
          <span>{estado === 'correcto' ? 'protegida' : 'en espera'}</span>
        </div>
      </div>

      <div className="puerta-acciones">
        <button
          type="button"
          className="btn-primary"
          onClick={probarAcceso}
          disabled={estado === 'correcto'}
        >
          SIMULAR ACCESO
        </button>
        <span className={`puerta-estado estado-${estado}`} role="status" aria-live="polite">
          {estado === 'lista' && (cerrada
            ? 'La puerta está cerrada. Ahora comprueba qué sucede.'
            : 'La puerta está abierta. Decide si es seguro probar así.')}
          {estado === 'error' && '✕ LA CUENTA ENTRÓ. Cierra la puerta y vuelve a probar.'}
          {estado === 'correcto' && '✔ ACCESO RECHAZADO. La cuenta bloqueada quedó fuera.'}
        </span>
      </div>
    </div>
  );
}
