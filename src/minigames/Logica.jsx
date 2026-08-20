import { useEffect, useRef, useState } from 'react';
import { reproducirEfecto } from '../lib/musica';
import '../styles/logica.css';

// Minijuego de `tipoInteraccion: 'escribir'`: el jugador completa el hueco de
// una línea de código y la ejecuta.
//
// --- Seguridad ------------------------------------------------------------
// Acá NO se ejecuta nada de lo que escribe el jugador. Ni `eval`, ni
// `Function()`, ni interpretación dinámica de ninguna clase. "Ejecutar" es
// buscar el texto tipeado dentro de las `opciones` declaradas en el JSON y
// mostrar el feedback de la que coincida. El valor del jugador solo se pinta
// como texto de React (nunca `dangerouslySetInnerHTML`), así que tampoco puede
// inyectar markup.
//
// --- Compatibilidad -------------------------------------------------------
// Todo lo nuevo es opt-in por `metaMinijuego`. Sin esos campos, el componente
// se comporta exactamente como antes: un intento, botón "▶ RUN", sin sonido y
// sin animación. Es lo que usan "Luz para Ccorca" v1 y v2, que no los declaran.
//
// Campos opcionales de metaMinijuego:
//   plantillaCodigo       string  - la línea con '___' donde va la respuesta
//   modoEntrada           'numeric' - teclado numérico en celular
//   etiquetaEjecutar      string  - texto del botón (default '▶ RUN')
//   autoFoco              boolean - enfocar el campo al montar
//   intentosPermitidos    number  - >1 habilita reintentos (default 1)
//   penalizacionPorIntento number - puntos que cuesta cada intento fallido
//   puntajeMinimo         number  - piso al aplicar la penalización
//   animarEjecucion       boolean - barrido de ejecución + efectos de sonido
//   salidaEjecucion       string[] - líneas de consola al ejecutar bien

const MS_EJECUCION = 700;

