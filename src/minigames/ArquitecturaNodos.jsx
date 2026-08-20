import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Mecanografia from './Mecanografia';
import '../styles/arquitectura.css';

// Una decisión de tipo 'arquitectura-nodos' orquesta una secuencia de pasos:
// el usuario enciende y conecta piezas, tipeando código en cada paso.
// Al terminar devuelve UN solo puntaje al motor (suma de los pasos).
//
// --- Cómo se dibuja el mapa ------------------------------------------------
// Las piezas NO se posicionan con coordenadas. Se declaran en columnas de
// izquierda a derecha, que es como se lee un flujo: lo que ve el usuario,
// el cerebro que decide, los servicios que hacen el trabajo. El JSON solo
// dice qué columna contiene qué piezas:
//
//   "columnas": [
//     { "titulo": "LO QUE VE DON TOMÁS", "nodos": ["app"] },
//     { "titulo": "EL CEREBRO",          "nodos": ["back"] },
//     { "titulo": "LO QUE HACE EL TRABAJO", "nodos": ["db", "api-sms"] }
//   ]
//
// Mover una pieza = moverla de lista. Agregar una = agregar su id. No hay
// que recalcular x/y ni el viewBox, y el layout se adapta solo a la pantalla.
// Si un escenario viejo no trae `columnas`, se derivan de las x/y que tenga
// (piezas con la misma x caen en la misma columna).
//
// Las conexiones se dibujan midiendo la posición real de cada tarjeta en el
// DOM, así que siguen siendo correctas en cualquier resolución.
//
// --- Interacción ----------------------------------------------------------
//   - "Encender": clic en la pieza objetivo → abre la mecanografía.
//   - "Conectar": clic en la pieza origen → queda seleccionada y una línea
//     sigue al cursor; clic en la pieza destino → cierra la conexión y abre
//     la mecanografía. Esc o clic en el fondo cancela.
//
// Props:
//   decision   Decision (con metaMinijuego.nodos, columnas, pasos, narraciones)
//   onElegir   (opcionIds: string[], puntajeDirecto?: number) => void

const ICONO_POR_DEFECTO = '⬛';

// Deriva columnas desde las coordenadas x/y del formato viejo: agrupa las
// piezas que comparten x (con tolerancia) y las ordena por y dentro de cada
// columna. Solo se usa como compatibilidad; el formato nuevo es `columnas`.
function derivarColumnasDesdeCoordenadas(nodos) {
  const grupos = new Map();
  nodos.forEach((n) => {
    const clave = Math.round((n.x ?? 0) / 60);
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(n);
  });
  return [...grupos.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, lista]) => ({
      titulo: null,
      nodos: lista.sort((a, b) => (a.y ?? 0) - (b.y ?? 0)).map((n) => n.id),
    }));
}

// Normaliza la declaración de columnas a objetos de nodo ya resueltos, y
// agrega al final una columna con las piezas que quedaron sin declarar (para
// que un id mal escrito en el JSON se vea en pantalla en vez de desaparecer).
function armarColumnas(nodos, columnasDeclaradas) {
  const porId = new Map(nodos.map((n) => [n.id, n]));
  const declaradas = columnasDeclaradas?.length
    ? columnasDeclaradas
    : derivarColumnasDesdeCoordenadas(nodos);

  const usados = new Set();
  const columnas = declaradas.map((col) => {
    const piezas = (col.nodos ?? [])
      .map((id) => {
        usados.add(id);
        return porId.get(id);
      })
      .filter(Boolean);
    return { titulo: col.titulo ?? null, nodos: piezas };
  });

  const sueltos = nodos.filter((n) => !usados.has(n.id));
  if (sueltos.length) columnas.push({ titulo: null, nodos: sueltos });

  return columnas.filter((c) => c.nodos.length > 0);
}

