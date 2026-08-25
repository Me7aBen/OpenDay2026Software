import { useRef, useState } from 'react';
import { reproducirEfecto } from '../lib/musica';
import '../styles/pedido-fantasma.css';

// TRAZA DE PETICIONES (§29) — el descubrimiento del bug.
//
// Primero se sigue la compra por el flujo real (CLIENTE → CARRITO → PAGO →
// PEDIDO → ALMACÉN → DELIVERY) viendo la traza de la red: petición, error de
// conexión, reintento, y otro pedido creado. Cinco veces.
//
// Después se pregunta dónde se origina el problema, y el estudiante lo marca
// tocando el nodo del flujo. No es una lista de opciones disfrazada: se señala
// sobre el diagrama que acaba de leer.

export default function TrazaPeticiones({ decision, onElegir }) {
  const meta = decision.metaMinijuego ?? {};
  const nodos = meta.nodos ?? [];
  const traza = meta.traza ?? [];
  const [visibles, setVisibles] = useState(1);
  const [elegido, setElegido] = useState(null);
  const [errores, setErrores] = useState(0);
  const notificado = useRef(false);

  const trazaCompleta = visibles >= traza.length;
  const resuelto = elegido === meta.nodoCulpable;

  function marcar(nodoId) {
    if (resuelto) return;
    setElegido(nodoId);
    if (nodoId === meta.nodoCulpable) {
      const maximo = meta.puntosMax ?? 100;
      const minimo = meta.puntosMin ?? 40;
      const castigo = meta.penalizacionPorError ?? 20;
      const puntos = Math.max(minimo, maximo - errores * castigo);
      reproducirEfecto('codigoOk');
      if (!notificado.current) {
        notificado.current = true;
        onElegir([meta.idRespuesta ?? 'bug-encontrado'], puntos);
      }
      return;
    }
    setErrores((n) => n + 1);
  }

  return (
    <div className="pfz">
      <div className="pfz-encabezado">
        <div className="label-pixel" style={{ color: 'var(--cyan)' }}>
          TRAZA DE LA COMPRA {meta.codigoPedido ?? ''}
        </div>
        <p className="pfz-pregunta">{decision.pregunta}</p>
      </div>

      <div className="pfz-flujo" role="group" aria-label="Flujo de la compra">
        {nodos.map((nodo, i) => {
          const marcado = elegido === nodo.id;
          const esCulpable = nodo.id === meta.nodoCulpable;
          const estado = !marcado ? '' : esCulpable ? ' ok' : ' mal';
          return (
            <div className="pfz-flujo-item" key={nodo.id}>
              <button
                type="button"
                className={`pfz-nodo${estado}${resuelto && esCulpable ? ' ok' : ''}`}
                onClick={() => marcar(nodo.id)}
                disabled={resuelto || !trazaCompleta}
                aria-pressed={marcado}
              >
                <span className="pfz-nodo-nombre">{nodo.nombre}</span>
                {nodo.detalle && <span className="pfz-nodo-detalle">{nodo.detalle}</span>}
              </button>
              {i < nodos.length - 1 && (
                <span className="pfz-flujo-flecha" aria-hidden="true">
                  ↓
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="pfz-consola" role="log">
        {traza.slice(0, visibles).map((linea, i) => (
          <div key={i} className={`pfz-linea ${linea.tono ?? 'info'}`}>
            {linea.texto}
          </div>
        ))}
      </div>

      {!trazaCompleta ? (
        <button
          type="button"
          className="pfz-boton"
          onClick={() => setVisibles((n) => Math.min(n + 1, traza.length))}
        >
          ▶ SEGUIR LA COMPRA
        </button>
      ) : !resuelto ? (
        <div className="feedback-box info" role="status">
          {errores === 0
            ? meta.instruccion ?? 'Toca el punto del flujo donde se está creando el pedido de más.'
            : meta.feedbackError ?? 'Ahí el dato todavía era correcto. Mira dónde se repite la creación.'}
        </div>
      ) : (
        <div className="pfz-hallazgo">
          <div className="pfz-hallazgo-titulo">ENCONTRASTE EL BUG</div>
          <p>{meta.feedbackAcierto ?? 'El backend interpreta cada reintento como una compra nueva.'}</p>
        </div>
      )}
    </div>
  );
}
