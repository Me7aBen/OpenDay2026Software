import { useMemo, useState } from 'react';
import '../styles/seleccion-cards.css';

// Mini-juego: el usuario ve N cards (3 por defecto) con un mockup/imagen
// cada una, y elige una haciendo clic. El motor lee `metaMinijuego.imagenes[]`
// (cada una con id, label, svg, descripcion, puntaje, esTrampa) y devuelve
// el puntaje de la imagen seleccionada.
//
// Props:
//   decision   Decision con metaMinijuego.imagenes[]
//   onElegir   (opcionIds: string[]) => void

export default function SeleccionCards({ decision, onElegir }) {
  const meta = decision.metaMinijuego ?? {};
  const imagenes = useMemo(() => meta.imagenes ?? [], [meta.imagenes]);

  const [elegidaId, setElegidaId] = useState(null);
  const [terminado, setTerminado] = useState(false);

  const imagenElegida = imagenes.find((i) => i.id === elegidaId);

  function elegir(imagen) {
    if (terminado) return;
    setElegidaId(imagen.id);
  }

  function confirmar() {
    if (terminado || !elegidaId) return;
    setTerminado(true);
    onElegir([elegidaId]);
  }

  return (
    <div className="seleccion-cards">
      <div className="label-pixel">🎨 DISEÑO DEL CELULAR</div>

      <div className="seleccion-cards-pregunta">{decision.pregunta}</div>

      <div className="seleccion-cards-grid">
        {imagenes.map((img) => {
          const estaMarcada = elegidaId === img.id;
          let clase = 'card';
          if (estaMarcada) clase += ' card-elegida';
          return (
            <div
              key={img.id}
              className={clase}
              onClick={() => elegir(img)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') elegir(img);
              }}
            >
              <div
                className="card-imagen"
                // SVG viene del JSON, contenido controlado por el equipo.
                dangerouslySetInnerHTML={{ __html: img.svg ?? '' }}
              />
              <div className="card-info">
                <div className="card-label">{img.label}</div>
                <div className="card-descripcion">{img.descripcion}</div>
              </div>
              {estaMarcada && (
                <div className="card-marca" aria-label="Elegida">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {terminado && imagenElegida ? (
        <div className={`seleccion-cards-feedback ${imagenElegida.esTrampa ? 'info' : 'ok'}`}>
          {imagenElegida.esTrampa
            ? `Elegiste "${imagenElegida.label}". ${imagenElegida.feedback ?? 'No es la mejor opción para el portero.'}`
            : `¡Bien! "${imagenElegida.label}" es la mejor opción para el portero. ${imagenElegida.feedback ?? ''}`}
          <div className="seleccion-cards-puntaje">
            +{imagenElegida.puntaje ?? 0} pts
          </div>
        </div>
      ) : (
        <div className="seleccion-cards-footer">
          <span className="hint">
            💡 Elegí el diseño que mejor le sirva al portero: ni muy vacío, ni muy lleno.
          </span>
          <button type="button" className="btn-primary" onClick={confirmar} disabled={!elegidaId}>
            Confirmar elección
          </button>
        </div>
      )}
    </div>
  );
}
