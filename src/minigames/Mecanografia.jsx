import { useEffect, useRef, useState } from 'react';

// Mini-juego de mecanografía: el usuario tipea un código y gana puntos
// proporcionales a la velocidad. Si pasan N segundos sin tipear nada, aparece
// un botón "Saltar" que completa el código automáticamente y asigna el
// puntaje mínimo del paso.
//
// Props:
//   codigo           string                       - el texto a tipear
//   puntosMax        number                       - máximo del paso
//   puntosMin        number                       - mínimo si salta
//   segundosParaSalto number                      - segundos de inactividad
//                                                   para mostrar el botón
//   onResolver       (puntos: number) => void     - callback al terminar
//
// Comportamiento:
//   - El usuario tiene que tipear el código EXACTO (case-sensitive, sin
//     autocompletado). Los caracteres tipeados se muestran como válidos
//     (en verde) o inválidos (en rojo) carácter por carácter.
//   - NO se puede copiar ni pegar. El puntaje premia la velocidad, así que un
//     Ctrl+C sobre el código y un Ctrl+V en el campo daba el máximo sin tipear
//     nada. Se bloquea por dos lados: el código no se puede seleccionar, y el
//     campo descarta cualquier inserción de más de un carácter (que es lo que
//     cierra TODAS las vías: pegar, arrastrar texto, autocompletar), en lugar
//     de ir tapando una por una.
//   - El puntaje crece linealmente con el progreso Y con la velocidad:
//     a más rápido el tipeo, máscerca del puntosMax.
//   - Al saltar, se autocompleta el código y se otorgan puntosMin.

