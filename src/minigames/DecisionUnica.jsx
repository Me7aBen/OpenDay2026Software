import { useState } from 'react';
import EscenaPixel from '../ui/EscenaPixel';
import '../styles/decision-unica.css';

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

  function elegir(opcionId) {
    if (elegidaId) return;
    setElegidaId(opcionId);
    onElegir([opcionId]);
  }

  const feedback = opcionElegida && (
    <div className="decision-feedback">
      {opcionElegida.descubrimiento && (
        <div className="feedback-box info">💬 {opcionElegida.descubrimiento}</div>
      )}
      {opcionElegida.feedback && <div className="feedback-box ok">{opcionElegida.feedback}</div>}
    </div>
  );

  // --- Modo texto (histórico) ---------------------------------------------
  if (!decision.ilustracion) {
    return (
      <div className="decision">
        {encabezado}
        <div className="decision-pregunta">{decision.pregunta}</div>
        <div className="decision-opciones">
          {decision.opciones.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              className={`chip${elegidaId === opcion.id ? ' on' : ''}`}
              disabled={!!elegidaId}
              onClick={() => elegir(opcion.id)}
            >
              {opcion.texto}
            </button>
          ))}
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
          <div className={`di-rotulo${opcionElegida.esTrampa ? ' malo' : ' bueno'}`}>
            {opcionElegida.rotuloConsecuencia}
          </div>
        )}
      </div>

      <div className="di-panel">
        {encabezado}
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
            if (!opcionesConEscena) {
              return (
                <button
                  key={opcion.id}
                  type="button"
                  className={`chip${activa ? ' on' : ''}`}
                  disabled={!!elegidaId}
                  onClick={() => elegir(opcion.id)}
                >
                  {opcion.texto}
                </button>
              );
            }
            return (
              <button
                key={opcion.id}
                type="button"
                className={`di-tarjeta${activa ? ' on' : ''}`}
                disabled={!!elegidaId}
                onClick={() => elegir(opcion.id)}
              >
                <span className="di-tarjeta-img">
                  {opcion.escena && <EscenaPixel escena={opcion.escena} avatar={avatar} />}
                </span>
                <span className="di-tarjeta-texto">{opcion.texto}</span>
                {/* La marca de elegida es un glifo, no solo el borde de color. */}
                {activa && <span className="di-tarjeta-marca">✔</span>}
              </button>
            );
          })}
        </div>

        {feedback}
      </div>
    </div>
  );
}
