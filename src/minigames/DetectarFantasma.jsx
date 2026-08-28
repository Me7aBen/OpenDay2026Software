import { useEffect, useMemo, useRef, useState } from 'react';
import { reproducirEfecto } from '../lib/musica';
import { VALERIA_BUSTO } from '../features/simulations/ui/valeriaSprites';
import { actualizarBackendRush } from '../features/simulations/backendRush';
import { useBackendRush } from '../features/simulations/useBackendRush';
import '../styles/backend-rush.css';

// BACKEND RUSH · NIVEL 1 — "Encuentra al fantasma".
//
// Reemplaza a la pregunta de opción múltiple con la que abría la simulación.
// El diagnóstico era correcto: leer un diálogo y elegir una tarjeta se siente
// como un cuestionario disfrazado por muy bonito que esté. Acá el estudiante
// NO elige una respuesta: mira un sistema funcionando y toca lo que está mal,
// contra reloj y con consecuencias.
//
// Cómo funciona
// -------------
// Los pedidos entran de a uno y atraviesan cuatro etapas
// (CLIENTES → CARRITO → PAGO → PEDIDO), una etapa cada `msPorEtapa`. Cada
// pedido es una FILA de la tabla; las columnas son las etapas. Eso es
// deliberado: se lee como el diagrama de flujo que el estudiante va a tener que
// construir en el nivel siguiente, así que el nivel 1 le enseña a leer el
// tablero antes de pedirle que lo arme.
//
// Un duplicado repite el código de un pedido anterior. Hay que tocarlo ANTES de
// que llegue a PEDIDO: si entra, ya está el pedido fantasma en el sistema.
//
// Sobre el reloj (§55): cuenta hacia arriba y no mata a nadie. No hay derrota
// por tiempo; solo un bono por rapidez y un botón de PAUSA que congela todo,
// porque quien juega desde el celular puede tener que levantar la vista.

const ETAPAS = [
  { id: 'clientes', nombre: 'CLIENTES', icono: '👥' },
  { id: 'carrito', nombre: 'CARRITO', icono: '🛒' },
  { id: 'pago', nombre: 'PAGO', icono: '💳' },
  { id: 'pedido', nombre: 'PEDIDO', icono: '📦' },
];

const MS_TICK = 100;