export default function ArquitecturaNodos({ decision, onElegir }) {
  const meta = decision.metaMinijuego ?? {};
  const nodos = useMemo(() => meta.nodos ?? [], [meta.nodos]);
  const pasos = useMemo(() => meta.pasos ?? [], [meta.pasos]);
  const narraciones = useMemo(() => meta.narraciones ?? [], [meta.narraciones]);
  const columnas = useMemo(
    () => armarColumnas(nodos, meta.columnas),
    [nodos, meta.columnas],
  );

  const [pasoActual, setPasoActual] = useState(0);
  const [nodosActivos, setNodosActivos] = useState(new Set());
  const [conexiones, setConexiones] = useState(new Set());
  const [puntosAcumulados, setPuntosAcumulados] = useState(0);
  const [esperandoPaso, setEsperandoPaso] = useState(false);
  const [terminado, setTerminado] = useState(false);
  const [pasoFase, setPasoFase] = useState('seleccionar');
  // Para "conectar": id de la pieza origen ya seleccionada (esperando el clic
  // en el destino). null cuando no hay selección.
  const [nodoOrigenSeleccionado, setNodoOrigenSeleccionado] = useState(null);
  // Posición del cursor relativa al lienzo, para la línea en vivo.
  const [cursor, setCursor] = useState(null);
  // Geometría medida de cada tarjeta, en coordenadas del lienzo. Se recalcula
  // en cada resize, así que las líneas siguen bien en cualquier resolución.
  const [cajas, setCajas] = useState({});

  const lienzoRef = useRef(null);
  const nodoRefs = useRef({});
  const cajasRef = useRef({});
  const yaNotificadoRef = useRef(false);

  // Mide dónde quedó cada tarjeta dentro del lienzo. Solo actualiza el estado
  // si algo se movió de verdad: eso es lo que permite llamarla después de cada
  // render sin entrar en bucle (la segunda medición da lo mismo y corta).
  const medir = useCallback(() => {
    const lienzo = lienzoRef.current;
    if (!lienzo) return;
    const base = lienzo.getBoundingClientRect();
    const medidas = {};
    Object.entries(nodoRefs.current).forEach(([id, el]) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      medidas[id] = {
        x: r.left - base.left,
        y: r.top - base.top,
        w: r.width,
        h: r.height,
        cx: r.left - base.left + r.width / 2,
        cy: r.top - base.top + r.height / 2,
      };
    });

    const previas = cajasRef.current;
    const idsPrevios = Object.keys(previas);
    const ids = Object.keys(medidas);
    const igual =
      idsPrevios.length === ids.length &&
      ids.every((id) => {
        const a = previas[id];
        const b = medidas[id];
        return a && Math.abs(a.cx - b.cx) < 0.5 && Math.abs(a.cy - b.cy) < 0.5
          && Math.abs(a.w - b.w) < 0.5 && Math.abs(a.h - b.h) < 0.5;
      });
    if (igual) return;

    cajasRef.current = medidas;
    setCajas(medidas);
  }, []);

  // Se mide después de CADA render, no solo cuando el lienzo cambia de tamaño.
  // Un ResizeObserver sobre el lienzo no alcanza: las tarjetas también se
  // mueven sin que el lienzo cambie (al cargar la tipografía, al reflowear una
  // etiqueta larga), y ahí las líneas quedarían dibujadas donde ya no hay nada.
  useLayoutEffect(() => {
    medir();
  });

  // Y además cuando cambia el tamaño del lienzo, que puede pasar sin render.
  useLayoutEffect(() => {
    const lienzo = lienzoRef.current;
    if (!lienzo || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(medir);
    observer.observe(lienzo);
    return () => observer.disconnect();
  }, [medir]);

  // Cuando el último paso queda finalizado, notificamos al motor una sola vez.
  useEffect(() => {
    if (pasoFase !== 'finalizado') return;
    if (pasoActual + 1 < pasos.length) return;
    if (yaNotificadoRef.current) return;
    yaNotificadoRef.current = true;
    setTerminado(true);
    onElegir([pasos[0].id], puntosAcumulados);
  }, [pasoFase, pasoActual, pasos.length, puntosAcumulados, onElegir, pasos]);

  // Cancelar la selección con Esc.
  useEffect(() => {
    if (nodoOrigenSeleccionado === null) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') {
        setNodoOrigenSeleccionado(null);
        setCursor(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nodoOrigenSeleccionado]);

  const paso = pasos[pasoActual];

  function narracionPara(pasoId) {
    return narraciones.find((n) => n.antesDePaso === pasoId)?.texto ?? '';
  }

  // Si no hay paso definido, mostramos el estado vacío DESPUÉS de los hooks.
  if (!paso) {
    return <div className="arq-vacia">No hay pasos definidos para esta decisión.</div>;
  }

  const nodoObjetivo = paso.tipo === 'activar' ? paso.nodoObjetivo : null;
  const nodoOrigen = paso.tipo === 'conectar' ? paso.nodoOrigen : null;
  const nodoDestino = paso.tipo === 'conectar' ? paso.nodoDestino : null;
  const hayOrigenSeleccionado = nodoOrigenSeleccionado !== null;
  const bloqueado = esperandoPaso || terminado || pasoFase !== 'seleccionar';

  function manejarMouseMove(e) {
    if (!hayOrigenSeleccionado) return;
    const lienzo = lienzoRef.current;
    if (!lienzo) return;
    const base = lienzo.getBoundingClientRect();
    setCursor({ x: e.clientX - base.left, y: e.clientY - base.top });
  }

  function manejarClickFondo() {
    if (hayOrigenSeleccionado) {
      setNodoOrigenSeleccionado(null);
      setCursor(null);
    }
  }

  function manejarClickNodo(nodoId) {
    if (bloqueado) return;

    if (paso.tipo === 'activar') {
      if (nodoId !== nodoObjetivo) return;
      setNodosActivos((prev) => new Set(prev).add(nodoObjetivo));
      setEsperandoPaso(true);
      setPasoFase('mecanografia');
      return;
    }

    if (paso.tipo !== 'conectar') return;

    if (!hayOrigenSeleccionado) {
      // Primer clic: tiene que ser en la pieza origen.
      if (nodoId !== nodoOrigen) return;
      setNodoOrigenSeleccionado(nodoOrigen);
      return;
    }

    // Segundo clic: tiene que ser en la pieza destino. Cualquier otra cancela.
    if (nodoId !== nodoDestino) {
      setNodoOrigenSeleccionado(null);
      setCursor(null);
      return;
    }
    setConexiones((prev) => new Set(prev).add(`${nodoOrigen}->${nodoDestino}`));
    setNodosActivos((prev) => new Set(prev).add(nodoDestino));
    setNodoOrigenSeleccionado(null);
    setCursor(null);
    setEsperandoPaso(true);
    setPasoFase('mecanografia');
  }

  function manejarResolucionMecanografia(puntos) {
    setPuntosAcumulados((p) => p + puntos);
    setEsperandoPaso(false);
    setPasoFase('finalizado');
  }

  function irAlSiguientePaso() {
    setPasoActual((p) => p + 1);
    setNodoOrigenSeleccionado(null);
    setCursor(null);
    setPasoFase('seleccionar');
  }

  // Estado visual de cada pieza. Solo un estado por pieza, en este orden de
  // prioridad: origen seleccionado > destino esperado > objetivo a encender >
  // ya encendida > apagada.
  function estadoNodo(nodoId) {
    if (hayOrigenSeleccionado && nodoId === nodoOrigenSeleccionado) return 'origen';
    if (hayOrigenSeleccionado && nodoId === nodoDestino) return 'destino';
    if (!bloqueado && paso.tipo === 'activar' && nodoId === nodoObjetivo) return 'objetivo';
    if (!bloqueado && paso.tipo === 'conectar' && !hayOrigenSeleccionado && nodoId === nodoOrigen) {
      return 'objetivo';
    }
    if (nodosActivos.has(nodoId)) return 'encendida';
    return 'apagada';
  }

  // Camino entre dos tarjetas. Si están en columnas distintas sale por el
  // costado con una curva horizontal; si comparten columna, por arriba/abajo.
  function caminoEntre(a, b) {
    if (!a || !b) return null;
    const horizontal = Math.abs(b.cx - a.cx) > Math.abs(b.cy - a.cy);
    if (horizontal) {
      const haciaLaDerecha = b.cx > a.cx;
      const x1 = haciaLaDerecha ? a.x + a.w : a.x;
      const x2 = haciaLaDerecha ? b.x : b.x + b.w;
      const control = Math.abs(x2 - x1) / 2;
      return `M ${x1} ${a.cy} C ${x1 + (haciaLaDerecha ? control : -control)} ${a.cy}, ${
        x2 - (haciaLaDerecha ? control : -control)
      } ${b.cy}, ${x2} ${b.cy}`;
    }
    const haciaAbajo = b.cy > a.cy;
    const y1 = haciaAbajo ? a.y + a.h : a.y;
    const y2 = haciaAbajo ? b.y : b.y + b.h;
    const control = Math.abs(y2 - y1) / 2;
    return `M ${a.cx} ${y1} C ${a.cx} ${y1 + (haciaAbajo ? control : -control)}, ${b.cx} ${
      y2 - (haciaAbajo ? control : -control)
    }, ${b.cx} ${y2}`;
  }

  const pasoListoParaAvanzar =
    pasoFase === 'finalizado' && pasoActual + 1 < pasos.length && !terminado;

  if (terminado) {
    return (
      <div className="arq-final">
        <div className="label-pixel">🏗️ ARQUITECTURA COMPLETADA</div>
        <div className="puntos-finales">
          <span className="valor">{puntosAcumulados}</span>
          <span className="etiqueta">pts acumulados</span>
        </div>
        <div className="feedback-final">
          Tu arquitectura está conectada. Mandemos la primera alerta de prueba.
        </div>
      </div>
    );
  }

  const accionDelPaso = paso.tipo === 'activar' ? 'Enciende' : 'Conecta';

  return (
    <div className="arq">
      <div className="arq-encabezado">
        <div className="label-pixel">🏗️ ARQUITECTURA DE NODOS</div>
        <div className="arq-medidores">
          <span className="medidor">
            PASO <strong>{pasoActual + 1}</strong>/{pasos.length}
          </span>
          <span className="medidor">
            PUNTOS <strong className="pts">{puntosAcumulados}</strong>
          </span>
        </div>
      </div>

      {/* Tablero: lienzo a la izquierda, panel del paso a la derecha. El panel
          es una columna propia y no una caja apilada debajo, así la
          mecanografía nunca empuja el mapa fuera de la pantalla. */}
      <div className="arq-tablero">
        <div
          className={`arq-lienzo${hayOrigenSeleccionado ? ' conectando' : ''}`}
          ref={lienzoRef}
          onMouseMove={manejarMouseMove}
          onClick={manejarClickFondo}
        >
          <svg className="arq-lineas" aria-hidden="true">
            <defs>
              {/* Punta de flecha: la dirección del flujo es información
                  pedagógica (la info va del cerebro hacia afuera), no adorno. */}
              <marker
                id="arq-flecha"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" className="arq-punta" />
              </marker>
            </defs>

            {[...conexiones].map((cx) => {
              const [origen, destino] = cx.split('->');
              const d = caminoEntre(cajas[origen], cajas[destino]);
              if (!d) return null;
              // pathLength va como atributo (en CSS no existe): normaliza el
              // largo a 1 para que el dasharray del keyframe dibuje la línea
              // completa, y que tarde lo mismo sea corta o larga.
              return (
                <path
                  key={cx}
                  d={d}
                  pathLength="1"
                  className="arq-conexion"
                  markerEnd="url(#arq-flecha)"
                />
              );
            })}

            {hayOrigenSeleccionado && cursor && cajas[nodoOrigenSeleccionado] && (
              <line
                x1={cajas[nodoOrigenSeleccionado].cx}
                y1={cajas[nodoOrigenSeleccionado].cy}
                x2={cursor.x}
                y2={cursor.y}
                className="arq-linea-cursor"
              />
            )}
          </svg>

          <div className="arq-columnas" style={{ '--columnas': columnas.length }}>
            {columnas.map((col, i) => (
              <div className="arq-columna" key={col.titulo ?? `col-${i}`}>
                {col.titulo && <div className="arq-columna-titulo">{col.titulo}</div>}
                <div className="arq-columna-piezas">
                  {col.nodos.map((n) => {
                    const estado = estadoNodo(n.id);
                    const clickeable =
                      !bloqueado &&
                      (estado === 'objetivo' || estado === 'destino' || estado === 'origen');
                    return (
                      <button
                        type="button"
                        key={n.id}
                        ref={(el) => {
                          nodoRefs.current[n.id] = el;
                        }}
                        className="arq-nodo"
                        data-estado={estado}
                        data-encendida={nodosActivos.has(n.id) ? 'si' : 'no'}
                        aria-pressed={nodosActivos.has(n.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          manejarClickNodo(n.id);
                        }}
                        style={{ cursor: clickeable ? 'pointer' : 'default' }}
                      >
                        <span className="arq-nodo-icono" aria-hidden="true">
                          {n.icono ?? ICONO_POR_DEFECTO}
                        </span>
                        <span className="arq-nodo-texto">
                          <span className="arq-nodo-label">{n.label}</span>
                          {n.subtitulo && (
                            <span className="arq-nodo-subtitulo">{n.subtitulo}</span>
                          )}
                        </span>
                        {clickeable && <span className="arq-nodo-senal" aria-hidden="true" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="arq-panel">
          <div className="arq-narracion">
            <span className="etiqueta">Rosa</span>
            <span className="texto">{narracionPara(paso.id)}</span>
          </div>

          {pasoFase === 'seleccionar' && (
            <div className="arq-instruccion">
              <span className="verbo">{accionDelPaso}</span>
              <span className="detalle">
                {paso.tipo === 'activar'
                  ? 'Toca la pieza que se está señalando.'
                  : hayOrigenSeleccionado
                    ? 'Ahora toca la pieza donde tiene que llegar la información.'
                    : 'Toca la pieza de donde sale la información.'}
              </span>
              {hayOrigenSeleccionado && (
                <span className="hint-cancelar">Esc para cancelar</span>
              )}
            </div>
          )}

          {pasoFase === 'mecanografia' && (
            <div className="arq-mecanografia">
              <div className="label-pixel">
                {paso.tipo === 'activar' ? '⌨️ ENCENDER' : '⌨️ CONECTAR'}
              </div>
              <Mecanografia
                codigo={paso.codigo}
                puntosMax={paso.puntosMax}
                puntosMin={paso.puntosMin}
                segundosParaSalto={paso.segundosParaSalto ?? 30}
                onResolver={manejarResolucionMecanografia}
              />
            </div>
          )}

          {pasoListoParaAvanzar && (
            <div className="arq-avanzar">
              <div className="feedback-box ok">Paso listo. Sigue el siguiente.</div>
              <button type="button" className="btn-primary" onClick={irAlSiguientePaso}>
                Siguiente paso →
              </button>
            </div>
          )}

          <div className="arq-progreso">
            {pasos.map((p, i) => (
              <span
                key={p.id}
                className="arq-progreso-paso"
                data-estado={i < pasoActual ? 'hecho' : i === pasoActual ? 'actual' : 'pendiente'}
                // El title NO lleva el código: mostraba por tooltip lo que hay
                // que tipear, incluso el de los pasos que todavía no llegaron.
                title={`Paso ${i + 1} de ${pasos.length}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
