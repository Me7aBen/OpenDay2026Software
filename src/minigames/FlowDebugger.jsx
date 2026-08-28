import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { reproducirEfecto } from '../lib/musica';
import { VALERIA_BUSTO } from '../features/simulations/ui/valeriaSprites';
import { actualizarBackendRush } from '../features/simulations/backendRush';
import { useBackendRush } from '../features/simulations/useBackendRush';
import {
  ARISTAS,
  SLOTS,
  calcularPuntaje,
  esFlujoPerfecto,
  rutaDeFallo,
  tableroCompleto,
  tableroVacio,
  validarFlujo,
} from './flujoDefensa';
import '../styles/backend-rush.css';
import '../styles/flow-debugger.css';

// BACKEND RUSH · NIVEL 2 — "Construye la defensa".
//
// El estudiante arma la arquitectura que impide que un reintento cree un
// segundo pedido. No es una cadena lineal: el corazón del nivel es la
// BIFURCACIÓN. El pedido llega, se verifica el ID, y ahí el sistema decide:
//
//     ¿ya existe?  ──SÍ──>  BLOQUEAR
//                  ──NO──>  CREAR → STOCK → ENVIAR
//
// La versión anterior de este minijuego resolvía la decisión con un botón
// ROTAR que cambiaba la "lógica interna" de la pieza VERIFICAR ID. Funcionaba,
// pero escondía justo lo que hay que enseñar: que un sistema toma caminos
// distintos según una condición. Ahora las dos ramas se ven, se llenan y se
// iluminan por separado, y por eso ROTAR ya no existe — no queda nada que
// rotar.
//
// Las reglas del puzzle viven en `flujoDefensa.js` (JS puro, con pruebas).
// Acá solo está el render y la animación.

const MS_PASO = 620;

function Icono({ nombre }) {
  const trazos = {
    pago: <path d="M3 7h18v11H3zM3 11h18M7 15h4" />,
    id: <path d="M12 3l8 4v6c0 4-3.5 7-8 8-4.5-1-8-4-8-8V7z M9 12l2 2 4-4" />,
    bloquear: <path d="M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3M12 15v2" />,
    crear: <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5" />,
    stock: <path d="M4 8h16v12H4zM4 8l3-4h10l3 4M12 8v12" />,
    enviar: <path d="M3 12l18-8-7 18-3-7z" />,
    reintento: <path d="M4 12a8 8 0 1 1 2.6 5.9M4 12V7m0 5h5" />,
    limite: <path d="M12 20a8 8 0 1 1 8-8M12 12l4-3" />,
    cola: <path d="M4 6h16v4H4zM4 14h16v4H4z" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {trazos[nombre] ?? <circle cx="12" cy="12" r="7" />}
    </svg>
  );
}

