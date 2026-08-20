import { useEffect, useMemo, useRef, useState } from 'react';
import IconoServicio from '../ui/IconoServicio';
import { reproducirEfecto } from '../lib/musica';
import '../styles/intruso.css';

// Puzzle en dos actos: primero encontrar el nodo que no sigue el patrón de la
// red, después aislarlo cerrando dos barreras.
//
// --- Cómo se distingue el intruso -----------------------------------------
// Nunca por el color solo. Son cuatro señales simultáneas, y con que se perciba
// una alcanza para resolverlo:
//   1. Ritmo: late más rápido que los demás.
//   2. Desincronización: además arranca a destiempo.
//   3. Forma: su contorno es dentado, no continuo.
//   4. Glifo: usa el icono de nodo corrompido, no el de nodo sano.
// Y para quien navega con lector de pantalla, el aria-label de cada nodo dice
// si su señal es estable o irregular: es el equivalente auditivo de ver el
// parpadeo, no un atajo que revele la respuesta en pantalla.
//
// Con `prefers-reduced-motion` las señales 1 y 2 desaparecen (no vamos a animar
// a quien pidió que no animemos), y por eso existen la 3 y la 4: el puzzle
// sigue siendo resoluble sin una sola animación.
//
// --- Cómo se cierran las barreras -----------------------------------------
// Arrastrar es un extra, nunca el único camino. Las barreras y las ranuras son
// <button> de verdad:
//   - Mouse/touch: toco la barrera, toco la ranura.
//   - Teclado: Tab hasta la barrera, Enter, Tab hasta la ranura, Enter.
//   - Arrastre: funciona si el dispositivo lo soporta bien; si no, sobran las
//     otras dos vías.