export default function Mecanografia({
  codigo,
  puntosMax,
  puntosMin,
  segundosParaSalto = 30,
  onResolver,
}) {
  const [escrito, setEscrito] = useState('');
  const [terminado, setTerminado] = useState(false);
  const [saltado, setSaltado] = useState(false);
  const [segundosInactivo, setSegundosInactivo] = useState(0);
  const [puntosObtenidos, setPuntosObtenidos] = useState(0);
  const [avisoPegado, setAvisoPegado] = useState(false);
  const inicioRef = useRef(null);

  // El timestamp de inicio se setea en un effect para no llamar a
  // performance.now() durante el render (regla de pureza de React).
  useEffect(() => {
    if (inicioRef.current === null) {
      inicioRef.current = performance.now();
    }
  }, []);

  // El aviso de "no se puede pegar" se muestra un rato y se va solo. Sin esto,
  // el campo simplemente no reacciona al Ctrl+V y parece estar roto.
  useEffect(() => {
    if (!avisoPegado) return undefined;
    const id = setTimeout(() => setAvisoPegado(false), 2200);
    return () => clearTimeout(id);
  }, [avisoPegado]);

  // Tick de inactividad: si pasaron `segundosParaSalto` sin tipear, mostrar
  // el botón Saltar. Se activa solo cuando no está terminado.
  useEffect(() => {
    if (terminado) return undefined;
    if (escrito.length > 0) return undefined; // está tipeando
    const interval = setInterval(() => {
      setSegundosInactivo((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [terminado, escrito.length]);

  // Detección de tipeo completo: si escrito === codigo, termina y otorga
  // puntos proporcionales a la velocidad.
  useEffect(() => {
    if (terminado) return;
    if (escrito !== codigo) return;
    if (inicioRef.current === null) return;
    const msTardo = performance.now() - inicioRef.current;
    // 0..1: a menor tiempo, más puntos. El umbral de "muy rápido" es 8s,
    // el de "muy lento" es 60s. Lineal entre ambos.
    const segTardo = msTardo / 1000;
    const rapidez = Math.max(0, Math.min(1, (60 - segTardo) / (60 - 8)));
    const puntos = Math.round(puntosMin + (puntosMax - puntosMin) * rapidez);
    setPuntosObtenidos(puntos);
    setTerminado(true);
    onResolver(puntos);
  }, [escrito, codigo, puntosMax, puntosMin, terminado, onResolver]);

  function tipear(e) {
    if (terminado) return;
    const next = e.target.value;
    // Borrar siempre se permite.
    if (next.length < escrito.length) {
      setEscrito(next);
      return;
    }
    // Un juego de tipeo avanza de a una tecla. Un salto de más de un carácter
    // solo puede venir de un pegado, un arrastre de texto o un autocompletado:
    // se descarta. Los códigos del escenario son ASCII, así que ningún acento
    // ni tecla muerta legítima inserta dos caracteres de golpe.
    if (next.length > escrito.length + 1) {
      setAvisoPegado(true);
      return;
    }
    // Truncar al largo del código (no dejamos escribir de más).
    setEscrito(next.slice(0, codigo.length));
  }

  function bloquear(e) {
    e.preventDefault();
    setAvisoPegado(true);
  }

  function saltar() {
    if (terminado) return;
    setSaltado(true);
    setEscrito(codigo);
    setPuntosObtenidos(puntosMin);
    setTerminado(true);
    onResolver(puntosMin);
  }

  // Render: cada carácter del código se pinta verde si ya está bien tipeado,
  // rojo si está mal, blanco si todavía no se llegó.
  function renderCodigo() {
    return codigo.split('').map((char, i) => {
      let color = 'var(--text-dim)';
      if (i < escrito.length) {
        color = escrito[i] === char ? 'var(--green)' : 'var(--red)';
      }
      return (
        <span key={i} style={{ color }}>
          {char}
        </span>
      );
    });
  }

  const mostrarBotonSaltar = !terminado && segundosInactivo >= segundosParaSalto;
  const progreso = codigo.length === 0 ? 0 : escrito.length / codigo.length;

  return (
    <div
      style={{
        background: 'var(--panel-alt)',
        border: '2px solid var(--cyan)',
        borderRadius: 8,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      {/* El código se lee, no se selecciona: sin selección no hay Ctrl+C, y
          tampoco entra en un "seleccionar todo" de la página. */}
      <div
        onCopy={bloquear}
        onCut={bloquear}
        onDragStart={bloquear}
        style={{
          fontFamily: 'monospace',
          fontSize: 'var(--fs-lg)',
          background: '#0b1220',
          padding: '10px 12px',
          borderRadius: 6,
          minHeight: 32,
          letterSpacing: 1,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          cursor: 'default',
        }}
      >
        {renderCodigo()}
      </div>

      <input
        type="text"
        value={escrito}
        onChange={tipear}
        onPaste={bloquear}
        onDrop={bloquear}
        disabled={terminado}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="Tipeá acá..."
        style={{
          background: '#0b1220',
          border: '2px solid var(--border)',
          borderRadius: 6,
          padding: '10px 12px',
          fontFamily: 'monospace',
          fontSize: 'var(--fs-md)',
          color: 'var(--text)',
        }}
      />

      <div
        style={{
          height: 6,
          background: 'var(--border)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progreso * 100}%`,
            height: '100%',
            background: saltado ? 'var(--gold)' : 'var(--cyan)',
            transition: 'width 0.15s linear',
          }}
        />
      </div>

      {avisoPegado && !terminado && (
        <div
          role="status"
          style={{
            fontSize: 'var(--fs-sm)',
            fontWeight: 700,
            color: 'var(--gold)',
            background: 'rgba(255, 209, 102, 0.12)',
            border: '1px solid var(--gold)',
            borderRadius: 6,
            padding: '6px 10px',
          }}
        >
          ✋ Acá no se puede copiar y pegar: hay que tipearlo.
        </div>
      )}

      {terminado ? (
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 'var(--fs-sm)',
            color: saltado ? 'var(--gold)' : 'var(--green)',
            fontWeight: 700,
          }}
        >
          {saltado
            ? `✋ Saltado. +${puntosObtenidos} pts (mínimo)`
            : `✔ +${puntosObtenidos} pts`}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 'var(--fs-sm)',
            color: 'var(--text-dim)',
          }}
        >
          <span>
            ⌨️ Tipeá el código. Mientras más rápido, más pts.
          </span>
          {mostrarBotonSaltar && (
            <button
              type="button"
              onClick={saltar}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                fontSize: 'var(--fs-sm)',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              ¿No podés tipearlo? Saltar este paso (−pts)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
