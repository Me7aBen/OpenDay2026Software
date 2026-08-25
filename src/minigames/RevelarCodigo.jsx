import { useRef, useState } from 'react';
import { reproducirEfecto } from '../lib/musica';
import '../styles/pedido-fantasma.css';

// REVELAR CÓDIGO (§36) — el puente entre el puzzle visual y la programación.
//
// "Lo que acabas de construir visualmente puede traducirse a código." El
// estudiante ve el bloque casi completo y elige la condición que falta. No hay
// que escribir nada: la idea es que ENTIENDA la condición, no que memorice
// sintaxis. Ese es literalmente el cierre de Valeria en el brief.
export default function RevelarCodigo({ decision, onElegir }) {
  const meta = decision.metaMinijuego ?? {};
  const opciones = decision.opciones ?? [];
  const [elegida, setElegida] = useState(null);
  const notificado = useRef(false);
  const opcionElegida = opciones.find((o) => o.id === elegida) ?? null;
  const correcta = opcionElegida?.esCorrecta === true;

  function elegir(opcionId) {
    if (elegida) return;
    setElegida(opcionId);
    const opcion = opciones.find((o) => o.id === opcionId);
    const maximo = meta.puntosMax ?? 50;
    const puntos = opcion?.esCorrecta ? maximo : (meta.puntosMin ?? 0);
    if (opcion?.esCorrecta) reproducirEfecto('codigoOk');
    if (!notificado.current) {
      notificado.current = true;
      onElegir([opcionId], puntos);
    }
  }

  const relleno = correcta
    ? opcionElegida.texto
    : opcionElegida
      ? opcionElegida.texto
      : '_______________';

  return (
    <div className="pfz">
      <div className="pfz-encabezado">
        <div className="label-pixel" style={{ color: 'var(--cyan)' }}>
          DE LOS BLOQUES AL CÓDIGO
        </div>
        <p className="pfz-pregunta">{decision.pregunta}</p>
      </div>

      <pre className="pfz-codigo" aria-label="Bloque de código">
        <code>
          {meta.antes ?? 'if ('}
          <span className={`pfz-hueco${elegida ? (correcta ? ' ok' : ' mal') : ''}`}>{relleno}</span>
          {meta.despues ?? ') {\n  crearPedido(id);\n  actualizarStock();\n  enviarAlmacen();\n}'}
        </code>
      </pre>

      <div className="pfz-opciones">
        {opciones.map((opcion) => (
          <button
            key={opcion.id}
            type="button"
            className={`pfz-opcion${elegida === opcion.id ? (opcion.esCorrecta ? ' ok' : ' mal') : ''}`}
            disabled={!!elegida}
            onClick={() => elegir(opcion.id)}
          >
            <code>{opcion.texto}</code>
            {opcion.glosa && <span className="pfz-opcion-glosa">{opcion.glosa}</span>}
          </button>
        ))}
      </div>

      {opcionElegida && (
        <div className={`feedback-box ${correcta ? 'ok' : 'error'}`} role="status">
          {opcionElegida.feedback}
        </div>
      )}

      {opcionElegida && meta.cierre && (
        <blockquote className="pfz-cita">
          <p>{meta.cierre}</p>
          <footer>— Valeria, Tech Lead</footer>
        </blockquote>
      )}
    </div>
  );
}
