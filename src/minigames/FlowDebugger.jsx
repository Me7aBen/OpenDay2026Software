import { useEffect, useRef, useState } from 'react';
import { reproducirEfecto } from '../lib/musica';
import '../styles/flow-debugger.css';

// FLOW DEBUGGER — mecánica principal de "El Pedido Fantasma" (§30–§35).
//
// El estudiante arma el flujo que sigue una compra dentro del backend. No es un
// circuito eléctrico ni una copia de ningún juego: son nodos de arquitectura
// encadenados, cada uno con su nombre real ("VERIFICAR ID", "CREAR PEDIDO").
//
// Dos reglas de diseño mandan sobre todo lo demás:
//
// 1. TOUCH PRIMERO (§34, §54). El flujo canónico es tocar-pieza → tocar-celda.
//    El drag & drop existe además, para mouse, pero NADA depende de él: si el
//    navegador no dispara un solo evento de drag, el puzzle se resuelve igual.
//    Por eso todas las celdas y piezas son <button> reales: funcionan con dedo,
//    con mouse, con teclado y con lector de pantalla.
//
// 2. ROTAR ES LA REGLA CENTRAL (§33). "VERIFICAR ID" tiene dos lógicas posibles
//    y solo una evita el duplicado: si el pedido YA existe hay que BLOQUEARLO,
//    no crearlo de nuevo. Rotar la pieza cambia esa lógica. Así el botón ROTAR
//    no es decorativo: es donde vive la enseñanza del reto.
//
// El puntaje lo calcula el componente y lo manda como `puntajeDirecto`, que es
// el camino que el motor ya tenía para las mecánicas que saben cuánto valen.

const TONOS = { ok: 'ok', error: 'error', aviso: 'aviso', info: 'info' };

function Icono({ nombre }) {
  const trazos = {
    carrito: <path d="M3 4h3l2.5 10h9L20 7H7" />,
    stock: <path d="M4 8h16v12H4zM4 8l3-4h10l3 4M12 8v12" />,
    pago: <path d="M3 7h18v11H3zM3 11h18M7 15h4" />,
    id: <path d="M12 3l8 4v6c0 4-3.5 7-8 8-4.5-1-8-4-8-8V7z M9 12l2 2 4-4" />,
    pedido: <path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5" />,
    enviar: <path d="M3 12l18-8-7 18-3-7z" />,
    reintento: <path d="M4 12a8 8 0 1 1 2.6 5.9M4 12V7m0 5h5" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {trazos[nombre] ?? <circle cx="12" cy="12" r="7" />}
    </svg>
  );
}

