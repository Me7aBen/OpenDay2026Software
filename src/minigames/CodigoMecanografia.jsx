import { useEffect, useMemo, useRef, useState } from 'react';
import EscenaPixel from '../ui/EscenaPixel';
import { reproducirEfecto } from '../lib/musica';
import '../styles/codigo-mecanografia.css';

// Puzzle de código de "Código Cero": copiar una línea completa y ejecutarla.
//
// La diferencia con el minijuego `escribir` (Logica.jsx, el de Ccorca) es el
// tipo de esfuerzo que pide. Allá hay que DEDUCIR qué valor va en un hueco;
// acá la línea entera está a la vista y lo único que hay que hacer es
// copiarla. El estudiante no tiene que saber programar ni adivinar nada: tiene
// que sentir cómo se escribe código.
//
// Es pariente de `Mecanografia.jsx` (el de arquitectura-nodos en Ccorca v2),
// pero no lo reutiliza porque las reglas son distintas y aquel no puede
// cambiar sin tocar Ccorca: aquel se cierra solo al completar el texto y
// descarta los caracteres equivocados; este exige un EJECUTAR aparte y deja
// que el error se escriba, se vea en rojo y se corrija con Retroceso.
//
// --- Seguridad ------------------------------------------------------------
// El texto del jugador NUNCA se ejecuta. No hay `eval`, ni `Function()`, ni
// interpretación dinámica de ninguna clase. "Ejecutar" es comparar dos cadenas
// y, si son iguales, reproducir una animación declarada en el JSON. Lo que
// escribe se pinta como texto de React, nunca como HTML.
//
// --- Anti-pegado ----------------------------------------------------------
// El puntaje premia la velocidad, así que un Ctrl+V daría el máximo sin tipear.
// Se corta por tres lados: el código no se puede seleccionar, el campo rechaza
// cualquier inserción de más de un carácter (que cubre pegar, arrastrar texto y
// autocompletar de una sola vez), y `onPaste` se cancela.

const MS_EJECUCION = 900;