export default function DetectarIntruso({ decision, onElegir }) {
  // `?? {}` crea un objeto nuevo en cada render; memorizarlo es lo que evita
  // que el efecto de cierre se reejecute sin motivo.
  const meta = useMemo(() => decision.metaMinijuego ?? {}, [decision.metaMinijuego]);
  const nodos = useMemo(() => meta.nodos ?? [], [meta.nodos]);
  const barreras = useMemo(() => meta.barreras ?? [], [meta.barreras]);
  const segundosObservacion = meta.segundosObservacion ?? 4;

  // `observando` es estado DERIVADO, no un useState propio: es "queda tiempo de
  // observación y el jugador no la saltó". Guardarlo aparte obligaría a
  // sincronizarlo desde el efecto, que es justo lo que hay que evitar.
  const [restante, setRestante] = useState(segundosObservacion);
  const [saltado, setSaltado] = useState(false);
  const observando = !saltado && restante > 0;
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [ultimoFallo, setUltimoFallo] = useState(null);
  const [detectado, setDetectado] = useState(false);
  const [barreraElegida, setBarreraElegida] = useState(null);
  const [colocadas, setColocadas] = useState([]); // ids de barrera ya cerradas
  const [terminado, setTerminado] = useState(false);
  const [puntos, setPuntos] = useState(0);

  const yaNotificado = useRef(false);
  const zonaDetectadaRef = useRef(null);

  const intruso = nodos.find((n) => n.intruso);

  // Cuenta atrás de observación. Se limpia sola al desmontar: no queda ningún
  // temporizador vivo si el jugador abandona la partida a mitad del puzzle.
  useEffect(() => {
    if (saltado || restante <= 0) return undefined;
    const id = setTimeout(() => setRestante((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [saltado, restante]);

  // Al pasar a la segunda parte, el foco se mueve al bloque de barreras. Sin
  // esto, quien navega con teclado se queda con el foco en un nodo que ya
  // desapareció de la pantalla.
  useEffect(() => {
    if (detectado && zonaDetectadaRef.current) {
      zonaDetectadaRef.current.focus();
    }
  }, [detectado]);

  // Cierre del puzzle: las dos barreras colocadas. Notifica una sola vez.
  useEffect(() => {
    if (!detectado || colocadas.length < barreras.length || barreras.length === 0) return;
    if (yaNotificado.current) return;
    yaNotificado.current = true;
    const max = meta.puntosMax ?? 150;
    const min = meta.puntosMin ?? 40;
    const pen = meta.penalizacionPorIntento ?? 25;
    const obtenidos = Math.max(min, max - intentosFallidos * pen);
    setPuntos(obtenidos);
    setTerminado(true);
    reproducirEfecto('puzzleCompleto');
    onElegir([meta.idRespuesta ?? 'intruso-aislado'], obtenidos);
  }, [detectado, colocadas.length, barreras.length, intentosFallidos, meta, onElegir]);

  function elegirNodo(nodo) {
    if (observando || detectado || terminado) return;
    if (nodo.intruso) {
      setDetectado(true);
      setUltimoFallo(null);
      reproducirEfecto('deteccion');
      return;
    }
    setIntentosFallidos((n) => n + 1);
    setUltimoFallo(nodo.id);
    reproducirEfecto('error');
  }

  function colocarEn(barreraId) {
    if (!barreraId || colocadas.includes(barreraId)) return;
    setColocadas((prev) => [...prev, barreraId]);
    setBarreraElegida(null);
    reproducirEfecto('barrera');
  }

  // Toca una ranura: usa la barrera seleccionada o, si no hay ninguna, la
  // primera que quede por colocar. Eso hace que el puzzle se pueda resolver a
  // puros clics en las ranuras, sin seleccionar nada primero.
  function tocarRanura(lado) {
    if (terminado) return;
    const candidata =
      barreras.find((b) => b.id === barreraElegida && b.lado === lado) ??
      barreras.find((b) => b.lado === lado && !colocadas.includes(b.id));
    if (!candidata) return;
    colocarEn(candidata.id);
  }

  const pendientes = barreras.filter((b) => !colocadas.includes(b.id));

  return (
    <div className="intruso">
      <div className="intruso-encabezado">
        <div className="label-pixel">MONITOR DE NODOS · NEXO</div>
        {!terminado && intentosFallidos > 0 && (
          <span className="intruso-intentos">Intentos usados: {intentosFallidos}</span>
        )}
      </div>

      <div className="intruso-pregunta">{decision.pregunta}</div>

      {!detectado && (
        <>
          <div className="intruso-grid">
            {nodos.map((n) => {
              const fallo = ultimoFallo === n.id;
              return (
                <button
                  type="button"
                  key={n.id}
                  className={`intruso-nodo${fallo ? ' fallo' : ''}`}
                  data-irregular={n.intruso ? 'si' : 'no'}
                  style={{ '--retardo': n.intruso ? '0.37s' : '0s' }}
                  disabled={observando}
                  onClick={() => elegirNodo(n)}
                  aria-label={`${n.label}. Señal ${
                    n.intruso ? 'irregular, fuera de ritmo' : 'estable, en ritmo'
                  }. Activar para marcarlo como sospechoso.`}
                >
                  <span className="intruso-nodo-icono">
                    <IconoServicio tipo={n.intruso ? 'infectado' : 'nodo'} tam={30} />
                  </span>
                  <span className="intruso-nodo-label">{n.label}</span>
                  <span className="intruso-pulso" aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <div className="intruso-pie" role="status" aria-live="polite">
            {observando
              ? `Observa el patrón de la red… ${restante}s`
              : ultimoFallo
                ? (meta.feedbackFallo ??
                  'Ese nodo sigue el mismo patrón que los demás. Mira cuál late fuera de tiempo.')
                : 'Uno de los seis no sigue el patrón. Márcalo.'}
          </div>

          {observando && (
            <button type="button" className="intruso-saltar" onClick={() => setSaltado(true)}>
              Ya lo vi, dejar de observar
            </button>
          )}
        </>
      )}

      {detectado && (
        <div className="intruso-aislamiento">
          <div
            className="intruso-titulo-aislar"
            ref={zonaDetectadaRef}
            tabIndex={-1}
            role="status"
            aria-live="polite"
          >
            {terminado
              ? 'AMENAZA AISLADA · el nodo quedó fuera de la red.'
              : (meta.feedbackAcierto ??
                'Ese es. Ahora ciérrale los dos lados para que no se propague.')}
          </div>

          <div className={`intruso-escena${terminado ? ' cerrada' : ''}`}>
            <button
              type="button"
              className={`intruso-ranura${colocadas.some((id) => barreras.find((b) => b.id === id)?.lado === 'izquierda') ? ' cerrada' : ''}`}
              onClick={() => tocarRanura('izquierda')}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                tocarRanura('izquierda');
              }}
              disabled={terminado}
              aria-label="Ranura izquierda del nodo aislado. Activar para cerrar la barrera de entrada."
            >
              <span className="intruso-ranura-barra" aria-hidden="true" />
              <span className="intruso-ranura-texto">Entrada</span>
            </button>

            <div className="intruso-nodo-aislado" data-cerrado={terminado ? 'si' : 'no'}>
              <IconoServicio tipo="infectado" tam={44} />
              <span className="nombre">{intruso?.label ?? 'NODO'}</span>
            </div>

            <button
              type="button"
              className={`intruso-ranura${colocadas.some((id) => barreras.find((b) => b.id === id)?.lado === 'derecha') ? ' cerrada' : ''}`}
              onClick={() => tocarRanura('derecha')}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                tocarRanura('derecha');
              }}
              disabled={terminado}
              aria-label="Ranura derecha del nodo aislado. Activar para cerrar la barrera de salida."
            >
              <span className="intruso-ranura-barra" aria-hidden="true" />
              <span className="intruso-ranura-texto">Salida</span>
            </button>
          </div>

          {!terminado && (
            <div className="intruso-barreras">
              <span className="label-pixel">BARRERAS DISPONIBLES</span>
              <div className="intruso-barreras-lista">
                {pendientes.map((b) => (
                  <button
                    type="button"
                    key={b.id}
                    className={`intruso-barrera${barreraElegida === b.id ? ' elegida' : ''}`}
                    draggable
                    onDragStart={() => setBarreraElegida(b.id)}
                    onClick={() => setBarreraElegida(barreraElegida === b.id ? null : b.id)}
                    aria-pressed={barreraElegida === b.id}
                    aria-label={`${b.label}. Va en el lado ${b.lado}. Activar para seleccionarla y después activar su ranura.`}
                  >
                    {b.label}
                    <span className="lado">{b.lado}</span>
                  </button>
                ))}
              </div>
              <p className="intruso-ayuda">
                Toca una barrera y después su ranura. También puedes tocar la ranura directamente,
                o arrastrar si lo prefieres.
              </p>
            </div>
          )}

          {terminado && (
            <div className="intruso-final">
              <span className="valor">+{puntos}</span>
              <span className="etiqueta">pts</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
