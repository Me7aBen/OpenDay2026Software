import { useEffect, useRef, useState } from 'react';
import { reproducirEfecto } from '../lib/musica';
import '../styles/pedido-fantasma.css';

// DESPLIEGUE (§39). El ritual final: versión actual, versión nueva, botón, y
// cuatro barras que llegan a 100%.
//
// Las barras son CSS + estado de React, no un GIF ni un video (§35, §56). Se
// respeta `prefers-reduced-motion`: con la preferencia activa el paso salta
// directo al 100% en vez de animarse.

const INTERVALO_MS = 55;

export default function DeploySecuencia({ decision, onElegir }) {
  const meta = decision.metaMinijuego ?? {};
  const pasos = meta.pasos ?? [];
  const [fase, setFase] = useState('listo'); // listo | corriendo | terminado
  const [progresos, setProgresos] = useState(() => pasos.map(() => 0));
  const notificado = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  function desplegar() {
    if (fase !== 'listo') return;
    setFase('corriendo');

    const reducirMovimiento =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (reducirMovimiento) {
      setProgresos(pasos.map(() => 100));
      terminar();
      return;
    }

    let pasoActual = 0;
    timerRef.current = setInterval(() => {
      setProgresos((actual) => {
        const siguiente = [...actual];
        siguiente[pasoActual] = Math.min(100, siguiente[pasoActual] + 4);
        if (siguiente[pasoActual] >= 100) pasoActual += 1;
        return siguiente;
      });
      if (pasoActual >= pasos.length) {
        clearInterval(timerRef.current);
        terminar();
      }
    }, INTERVALO_MS);
  }

  function terminar() {
    setFase('terminado');
    reproducirEfecto('codigoOk');
    if (!notificado.current) {
      notificado.current = true;
      onElegir([meta.idRespuesta ?? 'deploy-ok'], meta.puntosMax ?? 80);
    }
  }

  return (
    <div className="pfz">
      <div className="pfz-encabezado">
        <div className="label-pixel" style={{ color: 'var(--cyan)' }}>
          DESPLIEGUE A PRODUCCIÓN
        </div>
        <p className="pfz-pregunta">{decision.pregunta}</p>
      </div>

      <div className="pfz-versiones">
        <div className="pfz-version">
          <span className="rotulo">VERSIÓN ACTUAL</span>
          <strong>{meta.versionActual}</strong>
        </div>
        <span className="pfz-version-flecha" aria-hidden="true">
          →
        </span>
        <div className="pfz-version nueva">
          <span className="rotulo">VERSIÓN NUEVA</span>
          <strong>{meta.versionNueva}</strong>
        </div>
      </div>

      {fase === 'listo' ? (
        <button type="button" className="pfz-boton grande" onClick={desplegar}>
          🚀 HACER DEPLOY
        </button>
      ) : (
        <div className="pfz-pasos" role="status" aria-live="polite">
          {pasos.map((paso, i) => (
            <div className="pfz-paso" key={paso.id ?? i}>
              <div className="pfz-paso-fila">
                <span>{paso.texto}</span>
                <span className="pfz-paso-pct">{progresos[i]}%</span>
              </div>
              <div className="pfz-barra">
                <div className="pfz-barra-relleno" style={{ width: `${progresos[i]}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {fase === 'terminado' && (
        <div className="pfz-hallazgo">
          <div className="pfz-hallazgo-titulo">DEPLOY COMPLETADO</div>
          <p>{meta.mensajeExito ?? 'La nueva versión está en producción.'}</p>
        </div>
      )}
    </div>
  );
}
