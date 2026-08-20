import { useMemo, useState } from 'react';
import '../styles/mapa-calor.css';

// Mini-juego: el usuario hace clic sobre un mapa SVG para marcar zonas.
// El motor lee `zonasClicables` (con cx, cy, r, esCritica) y pinta círculos
// invisibles sobre cada zona. El usuario va marcando hasta llegar al
// `maxSeleccion` (o decide parar antes con el botón "Confirmar").
//
// El "intento" se cuenta como cada clic sobre una zona NUEVA. Re-clicar
// una zona ya marcada NO cuenta como intento (el componente lo ignora).
// El motor descuenta `penalizacionPorIntentoExtra` por cada clic que excede
// `maxSeleccion`.
//
// Props:
//   decision   Decision con metaMinijuego, mensajeClienteDecision opcional
//   onElegir   (opcionIds: string[]) => void

export default function MapaCalor({ decision, onElegir }) {
  const meta = decision.metaMinijuego ?? {};
  const svgRaw = meta.svg ?? '';
  const zonas = useMemo(() => meta.zonasClicables ?? [], [meta.zonasClicables]);
  const maxSeleccion = meta.maxSeleccion ?? zonas.filter((z) => z.esCritica).length;
  const penalizacionPorIntentoExtra = meta.penalizacionPorIntentoExtra ?? 0;
  const tablaPuntaje = decision.tablaPuntaje ?? {};

  const [marcadas, setMarcadas] = useState([]); // ids únicos de zonas clickeadas
  const [terminado, setTerminado] = useState(false);

  function handleClickZona(zonaId) {
    if (terminado) return;
    // Re-clics sobre una zona ya marcada no cuentan como intento.
    if (marcadas.includes(zonaId)) return;
    setMarcadas((prev) => [...prev, zonaId]);
  }

  function confirmar() {
    if (terminado) return;
    setTerminado(true);
    onElegir(marcadas);
  }

  // Cálculos para mostrar preview al usuario.
  const intentos = marcadas.length;
  const aciertos = marcadas.filter((id) => {
    const z = zonas.find((x) => x.id === id);
    return z?.esCritica;
  }).length;
  const puntajeBase = tablaPuntaje[String(aciertos)] ?? 0;
  const errores = intentos - aciertos;
  const penalizacion = errores * penalizacionPorIntentoExtra;
  const puntajePreview = Math.max(0, puntajeBase - penalizacion);

  return (
    <div className="mapa-calor">
      <div className="label-pixel">🗺️ MAPA DE CALOR</div>

      <div className="mapa-calor-header">
        <div className="mapa-calor-pregunta">{decision.pregunta}</div>
        <div className="mapa-calor-contadores">
          <span className="contador">
            Intentos: <strong>{intentos}</strong>
          </span>
          <span className="contador">
            Marcadas: <strong>{marcadas.length}</strong>/{maxSeleccion}
          </span>
          <span className="contador">
            Aciertos: <strong>{aciertos}</strong>
          </span>
          {penalizacionPorIntentoExtra > 0 && (
            <span className="contador">
              Errores: <strong>{errores}</strong> (−{penalizacion} pts)
            </span>
          )}
        </div>
      </div>

      <div className="mapa-calor-svg-wrap">
        <div
          className="mapa-calor-svg"
          // El SVG viene del JSON, contenido controlado por el equipo.
          dangerouslySetInnerHTML={{ __html: svgRaw }}
        />
        {/* Capa de zonas clicables superpuesta. Cada zona es un círculo
            invisible que detecta el clic. Cuando está marcada, se pinta
            encima con un círculo visible. */}
        <svg
          className="mapa-calor-overlay"
          viewBox="0 0 600 400"
          preserveAspectRatio="xMidYMid meet"
        >
          {zonas.map((z) => {
            const estaMarcada = marcadas.includes(z.id);
            const esCritica = z.esCritica;
            let clase = 'zona-hitbox';
            if (estaMarcada) {
              clase += esCritica ? ' zona-marcada-critica' : ' zona-marcada-trampa';
            }
            return (
              <g key={z.id}>
                <circle
                  cx={z.cx}
                  cy={z.cy}
                  r={z.r}
                  className={clase}
                  onClick={() => handleClickZona(z.id)}
                >
                  <title>{z.label}</title>
                </circle>
                {estaMarcada && (
                  <>
                    <circle
                      cx={z.cx}
                      cy={z.cy}
                      r={z.r}
                      className={esCritica ? 'zona-fill-critica' : 'zona-fill-trampa'}
                    />
                    <text
                      x={z.cx}
                      y={z.cy + 4}
                      textAnchor="middle"
                      className="zona-label"
                    >
                      {esCritica ? '✓' : '✕'}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {terminado ? (
        <div className={`mapa-calor-feedback ${aciertos >= maxSeleccion ? 'ok' : 'info'}`}>
          {aciertos >= maxSeleccion
            ? `¡Excelente! Marcaste las ${aciertos} zonas críticas. +${puntajePreview} pts.`
            : `Marcaste ${aciertos} zona${aciertos === 1 ? '' : 's'} crítica${
                aciertos === 1 ? '' : 's'
              } de ${maxSeleccion}. +${puntajePreview} pts. La próxima vez, marcá primero dónde está el portero, la sala de cómputo y la oficina.`}
          {penalizacion > 0 && (
            <div className="mapa-calor-penalizacion">
              Penalización por {errores} clic{errores === 1 ? '' : 's'} en zona no crítica: −{penalizacion} pts.
            </div>
          )}
        </div>
      ) : (
        <div className="mapa-calor-footer">
          <span className="hint">
            💡 Cada clic en una zona nueva cuenta como un intento. Re-clicar la misma zona no cuenta.
          </span>
          <button type="button" className="btn-primary" onClick={confirmar}>
            Confirmar ({marcadas.length}/{maxSeleccion})
          </button>
        </div>
      )}
    </div>
  );
}