function formatearReloj(ms) {
  const total = Math.floor(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export default function DetectarFantasma({ decision, onElegir }) {
  const meta = useMemo(() => decision.metaMinijuego ?? {}, [decision.metaMinijuego]);
  const objetivo = meta.duplicadosObjetivo ?? 3;
  // El flujo NO es un guion fijo. Con una lista cerrada, un estudiante que se
  // detiene diez segundos a entender el tablero se queda sin pedidos y pierde
  // por algo que no es su culpa. Acá la tienda sigue vendiendo: los pedidos se
  // generan hasta que caza los duplicados que le pidieron.
  const codigoFantasma = meta.codigoFantasma ?? 'KM-1006';
  const prefijo = meta.prefijo ?? 'KM-';
  const desde = meta.numeroInicial ?? 1001;
  const cadaCuantos = meta.cadaCuantosDuplicado ?? 3;
  const tope = meta.topePedidos ?? 60;
  const msPorEtapa = meta.msPorEtapa ?? 900;
  const msEntrePedidos = meta.msEntrePedidos ?? 1100;
  const filasVisibles = meta.filasVisibles ?? 7;

  // `pedidos` son las filas vivas del tablero: { clave, codigo, duplicado,
  // etapa, estado }.  estado: 'viajando' | 'cazado' | 'escapado' | 'ok'
  const [pedidos, setPedidos] = useState([]);
  const [siguiente, setSiguiente] = useState(0);
  const [cazados, setCazados] = useState(0);
  const [escapados, setEscapados] = useState(0);
  const [falsosPositivos, setFalsosPositivos] = useState(0);
  const [validos, setValidos] = useState(0);
  const [transcurrido, setTranscurrido] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [avisos, setAvisos] = useState([]); // burbujas +20 / -5
  const [pistaAbierta, setPistaAbierta] = useState(false);

  const sistema = useBackendRush();
  const avisoRef = useRef(0);
  const relojRef = useRef(0);
  const ultimoIngresoRef = useRef(0);
  const ultimoAvanceRef = useRef(0);
  const claveRef = useRef(0);
  const notificado = useRef(false);

  // El nivel se cierra solo: cuando se cazaron los duplicados pedidos, o
  // cuando se acabó el guion y ya no queda nada viajando (así nadie espera un
  // duplicado que no va a venir). Se calcula, no se guarda.
  const agotado =
    siguiente >= tope && pedidos.length > 0 && pedidos.every((p) => p.estado !== 'viajando');
  const terminado = cazados >= objetivo || agotado;

  // Un solo intervalo mueve todo: entrada de pedidos, avance de etapa y reloj.
  // Es más barato y más predecible que un timer por pedido.
  useEffect(() => {
    if (terminado || pausado) return undefined;

    const id = setInterval(() => {
      relojRef.current += MS_TICK;
      setTranscurrido(relojRef.current);

      // ¿Entra un pedido nuevo?
      if (relojRef.current - ultimoIngresoRef.current >= msEntrePedidos && siguiente < tope) {
        ultimoIngresoRef.current = relojRef.current;
        claveRef.current += 1;
        const clave = claveRef.current;
        const indice = siguiente;

        // El primero de todos es el pedido real del fantasma: aparece una vez
        // como compra legítima. Recién después empieza a repetirse. Sin ese
        // original, "duplicado" no significaría nada.
        const esOriginalFantasma = indice === 2;
        const esDuplicado = !esOriginalFantasma && indice > 2 && indice % cadaCuantos === 0;
        const codigo = esOriginalFantasma || esDuplicado
          ? codigoFantasma
          : `${prefijo}${desde + indice}`;

        setPedidos((actual) => [
          ...actual.slice(-(filasVisibles - 1)),
          { clave, codigo, duplicado: esDuplicado, etapa: 0, estado: 'viajando' },
        ]);
        setSiguiente((n) => n + 1);
      }

      // ¿Avanzan de etapa los que están viajando?
      if (relojRef.current - ultimoAvanceRef.current >= msPorEtapa) {
        ultimoAvanceRef.current = relojRef.current;
        setPedidos((actual) =>
          actual.map((pedido) => {
            if (pedido.estado !== 'viajando') return pedido;
            const etapa = pedido.etapa + 1;
            if (etapa < ETAPAS.length) return { ...pedido, etapa };
            // Llegó al final sin que nadie lo tocara.
            if (pedido.duplicado) {
              setEscapados((n) => n + 1);
              return { ...pedido, etapa: ETAPAS.length - 1, estado: 'escapado' };
            }
            setValidos((n) => n + 1);
            return { ...pedido, etapa: ETAPAS.length - 1, estado: 'ok' };
          }),
        );
      }
    }, MS_TICK);

    return () => clearInterval(id);
  }, [
    terminado,
    pausado,
    siguiente,
    tope,
    cadaCuantos,
    codigoFantasma,
    prefijo,
    desde,
    msEntrePedidos,
    msPorEtapa,
    filasVisibles,
  ]);

  // Puntaje. Se calcula una sola vez, al cerrar el nivel.
  useEffect(() => {
    if (!terminado || notificado.current) return;
    notificado.current = true;

    const maximo = meta.puntosMax ?? 100;
    const minimo = meta.puntosMin ?? 0;
    const porDuplicado = meta.puntosPorDuplicado ?? 20;
    const castigoFalso = meta.penalizacionFalsoPositivo ?? 5;
    const castigoEscapado = meta.penalizacionEscapado ?? 10;
    const bonoRapido = meta.bonoRapidez ?? 20;
    const segundosRapido = meta.segundosRapido ?? 35;

    const base = cazados * porDuplicado;
    const rapido = cazados >= objetivo && relojRef.current / 1000 <= segundosRapido ? bonoRapido : 0;
    const bruto = base + rapido - falsosPositivos * castigoFalso - escapados * castigoEscapado;
    const puntos = Math.max(minimo, Math.min(maximo, bruto));

    actualizarBackendRush({
      nivelActual: 1,
      pedidosProcesados: (n) => n + validos + cazados,
      duplicadosDetectados: (n) => n + cazados,
      duplicadosBloqueados: (n) => n + cazados,
      errores: (n) => n + escapados,
      estabilidad: (n) =>
        n + cazados * (meta.estabilidadPorDuplicado ?? 4)
          - escapados * (meta.estabilidadPorEscapado ?? 6)
          - falsosPositivos * (meta.estabilidadPorFalsoPositivo ?? 2),
    });

    reproducirEfecto(cazados >= objetivo ? 'codigoOk' : 'error');
    onElegir([meta.idRespuesta ?? 'fantasma-detectado'], puntos);
  }, [terminado, cazados, escapados, falsosPositivos, validos, objetivo, meta, onElegir]);

  function mostrarAviso(clave, texto, tono) {
    avisoRef.current += 1;
    const id = `${clave}-${avisoRef.current}`;
    setAvisos((actual) => [...actual, { id, clave, texto, tono }]);
    setTimeout(() => setAvisos((actual) => actual.filter((a) => a.id !== id)), 900);
  }

  function marcar(pedido) {
    if (terminado || pausado || pedido.estado !== 'viajando') return;

    if (pedido.duplicado) {
      setCazados((n) => n + 1);
      setPedidos((actual) =>
        actual.map((p) => (p.clave === pedido.clave ? { ...p, estado: 'cazado' } : p)),
      );
      mostrarAviso(pedido.clave, `+${meta.puntosPorDuplicado ?? 20} DUPLICADO DETECTADO`, 'ok');
      reproducirEfecto('codigoOk');
      return;
    }

    setFalsosPositivos((n) => n + 1);
    setPedidos((actual) =>
      actual.map((p) => (p.clave === pedido.clave ? { ...p, sacudir: true } : p)),
    );
    mostrarAviso(pedido.clave, `−${meta.penalizacionFalsoPositivo ?? 5} PEDIDO VÁLIDO`, 'error');
    reproducirEfecto('error');
    setTimeout(
      () =>
        setPedidos((actual) =>
          actual.map((p) => (p.clave === pedido.clave ? { ...p, sacudir: false } : p)),
        ),
      320,
    );
  }

  // Estabilidad EN VIVO: la compartida más lo que va pasando en este nivel.
  // Se confirma en el estado global al terminar.
  const estabilidad = Math.max(
    0,
    Math.min(
      100,
      sistema.estabilidad +
        cazados * (meta.estabilidadPorDuplicado ?? 4) -
        escapados * (meta.estabilidadPorEscapado ?? 6) -
        falsosPositivos * (meta.estabilidadPorFalsoPositivo ?? 2),
    ),
  );
  const alerta = escapados > 0 || estabilidad < 80;
  const pedidosTotales = sistema.pedidosProcesados + validos + cazados;
  const progreso = Math.min(100, (cazados / Math.max(1, objetivo)) * 100);
  const textoValeria = terminado
    ? cazados >= objetivo
      ? (meta.mensajeExito ?? 'Ahí están. El mismo código entrando una y otra vez.')
      : (meta.mensajeParcial ?? 'Se nos escaparon algunos. Igual ya viste el patrón.')
    : (meta.instruccion ??
      'Observa el flujo. Algunos pedidos están entrando más de una vez. Toca los duplicados para detectarlos.');

  return (
    <div className="br">
      {/* --- Cabecera con marcadores --- */}
      <div className="br-cabecera">
        <div className="br-titulo-zona">
          <div className="br-nivel">{meta.rotuloNivel ?? 'NIVEL 1 · ENCUENTRA AL FANTASMA'}</div>
          <h3 className="br-titulo">{decision.pregunta}</h3>
        </div>
        <div className="br-marcadores">
          <div className="br-marcador">
            <span className="etiqueta">TIEMPO</span>
            <span className="valor">{formatearReloj(transcurrido)}</span>
          </div>
          <div className="br-marcador">
            <span className="etiqueta">DETECTADOS</span>
            <span className="valor" style={{ color: 'var(--green)' }}>
              {cazados} / {objetivo}
            </span>
          </div>
          <div className="br-marcador">
            <span className="etiqueta">ESCAPADOS</span>
            <span className="valor" style={{ color: escapados ? 'var(--red)' : 'var(--text)' }}>
              {escapados}
            </span>
          </div>
        </div>
      </div>

      <div className="br-cuerpo">
        {/* --- Tablero --- */}
        <div className="br-tablero-zona">
          <div className="br-tablero">
            <div className="br-encabezados">
              {ETAPAS.map((etapa, i) => (
                <div className="br-encabezado" key={etapa.id}>
                  <span aria-hidden="true">{etapa.icono}</span>
                  <span className="nombre">{etapa.nombre}</span>
                  {i < ETAPAS.length - 1 && (
                    <span className="br-encabezado-flecha" aria-hidden="true">
                      ➜
                    </span>
                  )}
                </div>
              ))}
            </div>

            <ul className="br-filas">
              {pedidos.map((pedido) => {
                const aviso = avisos.find((a) => a.clave === pedido.clave);
                return (
                  <li
                    key={pedido.clave}
                    className={`br-fila ${pedido.estado}${pedido.sacudir ? ' sacudir' : ''}`}
                  >
                    {ETAPAS.map((etapa, i) => {
                      const alcanzada = i <= pedido.etapa;
                      const esUltima = i === ETAPAS.length - 1;
                      const clasePedido = [
                        'br-pedido',
                        alcanzada ? 'activo' : 'pendiente',
                        pedido.duplicado && alcanzada ? 'duplicado' : '',
                        pedido.estado === 'cazado' ? 'cazado' : '',
                        pedido.estado === 'escapado' ? 'escapado' : '',
                      ]
                        .filter(Boolean)
                        .join(' ');

                      // Solo la celda de la etapa actual es tocable: se marca el
                      // pedido donde está, no en cualquier columna.
                      const tocable =
                        alcanzada && i === pedido.etapa && pedido.estado === 'viajando';

                      return (
                        <div
                          className={`br-celda${i === pedido.etapa ? ' actual' : ''}`}
                          key={etapa.id}
                        >
                          {tocable ? (
                            <button
                              type="button"
                              className={clasePedido}
                              onClick={() => marcar(pedido)}
                              aria-label={`Marcar pedido ${pedido.codigo} como duplicado`}
                            >
                              <span className="br-pedido-icono" aria-hidden="true">
                                {pedido.duplicado ? '📕' : '📗'}
                              </span>
                              <span className="br-pedido-codigo">{pedido.codigo}</span>
                              <span className="br-mira" aria-hidden="true" />
                            </button>
                          ) : (
                            <div className={clasePedido} aria-hidden={!alcanzada}>
                              <span className="br-pedido-icono" aria-hidden="true">
                                {pedido.duplicado && alcanzada ? '📕' : '📗'}
                              </span>
                              <span className="br-pedido-codigo">
                                {alcanzada ? pedido.codigo : ''}
                              </span>
                              {esUltima && pedido.estado === 'ok' && (
                                <span className="br-check" aria-hidden="true">
                                  ✓
                                </span>
                              )}
                              {esUltima && pedido.estado === 'escapado' && (
                                <span className="br-cruz" aria-hidden="true">
                                  ✕
                                </span>
                              )}
                            </div>
                          )}
                          {i < ETAPAS.length - 1 && (
                            <span
                              className={`br-conector${alcanzada && i < pedido.etapa ? ' on' : ''}${
                                pedido.duplicado && alcanzada ? ' rojo' : ''
                              }`}
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      );
                    })}
                    {/* Resumen del recorrido para móvil: en 375px no entran
                        cuatro chips legibles, así que se muestra solo la etapa
                        actual y el avance se cuenta con puntos. */}
                    <span className="br-etapas-mini" aria-hidden="true">
                      {ETAPAS.map((etapa, i) => (
                        <span
                          key={etapa.id}
                          className={`br-punto${i <= pedido.etapa ? ' on' : ''}${
                            pedido.duplicado ? ' rojo' : ''
                          }`}
                        />
                      ))}
                      <span className="br-etapa-nombre">{ETAPAS[pedido.etapa].nombre}</span>
                    </span>
                    {aviso && <span className={`br-aviso ${aviso.tono}`}>{aviso.texto}</span>}
                  </li>
                );
              })}
              {pedidos.length === 0 && (
                <li className="br-fila-vacia">Esperando los primeros pedidos…</li>
              )}
            </ul>
          </div>

          {/* --- Valeria --- */}
          <div className="br-valeria">
            <img className="valeria-busto" src={VALERIA_BUSTO} alt="Valeria, Tech Lead" />
            <div className="br-globo" key={textoValeria}>
              <div className="br-globo-quien">VALERIA</div>
              <p>{textoValeria}</p>
            </div>
          </div>
        </div>

        {/* --- Panel lateral --- */}
        <aside className="br-panel">
          <section className="br-panel-bloque">
            <div className="br-panel-titulo">🎯 OBJETIVO</div>
            <p>{meta.objetivo ?? `Identifica ${objetivo} pedidos duplicados antes de que entren al sistema.`}</p>
            <div className="br-progreso-rotulo">Duplicados encontrados:</div>
            <div className="br-progreso-cifra">
              {cazados} / {objetivo}
            </div>
            <div className="br-progreso">
              <span style={{ width: `${progreso}%` }} />
            </div>
          </section>

          <section className="br-panel-bloque">
            <div className="br-panel-titulo">📊 ESTADO DEL SISTEMA</div>
            <div className="br-dato">
              <span>Pedidos válidos</span>
              <strong style={{ color: 'var(--green)' }}>{pedidosTotales}</strong>
            </div>
            <div className="br-dato">
              <span>Duplicados detectados</span>
              <strong style={{ color: 'var(--cyan)' }}>{cazados}</strong>
            </div>
            <div className="br-dato">
              <span>Fantasmas que pasaron</span>
              <strong style={{ color: escapados ? 'var(--red)' : 'var(--text-dim)' }}>
                {escapados}
              </strong>
            </div>
            <div className="br-estabilidad-rotulo">ESTABILIDAD DEL SISTEMA · {estabilidad}%</div>
            <div className="br-estabilidad">
              <span
                style={{
                  width: `${estabilidad}%`,
                  background: alerta ? 'var(--red)' : 'var(--green)',
                }}
              />
            </div>
            <div className={`br-estado${alerta ? ' alerta' : ''}`}>
              {alerta ? '⚠ ALERTA' : '✓ ESTABLE'}
            </div>
          </section>

          <section className="br-panel-bloque br-leyenda">
            <div className="br-panel-titulo">LEYENDA</div>
            <div>
              <span aria-hidden="true">📗</span> Pedido válido
            </div>
            <div>
              <span aria-hidden="true">📕</span> Pedido duplicado
            </div>
            <div>
              <span aria-hidden="true">⊙</span> Toca para marcar
            </div>
          </section>
        </aside>
      </div>

      {/* --- Controles --- */}
      <div className="br-controles">
        <button
          type="button"
          className="br-boton"
          onClick={() => setPausado((v) => !v)}
          disabled={terminado}
        >
          {pausado ? '▶ CONTINUAR' : '⏸ PAUSAR'}
        </button>
        <button
          type="button"
          className="br-boton"
          onClick={() => setPistaAbierta(true)}
          disabled={pistaAbierta}
        >
          💡 PISTA
        </button>
      </div>

      {pistaAbierta && !terminado && (
        <div className="feedback-box info" role="status">
          {meta.pistaInterna ??
            'Fíjate en el código: un pedido duplicado repite exactamente el mismo número que otro que ya pasó.'}
        </div>
      )}

      {pausado && !terminado && (
        <div className="feedback-box parcial" role="status">
          Juego en pausa. El tiempo no corre.
        </div>
      )}

      {terminado && (
        <div className={`br-cierre ${cazados >= objetivo ? 'ok' : 'parcial'}`}>
          <div className="br-cierre-titulo">
            {cazados >= objetivo ? 'FANTASMA IDENTIFICADO' : 'NIVEL TERMINADO'}
          </div>
          <p>{meta.feedbackCierre ?? 'El mismo pedido está entrando varias veces al sistema. Ahora hay que averiguar por qué.'}</p>
          <div className="br-cierre-datos">
            <span>
              Detectados <strong>{cazados}</strong>
            </span>
            <span>
              Escapados <strong>{escapados}</strong>
            </span>
            <span>
              Falsas alarmas <strong>{falsosPositivos}</strong>
            </span>
            <span>
              Tiempo <strong>{formatearReloj(transcurrido)}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
