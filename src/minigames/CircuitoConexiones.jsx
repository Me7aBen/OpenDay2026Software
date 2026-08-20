import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FORMAS,
  analizarCircuito,
  clonarCeldas,
  puntuarCircuito,
  rotarEn,
} from './circuitoLogica';
import IconoServicio from '../ui/IconoServicio';
import { reproducirEfecto } from '../lib/musica';
import '../styles/circuito.css';

// Puzzle de conexiones: girar piezas de cable hasta unir el servidor de
// respaldo con los servicios críticos, pasando por seguridad y sin tocar el
// nodo infectado.
//
// Todo el tablero viene declarado en `decision.metaMinijuego.tablero`, así que
// diseñar otro nivel (para otro escenario) es escribir otro JSON. El componente
// no sabe nada de Código Cero.
//
// La lógica (qué conecta con qué, si hay ruta, cuánto puntúa) vive en
// circuitoLogica.js, que es JS puro. Acá solo hay render e interacción.
//
// Accesibilidad, por diseño y no como parche:
//   - Cada celda girable es un <button> real: entra en el orden de tabulación,
//     responde a Enter y a Espacio sin código extra, y tiene foco visible.
//   - Nada depende solo del color: cada nodo especial lleva su icono, su
//     etiqueta de texto y su nombre en el aria-label.
//   - El estado del circuito se anuncia por una región aria-live.
//   - No hay drag and drop en ninguna parte de este puzzle.

const NOMBRE_FORMA = {
  recta: 'recta',
  curva: 'curva',
  te: 'división',
  vacia: 'vacía',
};

const ICONO_POR_ROL = {
  origen: 'servidor',
  seguridad: 'seguridad',
  infectado: 'infectado',
};

// Dibuja el cable: un núcleo central y un brazo hacia cada lado conectado.
// Recibe las conexiones SIN rotar; la rotación la aplica CSS sobre el <svg>,
// que es lo que permite animar el giro.
function Cable({ conexiones }) {
  const [n, e, s, o] = conexiones;
  const hayAlgo = n || e || s || o;
  return (
    <>
      {hayAlgo && <rect className="circ-hub" x="9" y="9" width="6" height="6" />}
      {n && <rect className="circ-brazo" x="9.5" y="0" width="5" height="12" />}
      {e && <rect className="circ-brazo" x="12" y="9.5" width="12" height="5" />}
      {s && <rect className="circ-brazo" x="9.5" y="12" width="5" height="12" />}
      {o && <rect className="circ-brazo" x="0" y="9.5" width="12" height="5" />}
    </>
  );
}