// Mide dónde quedaron los nodos y arma los caminos SVG que los unen. Se usa
// medición real en vez de coordenadas fijas para que el mismo diagrama funcione
// en 360px y en 1920px sin dos maquetaciones distintas.
function useConexiones(contenedorRef) {
  const [caminos, setCaminos] = useState([]);
  const [caja, setCaja] = useState({ w: 0, h: 0 });
  const ultimaRef = useRef({ w: 0, h: 0, firma: '' });

  const medir = useCallback(() => {
    const contenedor = contenedorRef.current;
    if (!contenedor) return;
    const base = contenedor.getBoundingClientRect();

    const punto = (id, borde) => {
      // Se consultan por atributo: así no hace falta un mapa de refs, que
      // obligaría a crear callbacks nuevas en cada render.
      const el = contenedor.querySelector(`[data-nodo="${id}"]`);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const x = r.left - base.left + r.width / 2;
      const y = borde === 'abajo' ? r.bottom - base.top : r.top - base.top;
      return { x, y };
    };

    const nuevos = ARISTAS.map((arista) => {
      const a = punto(arista.desde, 'abajo');
      const b = punto(arista.hasta, 'arriba');
      if (!a || !b) return null;
      const dy = Math.max(18, (b.y - a.y) * 0.55);
      return {
        ...arista,
        d: `M ${a.x} ${a.y} C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`,
      };
    }).filter(Boolean);

    // Solo se actualiza el estado si algo cambió de verdad. Sin esta guarda,
    // medir en cada render sería un bucle infinito.
    const firma = nuevos.map((n) => n.d).join('|');
    const anterior = ultimaRef.current;
    if (
      Math.abs(base.width - anterior.w) < 0.5 &&
      Math.abs(base.height - anterior.h) < 0.5 &&
      firma === anterior.firma
    ) {
      return;
    }
    ultimaRef.current = { w: base.width, h: base.height, firma };
    setCaja({ w: base.width, h: base.height });
    setCaminos(nuevos);
  }, [contenedorRef]);

  // Se mide DESPUÉS DE CADA RENDER, no solo cuando avisa un observer.
  //
  // La razón es defensiva: ResizeObserver y el evento `resize` no llegan en
  // todos los entornos (en el navegador de pruebas de este proyecto no se
  // disparan nunca), y si el viewBox se queda con la medida anterior las líneas
  // apuntan a donde los nodos ya no están. Medir en cada render es barato —
  // siete `getBoundingClientRect`— y la guarda de arriba corta el bucle.
  useLayoutEffect(() => {
    medir();
  });

  // Y además se escuchan los avisos, para que en los navegadores donde SÍ
  // llegan el redibujo sea inmediato y no espere a la próxima interacción.
  useLayoutEffect(() => {
    const frame = requestAnimationFrame(medir);
    const contenedor = contenedorRef.current;
    const observador =
      contenedor && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(medir) : null;
    observador?.observe(contenedor);
    window.addEventListener('resize', medir);
    window.addEventListener('orientationchange', medir);
    return () => {
      cancelAnimationFrame(frame);
      observador?.disconnect();
      window.removeEventListener('resize', medir);
      window.removeEventListener('orientationchange', medir);
    };
  }, [medir, contenedorRef]);

  return { caminos, caja };
}