export default function FlowDebugger({ decision, onElegir }) {
  const meta = decision.metaMinijuego ?? {};
  const piezas = meta.piezas ?? [];
  const flujoCorrecto = meta.flujoCorrecto ?? [];
  const orientacionesCorrectas = meta.orientacionesCorrectas ?? {};
  const totalCeldas = flujoCorrecto.length;

  // tablero: array de { piezaId, orientacionId } | null
  const [tablero, setTablero] = useState(() => Array(totalCeldas).fill(null));
  const [seleccion, setSeleccion] = useState(null); // { origen: 'inventario'|'tablero', id|indice }
  const [intentos, setIntentos] = useState(0);
  const [estado, setEstado] = useState('armando'); // armando | probando | resuelto | fallo
  const [consola, setConsola] = useState([]);
  const [aviso, setAviso] = useState(null);
  const notificado = useRef(false);
  const temporizadores = useRef([]);

  useEffect(() => {
    const pendientes = temporizadores.current;
    return () => pendientes.forEach(clearTimeout);
  }, []);

  const colocadas = tablero.filter(Boolean).map((c) => c.piezaId);
  const completo = tablero.every(Boolean);
  const bloqueado = estado === 'probando' || estado === 'resuelto';

  function piezaDe(id) {
    return piezas.find((p) => p.id === id) ?? null;
  }

  function orientacionDe(celda) {
    const pieza = piezaDe(celda.piezaId);
    if (!pieza?.orientaciones?.length) return null;
    return pieza.orientaciones.find((o) => o.id === celda.orientacionId) ?? pieza.orientaciones[0];
  }

  function limpiarAviso() {
    setAviso(null);
  }

  // --- Colocar / quitar ---------------------------------------------------

  function colocarEn(indice, piezaId) {
    if (bloqueado) return;
    const pieza = piezaDe(piezaId);
    if (!pieza) return;
    setTablero((actual) => {
      const siguiente = [...actual];
      // Si la pieza ya estaba en otra celda, se mueve (no se duplica).
      const anterior = siguiente.findIndex((c) => c?.piezaId === piezaId);
      if (anterior >= 0) siguiente[anterior] = null;
      siguiente[indice] = {
        piezaId,
        orientacionId: pieza.orientaciones?.[0]?.id ?? null,
      };
      return siguiente;
    });
    setSeleccion({ origen: 'tablero', indice });
    setEstado('armando');
    limpiarAviso();
  }

  function tocarCelda(indice) {
    if (bloqueado) return;
    const celda = tablero[indice];

    if (seleccion?.origen === 'inventario') {
      colocarEn(indice, seleccion.id);
      return;
    }
    // Mover una pieza a un hueco: solo cuando lo SELECCIONADO es una celda
    // vacía y se toca una llena. Antes cualquier par de celdas se intercambiaba,
    // y como colocar dejaba seleccionada la última celda, el primer toque en
    // otra pieza reordenaba el flujo sin que nadie lo pidiera.
    if (
      seleccion?.origen === 'tablero' &&
      seleccion.indice !== indice &&
      !tablero[seleccion.indice] &&
      celda
    ) {
      setTablero((actual) => {
        const siguiente = [...actual];
        siguiente[seleccion.indice] = celda;
        siguiente[indice] = null;
        return siguiente;
      });
      setSeleccion({ origen: 'tablero', indice: seleccion.indice });
      setEstado('armando');
      return;
    }
    // Una celda siempre se puede seleccionar, esté llena o vacía. Seleccionar
    // una vacía es la forma de decir "la próxima pieza va acá"; seleccionar una
    // llena es lo que habilita ROTAR y QUITAR.
    setSeleccion({ origen: 'tablero', indice });
  }

  function tocarPieza(piezaId) {
    if (bloqueado) return;
    limpiarAviso();
    // Volver a tocar la pieza ya seleccionada la deselecciona.
    if (seleccion?.origen === 'inventario' && seleccion.id === piezaId) {
      setSeleccion(null);
      return;
    }
    // Si hay una celda vacía seleccionada, la pieza cae exactamente ahí.
    if (seleccion?.origen === 'tablero' && !tablero[seleccion.indice]) {
      colocarEn(seleccion.indice, piezaId);
      return;
    }
    // Si no, va a la primera celda libre. Ese es el caso normal en el celular:
    // se toca pieza tras pieza y el flujo se arma en orden, sin apuntar a
    // ninguna casilla. Antes esto solo funcionaba para la primera pieza,
    // porque colocar dejaba seleccionada la celda recién llenada.
    const libre = tablero.findIndex((c) => !c);
    if (libre >= 0) {
      colocarEn(libre, piezaId);
      return;
    }
    // Tablero lleno: la pieza queda "en la mano" para intercambiarla tocando
    // la celda que se quiera reemplazar.
    setSeleccion({ origen: 'inventario', id: piezaId });
  }

  function rotar() {
    if (bloqueado || seleccion?.origen !== 'tablero') {
      setAviso('Selecciona una pieza del flujo para rotar su lógica.');
      return;
    }
    const celda = tablero[seleccion.indice];
    const pieza = celda && piezaDe(celda.piezaId);
    if (!pieza?.orientaciones?.length || pieza.orientaciones.length < 2) {
      setAviso(`${pieza?.nombre ?? 'Esta pieza'} tiene una sola forma de funcionar.`);
      return;
    }
    setTablero((actual) => {
      const siguiente = [...actual];
      const posicion = pieza.orientaciones.findIndex((o) => o.id === celda.orientacionId);
      const proxima = pieza.orientaciones[(posicion + 1) % pieza.orientaciones.length];
      siguiente[seleccion.indice] = { ...celda, orientacionId: proxima.id };
      return siguiente;
    });
    setEstado('armando');
    limpiarAviso();
  }

  function quitar() {
    if (bloqueado) return;
    if (seleccion?.origen !== 'tablero' || !tablero[seleccion.indice]) {
      setAviso('Selecciona una pieza del flujo para quitarla.');
      return;
    }
    setTablero((actual) => {
      const siguiente = [...actual];
      siguiente[seleccion.indice] = null;
      return siguiente;
    });
    setSeleccion(null);
    setEstado('armando');
    limpiarAviso();
  }

  function reiniciar() {
    if (bloqueado) return;
    setTablero(Array(totalCeldas).fill(null));
    setSeleccion(null);
    setConsola([]);
    setEstado('armando');
    limpiarAviso();
  }

  // --- Probar el flujo ----------------------------------------------------

  function ordenCorrecto() {
    return tablero.every((celda, i) => celda?.piezaId === flujoCorrecto[i]);
  }

  function orientacionesOk() {
    return Object.entries(orientacionesCorrectas).every(([piezaId, orientacionId]) => {
      const celda = tablero.find((c) => c?.piezaId === piezaId);
      return celda?.orientacionId === orientacionId;
    });
  }

  function primerErrorDeOrden() {
    const indice = tablero.findIndex((celda, i) => celda?.piezaId !== flujoCorrecto[i]);
    return indice >= 0 ? indice : null;
  }

  function reproducirConsola(lineas, alTerminar) {
    setConsola([]);
    lineas.forEach((linea, i) => {
      const id = setTimeout(() => {
        setConsola((actual) => [...actual, linea]);
      }, 260 * (i + 1));
      temporizadores.current.push(id);
    });
    const fin = setTimeout(() => alTerminar(), 260 * (lineas.length + 1));
    temporizadores.current.push(fin);
  }

  function probar() {
    if (!completo || bloqueado) return;
    const numeroIntento = intentos + 1;
    setIntentos(numeroIntento);
    setEstado('probando');
    limpiarAviso();

    const ordenOk = ordenCorrecto();
    const logicaOk = orientacionesOk();

    if (ordenOk && logicaOk) {
      reproducirConsola(meta.consolaExito ?? [], () => {
        const maximo = meta.puntosMax ?? 180;
        const minimo = meta.puntosMin ?? 60;
        const castigo = meta.penalizacionPorIntento ?? 30;
        const puntos = Math.max(minimo, maximo - (numeroIntento - 1) * castigo);
        setEstado('resuelto');
        reproducirEfecto('codigoOk');
        if (!notificado.current) {
          notificado.current = true;
          onElegir([meta.idRespuesta ?? 'flujo-estable'], puntos);
        }
      });
      return;
    }

    const indiceMal = primerErrorDeOrden();
    // Un mensaje concreto enseña; "revisa el paso 3" no. Si el jugador metió
    // una pieza que no pertenece al flujo, se dice cuál y por qué.
    const intrusa = tablero
      .map((celda) => celda && piezaDe(celda.piezaId))
      .find((pieza) => pieza && !flujoCorrecto.includes(pieza.id));
    const lineasFallo = ordenOk
      ? (meta.consolaLogicaMal ?? [])
      : (meta.consolaOrdenMal ?? []).map((linea) =>
          typeof linea === 'string' ? { texto: linea, tono: 'error' } : linea,
        );

    reproducirConsola(lineasFallo, () => {
      setEstado('fallo');
      if (ordenOk) {
        setAviso(
          meta.mensajeLogicaMal ??
            'El orden está bien, pero la verificación decide al revés: si el pedido YA existe, hay que bloquearlo.',
        );
      } else if (intrusa) {
        setAviso(
          `${intrusa.nombre} no es un paso del backend. ${intrusa.descripcion ?? ''} Quítalo del flujo.`.trim(),
        );
      } else {
        const esperada = piezaDe(flujoCorrecto[indiceMal ?? 0]);
        const puesta = tablero[indiceMal ?? 0] && piezaDe(tablero[indiceMal ?? 0].piezaId);
        setAviso(
          `En el paso ${(indiceMal ?? 0) + 1} pusiste ${puesta?.nombre ?? 'nada'}, pero ahí va ${esperada?.nombre ?? 'otra pieza'}.`,
        );
      }
    });
  }

  // --- Drag & drop (solo mouse; el puzzle no depende de esto) -------------

  function alSoltar(evento, indice) {
    evento.preventDefault();
    const piezaId = evento.dataTransfer.getData('text/plain');
    if (piezaId) colocarEn(indice, piezaId);
  }

  const piezaSeleccionada =
    seleccion?.origen === 'tablero' && tablero[seleccion.indice]
      ? piezaDe(tablero[seleccion.indice].piezaId)
      : seleccion?.origen === 'inventario'
        ? piezaDe(seleccion.id)
        : null;

  return (
    <div className="fd">
      <div className="fd-encabezado">
        <div className="fd-rotulo label-pixel">FLOW DEBUGGER</div>
        <p className="fd-objetivo">{meta.objetivo ?? decision.pregunta}</p>
      </div>

      {/* Tablero */}
      <ol className="fd-tablero" aria-label="Flujo del pedido">
        {tablero.map((celda, indice) => {
          const pieza = celda && piezaDe(celda.piezaId);
          const orientacion = celda && orientacionDe(celda);
          const activa = seleccion?.origen === 'tablero' && seleccion.indice === indice;
          const marcaError = estado === 'fallo' && celda?.piezaId !== flujoCorrecto[indice];
          return (
            <li key={indice} className="fd-celda-item">
              <button
                type="button"
                className={`fd-celda${pieza ? ' llena' : ''}${activa ? ' activa' : ''}${
                  marcaError ? ' error' : ''
                }${estado === 'resuelto' ? ' ok' : ''}`}
                onClick={() => tocarCelda(indice)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => alSoltar(e, indice)}
                aria-label={
                  pieza
                    ? `Paso ${indice + 1}: ${pieza.nombre}${
                        orientacion ? `, ${orientacion.resumen}` : ''
                      }`
                    : `Paso ${indice + 1}, vacío`
                }
              >
                <span className="fd-celda-num">{indice + 1}</span>
                {pieza ? (
                  <span className="fd-celda-contenido">
                    <span className="fd-celda-icono">
                      <Icono nombre={pieza.icono} />
                    </span>
                    <span className="fd-celda-textos">
                      <span className="fd-celda-nombre">{pieza.nombre}</span>
                      {orientacion && (
                        <span className="fd-celda-logica">{orientacion.resumen}</span>
                      )}
                    </span>
                  </span>
                ) : (
                  <span className="fd-celda-vacia">Toca aquí</span>
                )}
              </button>
              {indice < totalCeldas - 1 && (
                <span className="fd-flecha" aria-hidden="true">
                  ↓
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Barra de acción: en móvil queda pegada arriba del inventario */}
      <div className="fd-barra">
        <div className="fd-seleccionado" aria-live="polite">
          {piezaSeleccionada ? (
            <>
              <span className="etiqueta">SELECCIONADO</span>
              <strong>{piezaSeleccionada.nombre}</strong>
            </>
          ) : (
            <span className="etiqueta">Elige un componente</span>
          )}
        </div>
        <div className="fd-botones">
          <button type="button" className="fd-boton" onClick={rotar} disabled={bloqueado}>
            ⟳ ROTAR
          </button>
          <button type="button" className="fd-boton" onClick={quitar} disabled={bloqueado}>
            ✕ QUITAR
          </button>
          <button type="button" className="fd-boton" onClick={reiniciar} disabled={bloqueado}>
            ↺ REINICIAR
          </button>
        </div>
      </div>

      {aviso && (
        <div className="feedback-box parcial" role="status">
          {aviso}
        </div>
      )}

      {/* Inventario */}
      <div className="fd-inventario">
        <div className="label-pixel">COMPONENTES</div>
        <div className="fd-piezas">
          {piezas.map((pieza) => {
            const usada = colocadas.includes(pieza.id);
            const activa = seleccion?.origen === 'inventario' && seleccion.id === pieza.id;
            return (
              <button
                key={pieza.id}
                type="button"
                className={`fd-pieza${usada ? ' usada' : ''}${activa ? ' activa' : ''}`}
                onClick={() => tocarPieza(pieza.id)}
                disabled={bloqueado || usada}
                draggable={!usada && !bloqueado}
                onDragStart={(e) => e.dataTransfer.setData('text/plain', pieza.id)}
                title={pieza.descripcion}
              >
                <span className="fd-pieza-icono">
                  <Icono nombre={pieza.icono} />
                </span>
                <span className="fd-pieza-textos">
                  <span className="fd-pieza-nombre">{pieza.nombre}</span>
                  {/* La descripción vivía en un `title`, que en un celular no
                      se ve nunca. Sin ella el puzzle era adivinanza. */}
                  {pieza.descripcion && (
                    <span className="fd-pieza-desc">{pieza.descripcion}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        className="fd-probar"
        onClick={probar}
        disabled={!completo || bloqueado}
      >
        {estado === 'probando' ? 'PROBANDO…' : '▶ PROBAR'}
      </button>

      {/* Consola */}
      {consola.length > 0 && (
        <div className="fd-consola" role="log" aria-live="polite">
          {consola.map((linea, i) => (
            <div key={i} className={`fd-linea ${TONOS[linea.tono] ?? 'info'}`}>
              {linea.texto}
            </div>
          ))}
        </div>
      )}

      {estado === 'resuelto' && (
        <div className="fd-resultado">
          <div className="fd-resultado-titulo">FLUJO ESTABLE</div>
          <p>{meta.mensajeExito ?? 'Cada compra genera un solo pedido.'}</p>
        </div>
      )}
    </div>
  );
}
