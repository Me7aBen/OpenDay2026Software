import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { reproducirEfecto } from '../lib/musica';
import { VALERIA_BUSTO } from '../features/simulations/ui/valeriaSprites';
import '../styles/backend-rush.css';
import '../styles/ultima-unidad.css';

// BACKEND RUSH · NIVEL 5 — "Última unidad".
//
// Queda UNA unidad de café. Andrea y Luis la compran casi al mismo tiempo. Los
// dos procesos leen el inventario ANTES de que ninguno lo actualice, los dos
// ven "queda 1", y los dos descuentan. Stock: −1. Una venta que no existe.
//
// Esto es una condición de carrera, pero el nivel nunca dice esas palabras
// hasta el final. Primero se VE fallar, después se arregla, y recién entonces
// se le pone nombre a lo que acaba de resolver. Ese orden es el punto: la
// palabra técnica llega cuando ya significa algo.
//
// La mecánica es elegir la herramienta correcta y colocarla en el punto del
// flujo donde hace falta. Tres de las cuatro herramientas son razonables a
// primera vista y aun así no resuelven nada — que es exactamente lo que las
// hace enseñar:
//
//   VERIFICAR   vuelve a leer el stock. Leer de nuevo no impide que el otro
//               lea al mismo tiempo.
//   REINTENTAR  repite la operación. Repetir una carrera es correr otra vez.
//   RESERVAR    aparta la unidad, pero si dos pueden apartarla a la vez el
//               problema es el mismo un paso más arriba. (Crédito parcial: la
//               intuición es correcta, le falta la exclusión.)
//   BLOQUEAR    solo un proceso entra a la vez. Es la respuesta.

const PASOS_FALLO = [
  { id: 'solicitudes', ms: 900 },
  { id: 'leen', ms: 1100 },
  { id: 'resultados', ms: 1100 },
  { id: 'escriben', ms: 1100 },
  { id: 'roto', ms: 0 },
];

const PASOS_EXITO = [
  { id: 'solicitudes', ms: 900 },
  { id: 'andrea-entra', ms: 1100 },
  { id: 'andrea-escribe', ms: 1100 },
  { id: 'luis-entra', ms: 1100 },
  { id: 'salvado', ms: 0 },
];