export default function Logica({ decision, onElegir }) {
  const meta = decision.metaMinijuego ?? {};
  const plantilla = meta.plantillaCodigo ?? '';
  const intentosPermitidos = meta.intentosPermitidos ?? 1;
  const hayReintentos = intentosPermitidos > 1;
  const opcionCorrecta = decision.opciones.find((opcion) => opcion.esCorrecta === true);

  const [valor, setValor] = useState('');
  const [resuelto, setResuelto] = useState(false);
  const [opcionEncontrada, setOpcionEncontrada] = useState(null);
  const [intentos, setIntentos] = useState(0);
  const [ejecutando, setEjecutando] = useState(false);
  const [valorMostrado, setValorMostrado] = useState(null);
  const inputRef = useRef(null);
  const temporizador = useRef(null);

  useEffect(() => {
    if (meta.autoFoco && inputRef.current) inputRef.current.focus();
  }, [meta.autoFoco]);

  // Un timeout pendiente al desmontar dejaría un setState sobre un componente
  // muerto. Se limpia siempre.
  useEffect(() => () => clearTimeout(temporizador.current), []);

  // Los efectos también son opt-in. Sin `animarEjecucion`, este componente no
  // reproduce ni un sonido — y por lo tanto ni siquiera crea el AudioContext,
  // que es lo que garantiza que Ccorca siga sonando exactamente igual que antes.
  function sonar(nombre) {
    if (!meta.animarEjecucion) return;
    reproducirEfecto(nombre);
  }

  function normalizarEntrada(texto) {
    return texto
      .trim()
      .toLowerCase()
      .replace(/;+$/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function buscarOpcion(texto) {
    const limpio = normalizarEntrada(texto);
    return decision.opciones.find((opcion) => {
      const respuestasAceptadas = [opcion.texto, ...(opcion.aliases ?? [])];
      return respuestasAceptadas.some((respuesta) => normalizarEntrada(respuesta) === limpio);
    }) ?? null;
  }

  // Cierra la decisión: calcula el puntaje (aplicando la penalización por
  // reintentos si el escenario la declara) y avisa al motor.
  function finalizar(opcion, numeroIntento) {
    setOpcionEncontrada(opcion);
    setResuelto(true);
    // En la línea final mostramos el valor real del lenguaje. Por ejemplo, si
    // el jugador escribe "falso", se ejecuta y se ve `false`.
    setValorMostrado(opcion?.texto ?? valor);

    if (!hayReintentos) {
      // Camino histórico: el motor puntúa leyendo la opción elegida.
      onElegir(opcion ? [opcion.id] : []);
      return;
    }

    const base = opcion?.puntaje ?? 0;
    const pen = meta.penalizacionPorIntento ?? 0;
    const piso = meta.puntajeMinimo ?? 0;
    const fallidos = Math.max(0, numeroIntento - 1);
    const puntaje = base === 0 ? 0 : Math.max(piso, base - fallidos * pen);
    onElegir(opcion ? [opcion.id] : [], puntaje);
  }

  // Resuelve el intento ya "corrido". Se llama en el acto cuando el escenario
  // no pide animación (el caso de Ccorca) o al terminar el barrido cuando sí.
  function resolverIntento(opcion, numeroIntento) {
    const acierto = opcion?.esCorrecta === true;

    if (!hayReintentos) {
      if (opcion) sonar('codigoOk');
      finalizar(opcion, numeroIntento);
      return;
    }

    if (acierto || numeroIntento >= intentosPermitidos) {
      sonar(acierto ? 'codigoOk' : 'error');
      finalizar(opcion, numeroIntento);
      return;
    }

    // Queda intento: se muestra el porqué y se deja volver a probar.
    sonar('error');
    setOpcionEncontrada(opcion);
    setValorMostrado(opcion?.texto ?? valor);
    if (inputRef.current) inputRef.current.focus();
  }

  function ejecutar(e) {
    e.preventDefault();
    if (resuelto || ejecutando || !valor.trim()) return;

    const opcion = buscarOpcion(valor);
    const numeroIntento = intentos + 1;
    setIntentos(numeroIntento);

    // Sin `animarEjecucion` no hay sonido, ni barrido, ni demora: exactamente
    // el comportamiento que tenía este componente antes de Código Cero.
    if (!meta.animarEjecucion) {
      resolverIntento(opcion, numeroIntento);
      return;
    }

    // El barrido no es decorativo: es lo que hace que pulsar EJECUTAR se sienta
    // como correr algo y no como enviar un formulario.
    sonar('ejecutar');
    setEjecutando(true);
    temporizador.current = setTimeout(() => {
      setEjecutando(false);
      resolverIntento(opcion, numeroIntento);
    }, MS_EJECUCION);
  }

  const intentosRestantes = intentosPermitidos - intentos;
  const enReintento = hayReintentos && !resuelto && intentos > 0 && !ejecutando;
  const textoBoton = meta.etiquetaEjecutar ?? '▶ RUN';
  const mostrarValorEnCodigo = resuelto || enReintento;

  return (
    <div className="logica">
      <div className="logica-cabecera">
        <div className="label-pixel">🧩 CONSOLA DE LÓGICA</div>
        <div className="logica-pasos" aria-hidden="true">
          <span>ENTIENDE</span><b>→</b><span>COMPLETA</span><b>→</b><span>EJECUTA</span>
        </div>
      </div>
      {decision.contexto && (
        <div className="logica-contexto">
          <span>PROBLEMA</span>
          {decision.contexto}
        </div>
      )}
      <div className="logica-pregunta">{decision.pregunta}</div>

      <div className={`logica-codigo${ejecutando ? ' ejecutando' : ''}`}>
        {/* El valor del jugador se interpola como texto plano de React. */}
        <code>{plantilla.replace('___', mostrarValorEnCodigo ? (valorMostrado ?? valor) : '___')}</code>
        {ejecutando && <span className="logica-barrido" aria-hidden="true" />}
      </div>

      <form onSubmit={ejecutar} className="logica-form">
        <input
          ref={inputRef}
          type="text"
          value={valor}
          disabled={resuelto || ejecutando}
          onChange={(e) => setValor(e.target.value)}
          placeholder={meta.placeholder ?? 'Escribe aquí'}
          className="logica-input"
          inputMode={meta.modoEntrada === 'numeric' ? 'numeric' : undefined}
          autoComplete="off"
          aria-label={decision.pregunta}
        />
        <button
          type="submit"
          className="btn-primary logica-run"
          disabled={resuelto || ejecutando || !valor.trim()}
        >
          {ejecutando ? 'EJECUTANDO…' : textoBoton}
        </button>
        {hayReintentos && !resuelto && (
          <span className="logica-intentos">
            {intentosRestantes} intento{intentosRestantes === 1 ? '' : 's'}
          </span>
        )}
      </form>

      <div className="logica-salida" role="status" aria-live="polite">
        {resuelto && (
          <>
            <div className={`logica-resultado ${opcionEncontrada?.esCorrecta ? 'ok' : 'error'}`}>
              {opcionEncontrada?.esCorrecta ? '✔ CÓDIGO CORRECTO' : '✕ TE EQUIVOCASTE'}
            </div>
            <div className={`logica-feedback ${opcionEncontrada?.esCorrecta ? 'ok' : 'error'}`}>
              {opcionEncontrada ? opcionEncontrada.feedback : decision.feedbackSinCoincidencia}
              {!opcionEncontrada?.esCorrecta && opcionCorrecta && (
                <div className="logica-solucion">
                  <strong>Solución:</strong> escribe <code>{opcionCorrecta.texto}</code>. {opcionCorrecta.feedback}
                </div>
              )}
            </div>
            {opcionEncontrada?.esCorrecta &&
              (meta.salidaEjecucion ?? []).map((linea) => (
                <div className="logica-consola" key={linea}>
                  {linea}
                </div>
              ))}
          </>
        )}
        {enReintento && (
          <div className="logica-feedback reintento">
            <strong>REVISA Y PRUEBA OTRA VEZ.</strong>{' '}
            {opcionEncontrada ? opcionEncontrada.feedback : decision.feedbackSinCoincidencia}
          </div>
        )}
      </div>
    </div>
  );
}
