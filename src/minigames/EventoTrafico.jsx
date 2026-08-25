import { useEffect, useState } from 'react';
import DecisionUnica from './DecisionUnica';
import '../styles/pedido-fantasma.css';

// EVENTO DE TRÁFICO (§38).
//
// No es una mecánica nueva: es la decisión de siempre (`DecisionUnica`, el
// componente que ya usaban Ccorca y Código Cero) precedida por una alerta con
// el CPU subiendo. Reutilizar era lo correcto — lo único que faltaba era la
// tensión de ver 63 → 98 antes de decidir.
//
// Después de responder, si la opción elegida declara `diagrama`, se muestra el
// esquema de la cola: usuarios → cola → servidor → procesamiento.

export default function EventoTrafico({ decision, onElegir, avatar }) {
  const meta = decision.metaMinijuego ?? {};
  const lecturas = meta.cpu ?? [63, 77, 91, 98];
  const [indice, setIndice] = useState(0);
  const [respondida, setRespondida] = useState(null);

  useEffect(() => {
    if (indice >= lecturas.length - 1) return undefined;
    const id = setTimeout(() => setIndice((n) => n + 1), 900);
    return () => clearTimeout(id);
  }, [indice, lecturas.length]);

  const cpu = lecturas[indice];
  const critico = cpu >= 90;
  const opcion = decision.opciones.find((o) => o.id === respondida);

  function manejarElegir(opcionIds, puntajeDirecto) {
    setRespondida(opcionIds[0]);
    onElegir(opcionIds, puntajeDirecto);
  }

  return (
    <div className="pfz">
      <div className={`pfz-alerta${critico ? ' critica' : ''}`} role="status">
        <div className="pfz-alerta-titulo">⚠ ALERTA · {meta.titulo ?? 'PICO DE TRÁFICO'}</div>
        <p>{meta.descripcion}</p>
        <div className="pfz-cpu">
          <div className="pfz-cpu-fila">
            <span>CPU</span>
            <strong style={{ color: critico ? 'var(--red)' : 'var(--gold)' }}>{cpu}%</strong>
          </div>
          <div className="pfz-barra">
            <div
              className="pfz-barra-relleno"
              style={{
                width: `${cpu}%`,
                background: critico ? 'var(--red)' : 'var(--gold)',
              }}
            />
          </div>
        </div>
      </div>

      <DecisionUnica decision={decision} onElegir={manejarElegir} avatar={avatar} />

      {opcion?.diagrama && (
        <div className="pfz-diagrama">
          <div className="label-pixel">CÓMO QUEDA EL SISTEMA</div>
          <div className="pfz-diagrama-nodos">
            {opcion.diagrama.map((paso, i) => (
              <span key={paso} className="pfz-diagrama-nodo">
                {paso}
                {i < opcion.diagrama.length - 1 && (
                  <span className="pfz-diagrama-flecha" aria-hidden="true">
                    →
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