export default function UltimaUnidad({ decision, onElegir }) {
  const meta = useMemo(() => decision.metaMinijuego ?? {}, [decision.metaMinijuego]);
  const herramientas = useMemo(() => meta.herramientas ?? [], [meta]);
  const correcta = meta.herramientaCorrecta ?? 'bloquear';

  const [fase, setFase] = useState('fallo'); // fallo | eligiendo | probando | resuelto
  const [paso, setPaso] = useState(0);
  const [seleccion, setSeleccion] = useState(null);
  const [colocada, setColocada] = useState(null);
  const [intentos, setIntentos] = useState(0);
  const [fallidas, setFallidas] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const notificado = useRef(false);
  const timers = useRef([]);

  useEffect(() => {
    const pendientes = timers.current;
    return () => pendientes.forEach(clearTimeout);
  }, []);

  // Qué secuencia se está mostrando. Incluye 'resuelto', no solo 'probando':
  // si no, al terminar bien el guion volvía al del fallo y la pantalla
  // contradecía al cierre (stock en −1, Luis con "disponible: SÍ").
  const usandoExito = (fase === 'probando' || fase === 'resuelto') && colocada === correcta;
  const guion = usandoExito ? PASOS_EXITO : PASOS_FALLO;

  // Reproduce la secuencia paso a paso. Se usa igual para la demostración del
  // fallo y para la ejecución con la herramienta puesta.
  const reproducir = useCallback(
    (alTerminar) => {
      // Se agenda en vez de ejecutarse en el acto: si esto corre dentro del
      // cuerpo de un efecto, React encadena un render extra.
      timers.current.push(setTimeout(() => setPaso(0), 0));
      let acumulado = 0;
      guion.forEach((definicion, i) => {
        if (i === 0) return;
        acumulado += guion[i - 1].ms;
        const id = setTimeout(() => setPaso(i), acumulado);
        timers.current.push(id);
      });
      const fin = setTimeout(() => alTerminar?.(), acumulado + 300);
      timers.current.push(fin);
    },
    [guion],
  );

  // Primera pasada: se muestra el desastre sin que el jugador toque nada.
  useEffect(() => {
    if (fase !== 'fallo') return;
    reproducir(() => setFase('eligiendo'));
    // Solo al montar: la demo del fallo se ve una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function colocar(herramientaId) {
    if (fase === 'probando' || fase === 'resuelto') return;
    const numeroIntento = intentos + 1;
    setIntentos(numeroIntento);
    setColocada(herramientaId);
    setSeleccion(null);
    setMensaje(null);
    setFase('probando');

    const herramienta = herramientas.find((h) => h.id === herramientaId);

    if (herramientaId === correcta) {
      reproducir(() => {
        setFase('resuelto');
        reproducirEfecto('codigoOk');
        if (notificado.current) return;
        notificado.current = true;
        const maximo = meta.puntosMax ?? 100;
        const minimo = meta.puntosMin ?? 30;
        const castigo = meta.penalizacionPorIntento ?? 25;
        const puntos = Math.max(minimo, maximo - (numeroIntento - 1) * castigo);
        onElegir([meta.idRespuesta ?? 'sobreventa-evitada'], puntos);
      });
      return;
    }

    reproducir(() => {
      setFase('eligiendo');
      setColocada(null);
      setFallidas((actual) => [...new Set([...actual, herramientaId])]);
      setMensaje(herramienta?.porQueNo ?? 'Eso no impide que los dos lean el stock a la vez.');
      reproducirEfecto('error');
    });
  }

  // El cartel del desastre queda a la vista mientras el jugador elige la
  // herramienta: es la evidencia que tiene que explicar, no un flash.
  const mostrandoFallo = !usandoExito;
  const exito = usandoExito;
  const visto = (id) => guion.findIndex((p) => p.id === id) <= paso && guion.some((p) => p.id === id);

  return (
    <div className="br uu">
      <div className="br-cabecera">
        <div className="br-titulo-zona">
          <span className="uu-insignia">⚡ BACKEND RUSH ⚡</span>
          <div className="br-nivel">{meta.rotuloNivel ?? 'NIVEL 5 · ÚLTIMA UNIDAD'}</div>
          <h3 className="br-titulo">{decision.pregunta}</h3>
        </div>
        <div className="br-marcadores">
          <div className="br-marcador">
            <span className="etiqueta">ESTADO</span>
            <span
              className="valor"
              style={{ color: exito ? 'var(--green)' : 'var(--red)', fontSize: 13 }}
            >
              {exito ? 'RESUELTO' : 'FALLANDO'}
            </span>
          </div>
          <div className="br-marcador">
            <span className="etiqueta">INTENTOS</span>
            <span className="valor">{intentos}</span>
          </div>
          <div className="br-marcador">
            <span className="etiqueta">SOBREVENTAS</span>
            <span className="valor" style={{ color: exito ? 'var(--green)' : 'var(--red)' }}>
              {exito ? 0 : 1}
            </span>
          </div>
        </div>
      </div>

      <div className="br-cuerpo">
        <div className="br-tablero-zona">
          {/* --- Producto --- */}
          <div className={`uu-producto${exito ? ' ok' : ''}`}>
            <div className="uu-producto-nombre">☕ {meta.producto ?? 'Café Premium'}</div>
            <div className="uu-stock">
              STOCK:{' '}
              <strong className={visto('roto') || visto('salvado') ? (exito ? 'ok' : 'mal') : ''}>
                {visto('roto') ? -1 : visto('salvado') || visto('andrea-escribe') ? 0 : 1}
              </strong>
            </div>
          </div>

          {/* --- Los dos procesos --- */}
          <div className="uu-carriles">
            {[
              {
                id: 'andrea',
                nombre: 'ANDREA',
                solicitud: meta.solicitudAndrea ?? '#A-5512',
                lee: visto('leen') || visto('andrea-entra'),
                resultado: visto('resultados') || visto('andrea-entra') ? 'SÍ' : null,
                escribe: visto('escriben')
                  ? '1 → 0'
                  : visto('andrea-escribe')
                    ? '1 → 0'
                    : null,
                estado: 'ok',
              },
              {
                id: 'luis',
                nombre: 'LUIS',
                solicitud: meta.solicitudLuis ?? '#L-9931',
                lee: visto('leen') || visto('luis-entra'),
                resultado: visto('resultados') ? 'SÍ' : visto('luis-entra') ? 'NO' : null,
                escribe: visto('escriben') ? '0 → −1' : null,
                estado: exito ? 'bloqueado' : 'mal',
              },
            ].map((carril) => (
              <div className={`uu-carril ${carril.id}`} key={carril.id}>
                <div className="uu-persona">
                  <span className="uu-avatar" aria-hidden="true">
                    {carril.id === 'andrea' ? '👩' : '👨'}
                  </span>
                  <span className="uu-nombre">{carril.nombre}</span>
                </div>

                <div className={`uu-caja${visto('solicitudes') ? ' on' : ''}`}>
                  <span className="uu-caja-rotulo">SOLICITUD {carril.solicitud}</span>
                  Comprar 1 unidad
                </div>

                <div className={`uu-caja${carril.lee ? ' on' : ''}`}>
                  <span className="uu-caja-rotulo">VERIFICAR STOCK</span>
                  Lee el inventario
                </div>

                <div
                  className={`uu-caja resultado${carril.resultado ? ' on' : ''}${
                    carril.resultado === 'NO' ? ' negativo' : ''
                  }`}
                >
                  <span className="uu-caja-rotulo">RESULTADO</span>
                  {carril.resultado
                    ? carril.resultado === 'SÍ'
                      ? 'Stock disponible: SÍ'
                      : 'Sin stock disponible'
                    : '…'}
                </div>

                {/* En el flujo correcto Luis no llega a escribir: queda esperando. */}
                {exito && carril.id === 'luis' ? (
                  <div className={`uu-caja espera${visto('luis-entra') ? ' on' : ''}`}>
                    <span className="uu-caja-rotulo">MODIFICAR STOCK</span>
                    {/* El punto del nivel: Luis nunca llega a escribir. Decir
                        "no se ejecuta" enseña más que repetir "sin stock". */}
                    no se ejecuta · el inventario queda en 0
                  </div>
                ) : (
                  <div
                    className={`uu-caja escribir${carril.escribe ? ' on' : ''}${
                      carril.escribe === '0 → −1' ? ' malo' : ''
                    }`}
                  >
                    <span className="uu-caja-rotulo">MODIFICAR STOCK</span>
                    {carril.escribe ?? '…'}
                  </div>
                )}
              </div>
            ))}

            {/* --- Ranura del bloqueo --- */}
            <div
              className={`uu-ranura${colocada ? ' llena' : ''}${
                colocada === correcta ? ' correcta' : ''
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain');
                if (id) colocar(id);
              }}
            >
              {colocada ? (
                <>
                  <span className="uu-ranura-icono" aria-hidden="true">
                    {herramientas.find((h) => h.id === colocada)?.icono ?? '🔒'}
                  </span>
                  <span className="uu-ranura-texto">
                    {herramientas.find((h) => h.id === colocada)?.nombre}
                  </span>
                </>
              ) : (
                <>
                  <span className="uu-ranura-icono" aria-hidden="true">
                    🔒
                  </span>
                  <span className="uu-ranura-texto">
                    {seleccion ? 'TOCA AQUÍ PARA COLOCARLA' : 'COLOCA LA HERRAMIENTA AQUÍ'}
                  </span>
                  {seleccion && (
                    <button
                      type="button"
                      className="uu-ranura-boton"
                      onClick={() => colocar(seleccion)}
                    >
                      COLOCAR {herramientas.find((h) => h.id === seleccion)?.nombre}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* --- Resultado del inventario --- */}
          <div className={`uu-resultado${exito ? ' ok' : ''}`}>
            {mostrandoFallo && visto('roto') && (
              <>
                <div className="uu-resultado-cifra mal">STOCK: -1</div>
                <div className="uu-resultado-rotulo mal">STOCK IMPOSIBLE ⚠</div>
              </>
            )}
            {exito && visto('salvado') && (
              <>
                <div className="uu-resultado-cifra ok">STOCK: 0</div>
                <div className="uu-resultado-rotulo ok">SOBREVENTA EVITADA ✓</div>
              </>
            )}
            {!visto('roto') && !visto('salvado') && (
              <div className="uu-resultado-rotulo">Ejecutando…</div>
            )}
          </div>

          {/* --- Valeria --- */}
          <div className="br-valeria">
            <img className="valeria-busto" src={VALERIA_BUSTO} alt="Valeria, Tech Lead" />
            <div className="br-globo" key={fase + intentos}>
              <div className="br-globo-quien">VALERIA</div>
              <p>
                {fase === 'fallo'
                  ? (meta.dialogoFallo ??
                    'Andrea y Luis consultaron el stock casi al mismo tiempo. Los dos vieron que quedaba una unidad. Los dos la descontaron.')
                  : fase === 'resuelto'
                    ? (meta.dialogoExito ??
                      'Ahora solo uno entra a la vez. Andrea se lleva el café y Luis recibe un "sin stock" honesto.')
                    : (meta.dialogoElegir ??
                      'Necesitamos que solo un proceso pueda tocar el inventario a la vez. ¿Qué herramienta hace eso?')}
              </p>
            </div>
          </div>
        </div>

        {/* --- Panel lateral --- */}
        <aside className="br-panel">
          <section className="br-panel-bloque">
            <div className="br-panel-titulo">🎯 OBJETIVO</div>
            <p>
              {meta.objetivo ??
                'Evita la sobreventa: haz que solo un proceso pueda modificar el inventario a la vez.'}
            </p>
          </section>

          <section className="br-panel-bloque">
            <div className="br-panel-titulo">📊 ESTADO ACTUAL</div>
            <div className="br-dato">
              <span>Estado del nivel</span>
              <strong style={{ color: exito ? 'var(--green)' : 'var(--red)', fontSize: 12 }}>
                {exito ? 'RESUELTO' : 'FALLANDO'}
              </strong>
            </div>
            <div className="br-dato">
              <span>Intentos</span>
              <strong>{intentos}</strong>
            </div>
            <div className="br-dato">
              <span>Herramienta usada</span>
              <strong style={{ fontSize: 12 }}>
                {colocada ? herramientas.find((h) => h.id === colocada)?.nombre : '—'}
              </strong>
            </div>
          </section>

          {fase !== 'fallo' && (
            <section className="br-panel-bloque">
              <div className="br-panel-titulo">💡 PISTA</div>
              <p style={{ fontSize: 12 }}>
                {meta.pistaInterna ??
                  'El problema ocurre cuando los dos leen el stock antes de que cualquiera lo actualice.'}
              </p>
            </section>
          )}
        </aside>
      </div>

      {/* --- Herramientas --- */}
      {fase !== 'fallo' && (
        <div className="uu-herramientas">
          <div className="br-panel-titulo">🧰 HERRAMIENTAS</div>
          <div className="uu-herramientas-lista">
            {herramientas.map((herramienta) => {
              const yaFallo = fallidas.includes(herramienta.id);
              return (
                <button
                  key={herramienta.id}
                  type="button"
                  className={`uu-herramienta${seleccion === herramienta.id ? ' activa' : ''}${
                    yaFallo ? ' descartada' : ''
                  }`}
                  disabled={fase === 'probando' || fase === 'resuelto'}
                  draggable={fase === 'eligiendo'}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', herramienta.id)}
                  onClick={() =>
                    setSeleccion((actual) => (actual === herramienta.id ? null : herramienta.id))
                  }
                >
                  <span className="uu-herramienta-icono" aria-hidden="true">
                    {herramienta.icono}
                  </span>
                  <span className="uu-herramienta-textos">
                    <span className="uu-herramienta-nombre">{herramienta.nombre}</span>
                    <span className="uu-herramienta-desc">{herramienta.descripcion}</span>
                  </span>
                  {yaFallo && <span className="uu-descartada-marca">no sirvió</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {mensaje && (
        <div className="feedback-box error" role="status">
          {mensaje}
        </div>
      )}

      {/* --- Cierre: recién acá aparece la palabra técnica --- */}
      {fase === 'resuelto' && (
        <div className="uu-cierre">
          <div className="uu-cierre-titulo">SOBREVENTA EVITADA</div>
          <div className="uu-flujo-correcto">
            <span>👩 ANDREA</span>
            <span className="flecha">→</span>
            <span className="bloqueo">🔒 BLOQUEO</span>
            <span className="flecha">→</span>
            <span className="ok">1 → 0 · OK</span>
            <span className="flecha">→</span>
            <span className="espera">👨 LUIS · SIN STOCK</span>
          </div>
          <p className="uu-cierre-concepto">
            <strong>{meta.conceptoTitulo ?? 'Lo que acabas de resolver se llama condición de carrera.'}</strong>{' '}
            {meta.conceptoTexto ??
              'Pasa cuando dos procesos leen el mismo dato antes de que alguno lo actualice. La solución —dejar entrar a uno a la vez— se llama exclusión mutua, y es de las primeras cosas que aprende quien trabaja en backend.'}
          </p>
        </div>
      )}
    </div>
  );
}