export default function CircuitoConexiones({ decision, onElegir }) {
  // `?? {}` crea un objeto nuevo en cada render; memorizarlo es lo que evita
  // que el efecto de resolución se reejecute sin motivo.
  const meta = useMemo(() => decision.metaMinijuego ?? {}, [decision.metaMinijuego]);
  const tableroBase = meta.tablero ?? { columnas: 4, celdas: [] };

  const [celdas, setCeldas] = useState(() => clonarCeldas(tableroBase.celdas));
  const [giros, setGiros] = useState(0);
  const [reinicios, setReinicios] = useState(0);
  const [terminado, setTerminado] = useState(false);
  const [puntos, setPuntos] = useState(0);

  const yaNotificado = useRef(false);
  const analisisPrevio = useRef(null);

  const tablero = useMemo(
    () => ({ columnas: tableroBase.columnas ?? 4, celdas }),
    [tableroBase.columnas, celdas],
  );
  const analisis = useMemo(() => analizarCircuito(tablero), [tablero]);

  const etiquetaDestino = useMemo(() => {
    const mapa = {};
    celdas.forEach((c) => {
      if (c.rol === 'destino') mapa[c.id] = c.label ?? c.id;
    });
    return mapa;
  }, [celdas]);

  // Sonidos de progreso. Se disparan comparando contra el análisis anterior,
  // no en el manejador del clic: así suenan por lo que CAMBIÓ en el circuito,
  // no por el hecho de haber tocado una pieza.
  useEffect(() => {
    const previo = analisisPrevio.current;
    analisisPrevio.current = analisis;
    if (!previo) return;
    if (analisis.destinosOk.length > previo.destinosOk.length) {
      reproducirEfecto('conectar');
    } else if (analisis.tocaInfectado && !previo.tocaInfectado) {
      reproducirEfecto('error');
    }
  }, [analisis]);

  // Resolución: notifica al motor UNA sola vez y bloquea el tablero. El ref es
  // lo que impide un doble envío si el efecto se vuelve a ejecutar.
  useEffect(() => {
    if (!analisis.resuelto || yaNotificado.current) return;
    yaNotificado.current = true;
    const obtenidos = puntuarCircuito({ resuelto: true, giros, reinicios, meta });
    setPuntos(obtenidos);
    setTerminado(true);
    reproducirEfecto('puzzleCompleto');
    onElegir([meta.idRespuesta ?? 'circuito-resuelto'], obtenidos);
  }, [analisis.resuelto, giros, reinicios, meta, onElegir]);

  function girar(indice) {
    if (terminado) return;
    setCeldas((prev) => rotarEn(prev, indice));
    setGiros((g) => g + 1);
    reproducirEfecto('girar');
  }

  function reiniciar() {
    if (terminado) return;
    setCeldas(clonarCeldas(tableroBase.celdas));
    setReinicios((r) => r + 1);
    reproducirEfecto('error');
  }

  // Texto de estado: es la fuente del aria-live y también lo que se lee en
  // pantalla, así que nunca hay información que solo exista para uno de los dos.
  let mensajeEstado;
  if (analisis.resuelto) {
    mensajeEstado = meta.mensajeResuelto ?? 'RED RESTAURADA · la energía llega a los servicios críticos.';
  } else if (analisis.tocaInfectado) {
    mensajeEstado = meta.mensajePeligro ?? 'La ruta está tocando el nodo infectado. Desvíala por otro camino.';
  } else if (analisis.destinosFaltan.length) {
    const faltan = analisis.destinosFaltan.map((id) => etiquetaDestino[id] ?? id).join(', ');
    mensajeEstado = `${meta.prefijoFaltan ?? 'Sin energía'}: ${faltan}.`;
  } else if (!analisis.seguridadOk) {
    mensajeEstado = meta.mensajeSinSeguridad ?? 'La ruta llega, pero no pasa por el nodo de seguridad.';
  } else {
    mensajeEstado = meta.mensajeInicio ?? 'Gira las piezas para llevar la energía.';
  }

  return (
    <div className="circ">
      <div className="circ-encabezado">
        <div className="label-pixel">{meta.titulo ?? 'RED NEXO · RUTA DE ENERGÍA'}</div>
        <div className="circ-medidores">
          <span className="medidor">
            GIROS <strong>{giros}</strong>
          </span>
          <span className="medidor">
            {meta.etiquetaConteo ?? 'SERVICIOS'}{' '}
            <strong className="pts">
              {analisis.destinosOk.length}/{analisis.destinosOk.length + analisis.destinosFaltan.length}
            </strong>
          </span>
        </div>
      </div>

      <div className="circ-pregunta">{decision.pregunta}</div>
      <div className="circ-instrucciones" aria-label="Cómo jugar">
        <span><b>1</b> TOCA UNA PIEZA</span>
        <span className="flecha" aria-hidden="true">→</span>
        <span><b>2</b> GÍRALA</span>
        <span className="flecha" aria-hidden="true">→</span>
        <span><b>3</b> SIGUE LA RUTA ENCENDIDA</span>
      </div>

      <div className="circ-cuerpo">
        <div
          className={`circ-tablero${analisis.resuelto ? ' resuelto' : ''}`}
          style={{ '--columnas': tablero.columnas }}
        >
          {celdas.map((celda, i) => {
            const enRuta = analisis.alcanzados.has(i);
            const base = celda.conexiones ?? FORMAS[celda.forma] ?? FORMAS.vacia;
            const esVacia = celda.forma === 'vacia' && !celda.rol;
            const rot = (celda.rotacion ?? 0) * 90;

            const cuerpo = (
              <>
                <svg
                  className="circ-svg"
                  viewBox="0 0 24 24"
                  shapeRendering="crispEdges"
                  style={{ '--rot': `${rot}deg` }}
                  aria-hidden="true"
                >
                  <Cable conexiones={base} />
                </svg>
                {celda.rol && (
                  <span className="circ-marca">
                    <IconoServicio
                      tipo={celda.icono ?? ICONO_POR_ROL[celda.rol] ?? 'nodo'}
                      tam={22}
                    />
                  </span>
                )}
                {celda.label && <span className="circ-etiqueta">{celda.label}</span>}
              </>
            );

            if (esVacia) {
              return <div key={celda.id ?? i} className="circ-celda vacia" aria-hidden="true" />;
            }

            if (celda.fija) {
              return (
                <div
                  key={celda.id ?? i}
                  className="circ-celda fija"
                  data-rol={celda.rol}
                  data-ruta={enRuta ? 'si' : 'no'}
                >
                  {cuerpo}
                </div>
              );
            }

            const fila = Math.floor(i / tablero.columnas) + 1;
            const col = (i % tablero.columnas) + 1;
            return (
              <button
                type="button"
                key={celda.id ?? i}
                className="circ-celda girable"
                data-ruta={enRuta ? 'si' : 'no'}
                disabled={terminado}
                onClick={() => girar(i)}
                aria-label={`Fila ${fila}, columna ${col}. Pieza ${
                  NOMBRE_FORMA[celda.forma] ?? celda.forma
                }, girada ${rot} grados. ${enRuta ? 'Con energía.' : 'Sin energía.'} Activar para girar.`}
              >
                {cuerpo}
              </button>
            );
          })}
        </div>

        <div className="circ-panel">
          <div className="circ-leyenda">
            <div className="circ-leyenda-fila">
              <IconoServicio tipo="servidor" tam={18} />
              <span>{meta.leyendaOrigen ?? 'Servidor de respaldo · punto de partida'}</span>
            </div>
            <div className="circ-leyenda-fila">
              <IconoServicio tipo="seguridad" tam={18} />
              <span>{meta.leyendaSeguridad ?? 'Seguridad · la ruta debe pasar por aquí'}</span>
            </div>
            <div className="circ-leyenda-fila peligro">
              <IconoServicio tipo="infectado" tam={18} />
              <span>{meta.leyendaInfectado ?? 'Nodo infectado · no debe tocarse'}</span>
            </div>
          </div>

          <div className="circ-destinos">
            {celdas
              .filter((c) => c.rol === 'destino')
              .map((c) => {
                const ok = analisis.destinosOk.includes(c.id);
                return (
                  <div key={c.id} className={`circ-destino${ok ? ' on' : ''}`}>
                    <IconoServicio tipo={c.icono ?? 'nodo'} tam={18} />
                    <span className="nombre">{c.label ?? c.id}</span>
                    {/* El check no es solo color: es un glifo distinto. */}
                    <span className="marca">
                      {ok
                        ? (meta.textoDestinoActivo ?? '✔ activo')
                        : (meta.textoDestinoInactivo ?? '— sin energía')}
                    </span>
                  </div>
                );
              })}
          </div>

          <div className={`circ-estado${analisis.resuelto ? ' ok' : ''}`} role="status" aria-live="polite">
            {mensajeEstado}
          </div>

          {terminado ? (
            <div className="circ-final">
              <span className="valor">+{puntos}</span>
              <span className="etiqueta">pts</span>
            </div>
          ) : (
            <button type="button" className="btn-outline-danger circ-reset" onClick={reiniciar}>
              Reiniciar tablero
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