export default function CodigoMecanografia({ decision, onElegir }) {
  const meta = useMemo(() => decision.metaMinijuego ?? {}, [decision.metaMinijuego]);
  const codigo = meta.codigo ?? '';

  const [escrito, setEscrito] = useState('');
  const [errores, setErrores] = useState(0);
  const [avisoPegado, setAvisoPegado] = useState(false);
  const [sacudir, setSacudir] = useState(false);
  const [fase, setFase] = useState('tipeando'); // tipeando | ejecutando | listo
  const [puntos, setPuntos] = useState(0);

  const inputRef = useRef(null);
  const inicioRef = useRef(null);
  const yaNotificado = useRef(false);
  const temporizador = useRef(null);

  const completo = escrito === codigo;
  const hayError = escrito.length > 0 && !codigo.startsWith(escrito);

  // El reloj arranca en un efecto, no durante el render: llamar a
  // performance.now() mientras se renderiza rompe la regla de pureza de React.
  useEffect(() => {
    if (inicioRef.current === null) inicioRef.current = performance.now();
    inputRef.current?.focus();
  }, []);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  // El aviso de "no se puede pegar" se va solo. Sin él, el campo simplemente
  // no reacciona al Ctrl+V y parece estar roto.
  useEffect(() => {
    if (!avisoPegado) return undefined;
    const id = setTimeout(() => setAvisoPegado(false), 2200);
    return () => clearTimeout(id);
  }, [avisoPegado]);

  // La sacudida del error dura lo justo para notarse. Es la "señal visual
  // suave": no borra nada, no bloquea, no reinicia.
  useEffect(() => {
    if (!sacudir) return undefined;
    const id = setTimeout(() => setSacudir(false), 260);
    return () => clearTimeout(id);
  }, [sacudir]);

  function tipear(e) {
    if (fase !== 'tipeando') return;
    const siguiente = e.target.value;

    // Borrar siempre se permite: es la vía de corrección.
    if (siguiente.length < escrito.length) {
      setEscrito(siguiente);
      return;
    }
    // Un juego de tipeo avanza de a una tecla. Un salto de más de un carácter
    // solo puede venir de pegar, arrastrar o autocompletar.
    if (siguiente.length > escrito.length + 1) {
      setAvisoPegado(true);
      return;
    }
    if (siguiente.length > codigo.length) return;

    const nuevoChar = siguiente[siguiente.length - 1];
    const esperado = codigo[siguiente.length - 1];
    if (nuevoChar !== esperado) {
      setErrores((n) => n + 1);
      setSacudir(true);
      reproducirEfecto('error');
    }
    setEscrito(siguiente);
  }

  function bloquear(e) {
    e.preventDefault();
    setAvisoPegado(true);
  }

  function ejecutar() {
    if (fase !== 'tipeando' || !completo) return;
    setFase('ejecutando');
    reproducirEfecto('ejecutar');

    temporizador.current = setTimeout(() => {
      const segundos = inicioRef.current === null ? 0 : (performance.now() - inicioRef.current) / 1000;
      const max = meta.puntosMax ?? 150;
      const min = meta.puntosMin ?? 60;
      const penError = meta.penalizacionPorError ?? 6;
      const rapido = meta.segundosRapido ?? 25;
      const lento = meta.segundosLento ?? 90;
      // Velocidad 0..1: tipear rápido suma, pero nunca por debajo del piso.
      const velocidad = Math.max(0, Math.min(1, (lento - segundos) / (lento - rapido)));
      const bruto = min + (max - min) * velocidad - errores * penError;
      const obtenidos = Math.max(min, Math.round(Math.min(max, bruto)));

      setPuntos(obtenidos);
      setFase('listo');
      reproducirEfecto('codigoOk');

      if (!yaNotificado.current) {
        yaNotificado.current = true;
        onElegir([meta.idRespuesta ?? 'codigo-ejecutado'], obtenidos);
      }
    }, MS_EJECUCION);
  }

  // Render del código a copiar: cada carácter sabe si ya está bien tipeado,
  // si está mal, si es el que toca ahora, o si todavía no se llegó.
  function renderObjetivo() {
    return codigo.split('').map((char, i) => {
      let estado = 'pendiente';
      if (i < escrito.length) estado = escrito[i] === char ? 'ok' : 'mal';
      else if (i === escrito.length && fase === 'tipeando') estado = 'cursor';
      return (
        <span key={i} className={`cm-char cm-${estado}`}>
          {char}
        </span>
      );
    });
  }

  const progreso = codigo.length === 0 ? 0 : Math.min(1, escrito.length / codigo.length);
  const escena = fase === 'listo' ? (meta.escenaDespues ?? null) : (meta.escenaAntes ?? null);

  return (
    <div className="cm">
      <div className="cm-cuerpo">
        {/* Columna de imagen: la consecuencia del código se ve acá. */}
        <div className="cm-escena">
          {escena && <EscenaPixel escena={escena} />}
          {fase === 'listo' && (
            <div className="cm-alerta-visual">
              <span className="cm-alerta-punto" />
              ALERTA ACTIVA · HOSPITAL
            </div>
          )}
        </div>

        {/* Columna de código */}
        <div className="cm-panel">
          <div className="label-pixel">CONSOLA NEXO</div>
          <p className="cm-pregunta">{decision.pregunta}</p>

          {/* Arriba: la línea completa a copiar. No se puede seleccionar. */}
          <div
            className={`cm-objetivo${fase === 'ejecutando' ? ' ejecutando' : ''}`}
            onCopy={bloquear}
            onCut={bloquear}
            onDragStart={bloquear}
          >
            <code>{renderObjetivo()}</code>
            {fase === 'ejecutando' && <span className="cm-barrido" aria-hidden="true" />}
          </div>

          {/* Debajo: lo que el estudiante lleva escrito. El <input> real está
              encima con opacidad 0, así que tocar acá abre el teclado en
              celular y el foco funciona como en cualquier campo. */}
          <div className={`cm-entrada${sacudir ? ' sacudir' : ''}${hayError ? ' con-error' : ''}`}>
            <code className="cm-escrito">
              {escrito.split('').map((char, i) => (
                <span key={i} className={`cm-char ${escrito[i] === codigo[i] ? 'cm-ok' : 'cm-mal'}`}>
                  {char}
                </span>
              ))}
              {fase === 'tipeando' && <span className="cm-caret" aria-hidden="true" />}
              {escrito.length === 0 && <span className="cm-placeholder">Escribe aquí el código…</span>}
            </code>
            <input
              ref={inputRef}
              className="cm-input"
              type="text"
              value={escrito}
              onChange={tipear}
              onPaste={bloquear}
              onDrop={bloquear}
              disabled={fase !== 'tipeando'}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Copia aquí la línea de código que se muestra arriba"
            />
          </div>

          <div className="cm-medidores">
            <div className="cm-barra">
              <div className="cm-barra-relleno" style={{ width: `${progreso * 100}%` }} />
            </div>
            <span className="cm-cuenta">
              {escrito.length}/{codigo.length}
            </span>
            {errores > 0 && (
              <span className="cm-errores">
                {errores} error{errores === 1 ? '' : 'es'}
              </span>
            )}
          </div>

          {avisoPegado && (
            <div className="cm-aviso" role="status">
              Acá no se puede copiar y pegar: hay que tipearlo.
            </div>
          )}
          {hayError && !avisoPegado && (
            <div className="cm-aviso suave" role="status">
              Hay un carácter en rojo. Borra con Retroceso y sigue: no pierdes lo escrito.
            </div>
          )}

          <div className="cm-acciones">
            <button
              type="button"
              className="btn-primary cm-ejecutar"
              onClick={ejecutar}
              disabled={!completo || fase !== 'tipeando'}
            >
              {fase === 'ejecutando' ? 'EJECUTANDO…' : (meta.etiquetaEjecutar ?? 'EJECUTAR')}
            </button>
            {!completo && fase === 'tipeando' && (
              <span className="cm-pista">Copia la línea completa para poder ejecutar.</span>
            )}
          </div>

          <div className="cm-salida" role="status" aria-live="polite">
            {fase === 'listo' && (
              <>
                <div className="cm-ejecutado">CÓDIGO EJECUTADO</div>
                {(meta.salidaEjecucion ?? []).map((linea) => (
                  <div className="cm-consola" key={linea}>
                    {linea}
                  </div>
                ))}
                {meta.mensajeExito && (
                  <div className="cm-nia">
                    <span className="quien">NIA</span>
                    {meta.mensajeExito}
                  </div>
                )}
                <div className="cm-puntos">+{puntos} pts</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
