import { useRef, useState } from 'react';
import { reproducirEfecto } from '../lib/musica';
import '../styles/ordenar-pasos.css';

// Puzzle de secuencia: el jugador construye un procedimiento tocando pasos.
// No hay drag obligatorio, así funciona igual con mouse, teclado y pantalla
// táctil. El orden se compara con ids declarados en el JSON; nunca se ejecuta
// contenido escrito por el usuario.
export default function OrdenarPasos({ decision, onElegir }) {
  const meta = decision.metaMinijuego ?? {};
  const pasos = meta.pasos ?? [];
  const ordenCorrecto = meta.ordenCorrecto ?? pasos.map((paso) => paso.id);
  const intentosPermitidos = meta.intentosPermitidos ?? 3;

  const [orden, setOrden] = useState([]);
  const [intentos, setIntentos] = useState(0);
  const [estado, setEstado] = useState('armando'); // armando | error | listo | agotado
  const notificado = useRef(false);

  const disponibles = pasos.filter((paso) => !orden.includes(paso.id));
  const completo = orden.length === pasos.length;
  const intentosRestantes = Math.max(0, intentosPermitidos - intentos);

  function agregar(id) {
    if (estado === 'listo' || estado === 'agotado' || orden.includes(id)) return;
    setOrden((actual) => [...actual, id]);
    setEstado('armando');
  }

  function quitar(id) {
    if (estado === 'listo' || estado === 'agotado') return;
    setOrden((actual) => actual.filter((pasoId) => pasoId !== id));
    setEstado('armando');
  }

  function vaciar() {
    if (estado === 'listo' || estado === 'agotado') return;
    setOrden([]);
    setEstado('armando');
  }

  function confirmar() {
    if (!completo || estado === 'listo' || estado === 'agotado') return;
    const numeroIntento = intentos + 1;
    const correcto = orden.every((id, indice) => id === ordenCorrecto[indice]);
    setIntentos(numeroIntento);

    if (correcto) {
      const maximo = meta.puntosMax ?? 120;
      const penalizacion = meta.penalizacionPorIntento ?? 20;
      const minimo = meta.puntosMin ?? 50;
      const puntos = Math.max(minimo, maximo - (numeroIntento - 1) * penalizacion);
      setEstado('listo');
      reproducirEfecto('codigoOk');
      if (!notificado.current) {
        notificado.current = true;
        onElegir([meta.idRespuesta ?? 'orden-correcto'], puntos);
      }
      return;
    }

    reproducirEfecto('error');
    if (numeroIntento >= intentosPermitidos) {
      setEstado('agotado');
      if (!notificado.current) {
        notificado.current = true;
        onElegir([], 0);
      }
      return;
    }
    setEstado('error');
  }

  function pasoPorId(id) {
    return pasos.find((paso) => paso.id === id);
  }

  return (
    <div className="ordenar">
      <div className="ordenar-cabecera">
        {/* El rótulo lo pone el contenido: "RUTA DE RECUPERACIÓN" era de Código
              Cero y no describe cualquier secuencia. Sin declararlo, se sigue
              viendo exactamente lo de antes. */}
          <div className="label-pixel">{meta.rotulo ?? 'RUTA DE RECUPERACIÓN'}</div>
        <div className="ordenar-etapas" aria-hidden="true">
          <span>1 · PIENSA</span><b>→</b><span>2 · ORDENA</span><b>→</b><span>3 · CONFIRMA</span>
        </div>
      </div>

      {decision.contexto && (
        <div className="ordenar-contexto">
          <span>PROBLEMA</span>
          {decision.contexto}
        </div>
      )}
      <h2 className="ordenar-pregunta">{decision.pregunta}</h2>

      <div className="ordenar-tablero">
        <section className="ordenar-disponibles" aria-label="Pasos disponibles">
          <div className="ordenar-rotulo">PASOS DISPONIBLES</div>
          {disponibles.map((paso) => (
            <button key={paso.id} type="button" className="ordenar-paso" onClick={() => agregar(paso.id)}>
              <span className="ordenar-icono">{paso.icono ?? '◆'}</span>
              <span>{paso.texto}</span>
              <span className="ordenar-agregar">+</span>
            </button>
          ))}
          {!disponibles.length && <div className="ordenar-vacio">Todos los pasos están en la ruta.</div>}
        </section>

        <section className="ordenar-ruta" aria-label="Tu orden de recuperación">
          <div className="ordenar-ruta-cabecera">
            <div className="ordenar-rotulo">TU RUTA</div>
            <button type="button" className="ordenar-vaciar" onClick={vaciar} disabled={!orden.length || estado === 'listo' || estado === 'agotado'}>
              VACIAR
            </button>
          </div>
          {pasos.map((_, indice) => {
            const id = orden[indice];
            const paso = id ? pasoPorId(id) : null;
            const revisado = estado === 'error' || estado === 'agotado' || estado === 'listo';
            const posicionCorrecta = id === ordenCorrecto[indice];
            return (
              <button
                key={indice}
                type="button"
                className={`ordenar-slot${paso ? ' lleno' : ''}${revisado ? (posicionCorrecta ? ' correcto' : ' incorrecto') : ''}`}
                onClick={() => paso && quitar(paso.id)}
                disabled={!paso || estado === 'listo' || estado === 'agotado'}
              >
                <span className="ordenar-numero">{indice + 1}</span>
                <span>{paso?.texto ?? 'Elige el siguiente paso'}</span>
                {revisado && paso && <strong>{posicionCorrecta ? '✔' : '✕'}</strong>}
              </button>
            );
          })}
        </section>
      </div>

      <div className="ordenar-acciones">
        <button type="button" className="btn-primary" onClick={confirmar} disabled={!completo || estado === 'listo' || estado === 'agotado'}>
          COMPROBAR ORDEN
        </button>
        <span>{intentosRestantes} intento{intentosRestantes === 1 ? '' : 's'} disponible{intentosRestantes === 1 ? '' : 's'}</span>
      </div>

      <div className="ordenar-feedback" role="status" aria-live="polite">
        {estado === 'error' && (
          <div className="feedback-box parcial">
            <strong>CASI.</strong> Las posiciones con ✕ todavía ponen un servicio en riesgo. Tócalas, reordena y prueba otra vez.
          </div>
        )}
        {estado === 'listo' && (
          <div className="feedback-box ok">
            <strong>RUTA SEGURA.</strong> {meta.feedbackAcierto ?? 'La recuperación puede comenzar sin sobrecargar la red.'}
          </div>
        )}
        {estado === 'agotado' && (
          <div className="feedback-box error">
            <strong>TE EQUIVOCASTE.</strong> La ruta segura era: {ordenCorrecto.map((id) => pasoPorId(id)?.texto).join(' → ')}.
          </div>
        )}
      </div>
    </div>
  );
}