// Nodo del tablero. Vive fuera del componente a propósito: definido adentro se
// recrearía en cada render y React remontaría cada tarjeta, perdiendo las refs
// con las que se miden las conexiones.
function Nodo({
  id,
  fijo = false,
  pieza,
  etiquetaRama,
  slotActivo,
  slotsConError,
  resuelto,
  bloqueado,
  textoVacio,
  onTocar,
  onSoltar,
}) {
  const conError = slotsConError?.includes(id);
  const clases = [
    'fd-nodo',
    fijo ? 'fijo' : 'slot',
    pieza ? `lleno tono-${pieza.tono ?? 'cyan'}` : 'vacio',
    slotActivo === id ? 'activo' : '',
    conError ? 'error' : '',
    resuelto ? 'validado' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const contenido = pieza ? (
    <>
      <span className="fd-nodo-icono">
        <Icono nombre={pieza.icono} />
      </span>
      <span className="fd-nodo-nombre">{pieza.nombre}</span>
    </>
  ) : (
    <>
      <span className="fd-nodo-mas" aria-hidden="true">
        +
      </span>
      <span className="fd-nodo-vacio">{textoVacio}</span>
    </>
  );

  if (fijo) {
    return (
      <div className={clases} data-nodo={id}>
        {contenido}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={clases}
      data-nodo={id}
      onClick={() => onTocar(id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const piezaId = e.dataTransfer.getData('text/plain');
        if (piezaId) onSoltar(id, piezaId);
      }}
      aria-label={
        pieza
          ? `Ranura ${etiquetaRama ?? id}: ${pieza.nombre}. Tocar para seleccionar.`
          : `Ranura vacía ${etiquetaRama ?? id}. Tocar para colocar el componente seleccionado.`
      }
      disabled={bloqueado}
    >
      {contenido}
    </button>
  );
}

export default function FlowDebugger({ decision, onElegir }) {
  const meta = useMemo(() => decision.metaMinijuego ?? {}, [decision.metaMinijuego]);
  const piezas = useMemo(() => meta.piezas ?? [], [meta]);
  const textos = useMemo(() => meta.textos ?? {}, [meta]);
  const pistas = useMemo(() => meta.pistas ?? [], [meta]);
  const sistema = useBackendRush();

  const [tablero, setTablero] = useState(tableroVacio);
  const [seleccion, setSeleccion] = useState(null);
  const [slotActivo, setSlotActivo] = useState(null);
  const [estado, setEstado] = useState('armando'); // armando | probando | fallo | resuelto
  const [consola, setConsola] = useState([]);
  const [aristasOn, setAristasOn] = useState([]);
  const [aristaPulso, setAristaPulso] = useState(null);
  const [diagnostico, setDiagnostico] = useState(null);
  const [intentos, setIntentos] = useState(0);
  const [pistasVistas, setPistasVistas] = useState(0);
  const [logsAbiertos, setLogsAbiertos] = useState(false);
  const [comoAbierto, setComoAbierto] = useState(false);
  const [fasePrueba, setFasePrueba] = useState(null); // 'nuevo' | 'reintento'
  const [perfecto, setPerfecto] = useState(false);

  const contenedorRef = useRef(null);
  const temporizadores = useRef([]);
  const notificado = useRef(false);
  const consolaRef = useRef(null);

  const { caminos, caja } = useConexiones(contenedorRef);

  useEffect(() => {
    const pendientes = temporizadores.current;
    return () => pendientes.forEach(clearTimeout);
  }, []);

  // La consola sigue al último renglón, como una terminal de verdad.
  useEffect(() => {
    if (consolaRef.current) consolaRef.current.scrollTop = consolaRef.current.scrollHeight;
  }, [consola]);

  const colocadas = Object.values(tablero).filter(Boolean);
  const bloqueado = estado === 'probando' || estado === 'resuelto';
  const completo = tableroCompleto(tablero);

  const piezaDe = useCallback((id) => piezas.find((p) => p.id === id) ?? null, [piezas]);

  // --- Colocar y quitar ---------------------------------------------------

  function colocarEn(slotId, piezaId) {
    if (bloqueado) return;
    setTablero((actual) => {
      const siguiente = { ...actual };
      // Una pieza está una sola vez en el tablero: si ya estaba puesta, se mueve.
      for (const clave of Object.keys(siguiente)) {
        if (siguiente[clave] === piezaId) siguiente[clave] = null;
      }
      siguiente[slotId] = piezaId;
      return siguiente;
    });
    setSeleccion(null);
    setSlotActivo(slotId);
    setEstado('armando');
    setDiagnostico(null);
  }

  function tocarSlot(slotId) {
    if (bloqueado) return;
    if (seleccion) {
      colocarEn(slotId, seleccion);
      return;
    }
    setSlotActivo((actual) => (actual === slotId ? null : slotId));
  }

  function tocarPieza(piezaId) {
    if (bloqueado) return;
    const pieza = piezaDe(piezaId);
    if (pieza?.bloqueada) return;
    if (seleccion === piezaId) {
      setSeleccion(null);
      return;
    }
    // Si hay un slot vacío seleccionado, la pieza cae ahí. Si no, va al primer
    // hueco libre: en el celular se arma tocando pieza tras pieza.
    if (slotActivo && !tablero[slotActivo]) {
      colocarEn(slotActivo, piezaId);
      return;
    }
    const libre = SLOTS.find((slot) => !tablero[slot.id]);
    if (libre) {
      colocarEn(libre.id, piezaId);
      return;
    }
    setSeleccion(piezaId);
  }

  function quitar() {
    if (bloqueado || !slotActivo || !tablero[slotActivo]) return;
    setTablero((actual) => ({ ...actual, [slotActivo]: null }));
    setEstado('armando');
    setDiagnostico(null);
  }

  function reiniciar() {
    if (bloqueado) return;
    temporizadores.current.forEach(clearTimeout);
    setTablero(tableroVacio());
    setSeleccion(null);
    setSlotActivo(null);
    setConsola([]);
    setAristasOn([]);
    setAristaPulso(null);
    setDiagnostico(null);
    setFasePrueba(null);
    setEstado('armando');
  }

  function pedirPista() {
    if (pistasVistas >= pistas.length) return;
    setPistasVistas((n) => n + 1);
  }

  // --- Reproducción de una secuencia --------------------------------------
  //
  // Cada paso enciende (opcionalmente) una arista y escribe un renglón en la
  // consola. El pulso viaja por la arista mientras dura el paso.

  const reproducir = useCallback((pasos, alTerminar) => {
    let t = 0;
    pasos.forEach((paso) => {
      const id = setTimeout(() => {
        if (paso.arista) {
          setAristaPulso(paso.arista);
          setAristasOn((actual) => [...new Set([...actual, paso.arista])]);
        }
        if (paso.texto) {
          setConsola((actual) => [...actual, { texto: paso.texto, tono: paso.tono ?? 'info' }]);
        }
      }, t);
      temporizadores.current.push(id);
      t += paso.ms ?? MS_PASO;
    });
    const fin = setTimeout(() => {
      setAristaPulso(null);
      alTerminar?.();
    }, t + 200);
    temporizadores.current.push(fin);
  }, []);

  // --- Probar el flujo ----------------------------------------------------

  function probar() {
    if (!completo || bloqueado) return;
    const numeroIntento = intentos + 1;
    setIntentos(numeroIntento);
    setEstado('probando');
    setConsola([]);
    setAristasOn([]);
    setDiagnostico(null);

    const resultado = validarFlujo(tablero);

    if (!resultado.ok) {
      const fallo = (meta.fallos ?? {})[resultado.codigo] ?? {};
      const ruta = rutaDeFallo(resultado.codigo);
      const lineas = fallo.consola ?? [];
      // Los renglones de consola se reparten sobre las aristas del recorrido:
      // el pulso avanza mientras el log cuenta lo que va pasando.
      const pasos = lineas.map((linea, i) => ({
        texto: linea.texto,
        tono: linea.tono,
        arista: ruta[i] ?? undefined,
      }));
      reproducir(pasos, () => {
        setEstado('fallo');
        setDiagnostico({ ...resultado, ...fallo });
        actualizarBackendRush({
          errores: (n) => n + 1,
          estabilidad: (n) => n - 6,
        });
        reproducirEfecto('error');
      });
      return;
    }

    // Éxito: dos simulaciones seguidas, el pedido nuevo y su reintento.
    setFasePrueba('nuevo');
    const pasosNuevo = (meta.simulacionNuevo ?? []).map((p) => ({ ...p }));
    reproducir(pasosNuevo, () => {
      setAristasOn([]);
      setFasePrueba('reintento');
      const pasosReintento = (meta.simulacionReintento ?? []).map((p) => ({ ...p }));
      reproducir(pasosReintento, () => {
        const fuePerfecto = esFlujoPerfecto({ intentos: numeroIntento, pistasUsadas: pistasVistas });
        setPerfecto(fuePerfecto);
        setEstado('resuelto');
        reproducirEfecto('codigoOk');
        actualizarBackendRush({
          nivelActual: 2,
          duplicadosBloqueados: (n) => n + 1,
          pedidosProcesados: (n) => n + 1,
          estabilidad: (n) => n + (meta.estabilidadAlResolver ?? 8),
        });
        if (notificado.current) return;
        notificado.current = true;
        const puntos = calcularPuntaje({
          intentos: numeroIntento,
          pistasUsadas: pistasVistas,
          puntosMax: meta.puntosMax,
          puntosMin: meta.puntosMin,
          penalizacionPorIntento: meta.penalizacionPorIntento,
          penalizacionPorPista: meta.penalizacionPorPista,
        });
        onElegir([meta.idRespuesta ?? 'defensa-construida'], puntos);
      });
    });
  }

  // --- Render -------------------------------------------------------------

  const piezaSeleccionada = seleccion ? piezaDe(seleccion) : null;
  const piezaEnSlotActivo = slotActivo && tablero[slotActivo] ? piezaDe(tablero[slotActivo]) : null;


  return (
    <div className="br fd">
      {/* --- Cabecera --- */}
      <div className="fd-cabecera">
        <div className="fd-titulo-zona">
          <span className="uu-insignia">⚡ BACKEND RUSH ⚡</span>
          <div className="br-nivel">{textos.rotuloNivel ?? 'NIVEL 2 · CONSTRUYE LA DEFENSA'}</div>
          <p className="fd-objetivo">{textos.objetivo ?? decision.pregunta}</p>
        </div>

        <div className="fd-estabilidad-caja">
          <div className="fd-estabilidad-fila">
            <span className="fd-estabilidad-rotulo">ESTABILIDAD DEL SISTEMA</span>
            <span
              className="fd-estabilidad-pct"
              style={{ color: sistema.estabilidad >= 70 ? 'var(--green)' : 'var(--gold)' }}
            >
              {sistema.estabilidad}%
            </span>
          </div>
          <div className="fd-estabilidad-barra" role="img" aria-label={`Estabilidad ${sistema.estabilidad}%`}>
            <span
              style={{
                width: `${sistema.estabilidad}%`,
                background: sistema.estabilidad >= 70 ? 'var(--green)' : 'var(--gold)',
              }}
            />
          </div>
          <div className="fd-metricas">
            <span>
              Pedidos <strong>{sistema.pedidosProcesados}</strong>
            </span>
            <span>
              Duplicados bloqueados <strong style={{ color: 'var(--cyan)' }}>{sistema.duplicadosBloqueados}</strong>
            </span>
            <span>
              Errores{' '}
              <strong style={{ color: sistema.errores ? 'var(--red)' : 'var(--text-dim)' }}>
                {sistema.errores}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* --- Valeria --- */}
      <div className="br-valeria fd-valeria">
        <img className="valeria-busto" src={VALERIA_BUSTO} alt="Valeria, Tech Lead" />
        <div className="br-globo" key={estado + intentos + pistasVistas}>
          <div className="br-globo-quien">VALERIA</div>
          <p>
            {estado === 'resuelto'
              ? (textos.valeriaExito ?? 'El mismo pedido ya no puede entrar dos veces.')
              : diagnostico?.valeria
                ? diagnostico.valeria
                : (textos.valeriaInicio ?? 'Ahora construye el flujo correcto.')}
          </p>
        </div>
      </div>

      <div className="fd-cuerpo">
        {/* --- Tablero --- */}
        <div className="fd-tablero-zona">
          <div className="fd-tablero" ref={contenedorRef}>
            <svg
              className="fd-lineas"
              viewBox={`0 0 ${caja.w || 1} ${caja.h || 1}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {caminos.map((camino) => (
                <g key={camino.id}>
                  <path className={`fd-arista tono-${camino.tono}`} d={camino.d} />
                  {aristasOn.includes(camino.id) && (
                    <path className={`fd-arista-activa tono-${camino.tono}`} d={camino.d} />
                  )}
                  {aristaPulso === camino.id && (
                    <path
                      className={`fd-arista-pulso tono-${camino.tono}`}
                      d={camino.d}
                      pathLength="100"
                    />
                  )}
                </g>
              ))}
            </svg>

            <div className="fd-grid">
              <div className="fd-fila-centro">
                <Nodo
                id="pago"
                fijo
                pieza={{ nombre: 'PAGO', icono: 'pago', tono: 'cyan' }}
              />
              </div>

              <div className="fd-fila-centro">
                <Nodo
                id="verificar"
                pieza={piezaDe(tablero.verificar)}
                etiquetaRama="principal"
                slotActivo={slotActivo}
                slotsConError={diagnostico?.slots}
                resuelto={estado === 'resuelto'}
                bloqueado={bloqueado}
                textoVacio={textos.slotVacio ?? 'Coloca aquí'}
                onTocar={tocarSlot}
                onSoltar={colocarEn}
              />
              </div>

              <div className="fd-fila-centro">
                <div className="fd-decision" data-nodo="decision">
                  <span className="fd-decision-texto">{textos.decision ?? '¿YA EXISTE?'}</span>
                </div>
              </div>

              {/* Las etiquetas SÍ / NO son texto, no solo color (§33). */}
              <div className="fd-fila-ramas">
                <span className="fd-rama-etiqueta si">SÍ</span>
                <span className="fd-rama-etiqueta no">NO</span>
              </div>

              <div className="fd-fila-ramas">
                <Nodo
                  id="si"
                  pieza={piezaDe(tablero.si)}
                  etiquetaRama="rama SÍ"
                slotActivo={slotActivo}
                slotsConError={diagnostico?.slots}
                resuelto={estado === 'resuelto'}
                bloqueado={bloqueado}
                textoVacio={textos.slotVacio ?? 'Coloca aquí'}
                onTocar={tocarSlot}
                onSoltar={colocarEn}
                />
                <Nodo
                  id="no"
                  pieza={piezaDe(tablero.no)}
                  etiquetaRama="rama NO"
                slotActivo={slotActivo}
                slotsConError={diagnostico?.slots}
                resuelto={estado === 'resuelto'}
                bloqueado={bloqueado}
                textoVacio={textos.slotVacio ?? 'Coloca aquí'}
                onTocar={tocarSlot}
                onSoltar={colocarEn}
                />
              </div>

              <div className="fd-fila-ramas">
                <span className="fd-rama-fin">fin de la rama SÍ</span>
                <Nodo
                  id="stock"
                  pieza={piezaDe(tablero.stock)}
                  etiquetaRama="rama NO, paso 2"
                slotActivo={slotActivo}
                slotsConError={diagnostico?.slots}
                resuelto={estado === 'resuelto'}
                bloqueado={bloqueado}
                textoVacio={textos.slotVacio ?? 'Coloca aquí'}
                onTocar={tocarSlot}
                onSoltar={colocarEn}
                />
              </div>

              <div className="fd-fila-ramas">
                <span />
                <Nodo
                  id="enviar"
                  pieza={piezaDe(tablero.enviar)}
                  etiquetaRama="rama NO, paso 3"
                slotActivo={slotActivo}
                slotsConError={diagnostico?.slots}
                resuelto={estado === 'resuelto'}
                bloqueado={bloqueado}
                textoVacio={textos.slotVacio ?? 'Coloca aquí'}
                onTocar={tocarSlot}
                onSoltar={colocarEn}
                />
              </div>
            </div>
          </div>

          {/* --- Barra de selección + acciones --- */}
          <div className="fd-barra">
            <div className="fd-seleccionado" aria-live="polite">
              <span className="etiqueta">COMPONENTE SELECCIONADO</span>
              <strong>
                {piezaSeleccionada?.nombre ?? piezaEnSlotActivo?.nombre ?? '—'}
              </strong>
            </div>
            <div className="fd-botones">
              <button type="button" className="fd-boton" onClick={quitar} disabled={bloqueado || !piezaEnSlotActivo}>
                ✕ QUITAR
              </button>
              <button type="button" className="fd-boton" onClick={reiniciar} disabled={bloqueado}>
                ↺ REINICIAR
              </button>
              <button
                type="button"
                className="fd-boton"
                onClick={pedirPista}
                disabled={pistasVistas >= pistas.length}
              >
                💡 PISTA {pistas.length ? `${pistasVistas}/${pistas.length}` : ''}
              </button>
              <button type="button" className="fd-boton solo-movil" onClick={() => setComoAbierto((v) => !v)}>
                ? AYUDA
              </button>
            </div>
          </div>

          {pistasVistas > 0 && (
            <div className="fd-pistas">
              {pistas.slice(0, pistasVistas).map((pista, i) => (
                <div className="feedback-box info" key={pista}>
                  <strong>Pista {i + 1}:</strong> {pista}
                </div>
              ))}
            </div>
          )}

          {diagnostico && estado === 'fallo' && (
            <div className="fd-diagnostico" role="status">
              <div className="fd-diagnostico-titulo">{diagnostico.titulo ?? 'EL FLUJO FALLÓ'}</div>
              <p>{diagnostico.mensaje}</p>
            </div>
          )}

          <button type="button" className="fd-probar" onClick={probar} disabled={!completo || bloqueado}>
            {estado === 'probando'
              ? `PROBANDO${fasePrueba === 'reintento' ? ' EL REINTENTO' : ''}…`
              : '▶ PROBAR FLUJO'}
          </button>
        </div>

        {/* --- Panel lateral --- */}
        <aside className="fd-panel">
          <section className={`fd-panel-bloque fd-como${comoAbierto ? ' abierto' : ''}`}>
            <button
              type="button"
              className="fd-panel-titulo fd-acordeon"
              onClick={() => setComoAbierto((v) => !v)}
              aria-expanded={comoAbierto}
            >
              ? ¿CÓMO FUNCIONA?
            </button>
            <ol className="fd-como-lista">
              {(textos.comoFunciona ?? []).map((linea) => (
                <li key={linea}>{linea}</li>
              ))}
            </ol>
          </section>

          <section className="fd-panel-bloque fd-inventario">
            <div className="fd-panel-titulo">COMPONENTES DISPONIBLES</div>
            <div className="fd-piezas">
              {piezas.map((pieza) => {
                const usada = colocadas.includes(pieza.id);
                const activa = seleccion === pieza.id;
                return (
                  <button
                    key={pieza.id}
                    type="button"
                    className={`fd-pieza tono-${pieza.tono ?? 'cyan'}${usada ? ' usada' : ''}${
                      activa ? ' activa' : ''
                    }${pieza.bloqueada ? ' bloqueada' : ''}`}
                    onClick={() => tocarPieza(pieza.id)}
                    disabled={bloqueado || usada || pieza.bloqueada}
                    draggable={!usada && !bloqueado && !pieza.bloqueada}
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', pieza.id)}
                  >
                    <span className="fd-pieza-icono">
                      <Icono nombre={pieza.icono} />
                    </span>
                    <span className="fd-pieza-textos">
                      <span className="fd-pieza-nombre">{pieza.nombre}</span>
                      <span className="fd-pieza-desc">{pieza.descripcion}</span>
                    </span>
                    {pieza.bloqueada && <span className="fd-pieza-candado">próximo nivel</span>}
                  </button>
                );
              })}
            </div>
            <p className="fd-inventario-nota">{textos.notaInventario ?? 'Arrastra o toca para colocar.'}</p>
          </section>
        </aside>
      </div>

      {/* --- Consola --- */}
      <div className={`fd-consola-caja${logsAbiertos ? ' abierta' : ''}`}>
        <button
          type="button"
          className="fd-consola-toggle"
          onClick={() => setLogsAbiertos((v) => !v)}
          aria-expanded={logsAbiertos}
        >
          <span>SIMULACIÓN EN TIEMPO REAL</span>
          <span aria-hidden="true">{logsAbiertos ? '▾ OCULTAR' : '▸ VER LOGS'}</span>
        </button>
        <div className="fd-consola" ref={consolaRef} role="log" aria-live="polite">
          {consola.length === 0 ? (
            <div className="fd-linea info">{textos.consolaVacia ?? '> esperando a que pruebes el flujo…'}</div>
          ) : (
            consola.map((linea, i) => (
              <div key={i} className={`fd-linea ${linea.tono}`}>
                {linea.texto}
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- Éxito --- */}
      {estado === 'resuelto' && (
        <div className="fd-exito">
          <div className="fd-exito-titulo">
            {textos.tituloExito ?? 'DEFENSA CONSTRUIDA'}
            {perfecto && <span className="fd-combo">FLUJO PERFECTO ×2</span>}
          </div>

          <ul className="fd-exito-datos">
            {(textos.resumenExito ?? []).map((linea) => (
              <li key={linea}>{linea}</li>
            ))}
          </ul>

          <div className="fd-buena-practica">
            <div className="fd-mini-titulo">✅ BUENA PRÁCTICA</div>
            <p>{textos.buenaPractica}</p>
          </div>

          <div className="fd-concepto">
            <div className="fd-mini-titulo">🔓 CONCEPTO DESBLOQUEADO</div>
            <div className="fd-concepto-nombre">{textos.conceptoNombre ?? 'IDEMPOTENCIA'}</div>
            <p>{textos.conceptoTexto}</p>
            <pre className="fd-concepto-formula">{textos.conceptoFormula}</pre>
          </div>

          <div className="fd-codigo-bloque">
            <div className="fd-mini-titulo">{textos.tituloCodigo ?? 'EN CÓDIGO SE ESCRIBE ASÍ'}</div>
            <pre className="fd-codigo">
              <code>{textos.codigo}</code>
            </pre>
            <p className="fd-codigo-nota">{textos.valeriaCodigo}</p>
          </div>

          <p className="fd-transicion">{textos.transicion}</p>
        </div>
      )}
    </div>
  );
}
