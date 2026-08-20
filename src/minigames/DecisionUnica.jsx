import { useState } from 'react';
import EscenaPixel from '../ui/EscenaPixel';
import '../styles/decision-unica.css';

function mejorOpcionDe(decision) {
  const marcada = decision.opciones.find((opcion) => opcion.esCorrecta === true);
  if (marcada) return marcada;

  const maximo = Math.max(...decision.opciones.map((opcion) => opcion.puntaje ?? 0));
  return decision.opciones.find((opcion) => (opcion.puntaje ?? 0) === maximo);
}

// Hay tres resultados visuales. Una respuesta con puntaje parcial no se pinta
// como correcta: se reconoce el avance, pero se explica que había una opción
// mejor. Esto evita que todas las alternativas parezcan igual de válidas.
function resultadoDe(decision, opcion) {
  if (!opcion) return null;
  if (opcion.esCorrecta === true || opcion.id === mejorOpcionDe(decision)?.id) return 'acierto';
  if (opcion.esTrampa || opcion.esCorrecta === false || (opcion.puntaje ?? 0) === 0) return 'error';
  return 'parcial';
}

const PRESENTACION_RESULTADO = {
  acierto: { titulo: 'ACIERTO', icono: '✔', clase: 'ok' },
  parcial: { titulo: 'CASI', icono: '!', clase: 'parcial' },
  error: { titulo: 'TE EQUIVOCASTE', icono: '✕', clase: 'error' },
};

// Render compartido para tipoInteraccion: 'seleccion-unica'.
//
// Tiene DOS modos, y cuál se usa lo decide el contenido, no el escenario:
//
//   - Modo texto (el de siempre): pregunta + botones de texto + feedback.
//     Es lo que usan "Luz para Ccorca" v1 y v2, y no cambió en nada.
//
//   - Modo ilustrado: se activa cuando la decisión trae `ilustracion`. La
//     escena ocupa el lugar principal, las opciones pueden ser tarjetas con su
//     propio dibujo (`opcion.escena`), y elegir cambia la ilustración a
//     `opcion.escenaConsecuencia`. Así la decisión se ve además de leerse.
//
// Props:
//   decision, onElegir  - contrato de siempre
//   encabezado          - nodo opcional arriba de la pregunta
//   avatar              - avatar del jugador, para las escenas donde aparece

export default function DecisionUnica({ decision, onElegir, encabezado, avatar }) {
  const [elegidaId, setElegidaId] = useState(null);
  const opcionElegida = decision.opciones.find((o) => o.id === elegidaId);
  const mejorOpcion = mejorOpcionDe(decision);
  const resultado = resultadoDe(decision, opcionElegida);
  const presentacionResultado = resultado ? PRESENTACION_RESULTADO[resultado] : null;

  function elegir(opcionId) {
    if (elegidaId) return;
    setElegidaId(opcionId);
    onElegir([opcionId]);
  }

  const feedback = opcionElegida && presentacionResultado && (
    <div className="decision-feedback">
      {opcionElegida.descubrimiento && (
        <div className="feedback-box info">💬 {opcionElegida.descubrimiento}</div>
      )}
      <div className={`feedback-box ${presentacionResultado.clase}`} role="status">
        <div className="decision-feedback-titulo">
          <span aria-hidden="true">{presentacionResultado.icono}</span>
          {presentacionResultado.titulo}
        </div>
        <div>{opcionElegida.feedback ?? 'Revisa qué consecuencia produjo tu decisión.'}</div>
        {resultado !== 'acierto' && mejorOpcion && (
          <div className="decision-solucion">
            <strong>Solución:</strong> {mejorOpcion.texto}. {mejorOpcion.feedback ?? ''}
          </div>
        )}
      </div>
    </div>
  );

  const contexto = decision.contexto && (
    <div className="decision-contexto">
      <span>PROBLEMA</span>
      {decision.contexto}
    </div>
  );

  // --- Modo texto (histórico) ---------------------------------------------
  if (!decision.ilustracion) {
    return (
      <div className="decision">
        {encabezado}
        {contexto}
        <div className="decision-pregunta">{decision.pregunta}</div>
        <div className="decision-opciones">
          {decision.opciones.map((opcion) => {
            const activa = elegidaId === opcion.id;
            const estado = activa ? resultadoDe(decision, opcion) : null;
            return (
              <button
                key={opcion.id}
                type="button"
                className={`chip${activa ? ` on ${estado}` : ''}`}
                disabled={!!elegidaId}
                onClick={() => elegir(opcion.id)}
              >
                <span>{opcion.texto}</span>
                {activa && (
                  <span className="decision-opcion-marca" aria-hidden="true">
                    {PRESENTACION_RESULTADO[estado].icono}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {feedback}
      </div>
    );
  }

  // --- Modo ilustrado -----------------------------------------------------
  // La escena mostrada es la consecuencia de lo elegido si la opción declara
  // una; si no, sigue la ilustración de la decisión.
  const escenaActiva = opcionElegida?.escenaConsecuencia ?? decision.ilustracion;
  const opcionesConEscena = decision.opciones.some((o) => o.escena);

  return (
    <div className="decision decision-ilustrada">
      <div className="di-escena">
        <EscenaPixel escena={escenaActiva} avatar={avatar} />
        {opcionElegida?.rotuloConsecuencia && (
          <div className={`di-rotulo ${resultado}`}>
            {opcionElegida.rotuloConsecuencia}
          </div>
        )}
      </div>

      <div className="di-panel">
        {encabezado}
        {contexto}
        <div className="decision-pregunta">{decision.pregunta}</div>

        <div
          className={
            opcionesConEscena
              ? `di-tarjetas${elegidaId ? ' resuelta' : ''}`
              : 'decision-opciones'
          }
        >
          {decision.opciones.map((opcion) => {
            const activa = elegidaId === opcion.id;
            const estado = activa ? resultadoDe(decision, opcion) : null;
            if (!opcionesConEscena) {
              return (
                <button
                  key={opcion.id}
                  type="button"
                  className={`chip${activa ? ` on ${estado}` : ''}`}
                  disabled={!!elegidaId}
                  onClick={() => elegir(opcion.id)}
                >
                  <span>{opcion.texto}</span>
                  {activa && (
                    <span className="decision-opcion-marca" aria-hidden="true">
                      {PRESENTACION_RESULTADO[estado].icono}
                    </span>
                  )}
                </button>
              );
            }
            return (
              <button
                key={opcion.id}
                type="button"
                className={`di-tarjeta${activa ? ` on ${estado}` : ''}`}
                disabled={!!elegidaId}
                onClick={() => elegir(opcion.id)}
              >
                <span className="di-tarjeta-img">
                  {opcion.escena && <EscenaPixel escena={opcion.escena} avatar={avatar} />}
                </span>
                <span className="di-tarjeta-texto">{opcion.texto}</span>
                {/* La marca dice si acertó, quedó cerca o se equivocó. */}
                {activa && (
                  <span className="di-tarjeta-marca" aria-hidden="true">
                    {PRESENTACION_RESULTADO[estado].icono}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {feedback}
      </div>
    </div>
  );
}
