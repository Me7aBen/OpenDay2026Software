import { useEffect, useRef, useState } from 'react';
import EscenaPixel from './EscenaPixel';
import '../styles/historieta.css';

// Historieta pixel art: una tira de 2-3 viñetas que se van revelando.
//
// Reemplaza al párrafo de explicación con el que abría cada fase. En vez de
// cinco renglones de texto, el estudiante ve la escena y lee una frase corta
// debajo. Las viñetas ya reveladas se quedan en pantalla: al final se lee como
// una tira de cómic completa, no como una sucesión de pantallas sueltas.
//
// Es genérico: recibe los paneles desde el JSON del escenario. Un escenario que
// no declara `historieta` nunca monta este componente (Ccorca v1 y v2).
//
// Props:
//   paneles     [{ escena, texto, quien? }]  - quien: rótulo del globo ('NIA')
//   avatar      { rostro, color, accesorio } - para las escenas con el jugador
//   textoBoton  string  - texto del botón al revelar la última viñeta
//   onTerminar  () => void
//   revelarTodo boolean - muestra la tira entera de una y sin controles. Es el
//                         modo del epílogo, donde la historieta es un cierre
//                         que se contempla, no algo que haya que avanzar.
//
// Interacción: se avanza tocando la tira o pulsando el botón. El botón es un
// <button> real, así que Tab + Enter recorre la historieta sin mouse.

export default function HistorietaPixel({
  paneles = [],
  avatar,
  textoBoton = 'COMENZAR',
  onTerminar,
  revelarTodo = false,
}) {
  const [visibles, setVisibles] = useState(revelarTodo ? paneles.length : 1);
  const total = paneles.length;
  const completa = visibles >= total;
  const botonRef = useRef(null);
  const anuncioRef = useRef(null);

  // Al montar (cambio de fase) el foco va al botón: quien navega con teclado
  // no tiene que tabular desde el principio de la página en cada fase. En el
  // modo `revelarTodo` no hay botón y no se roba el foco de nada.
  useEffect(() => {
    botonRef.current?.focus();
  }, []);

  function avanzar() {
    if (completa) {
      onTerminar?.();
      return;
    }
    setVisibles((n) => Math.min(total, n + 1));
  }

  if (!total) return null;

  return (
    <div className="hist">
      {/* La tira es clicable como atajo, pero no es el control accesible: el
          botón de abajo cumple ese papel. Por eso va con aria-hidden en su
          rol interactivo y sin tabIndex. */}
      <div
        className="hist-tira"
        style={{ '--paneles': total }}
        onClick={revelarTodo ? undefined : avanzar}
        role="presentation"
      >
        {paneles.map((p, i) => {
          const revelado = i < visibles;
          const esUltimo = !revelarTodo && i === visibles - 1;
          return (
            <figure
              key={p.escena + i}
              className={`hist-panel${revelado ? ' visible' : ''}${esUltimo ? ' actual' : ''}`}
              aria-hidden={revelado ? undefined : 'true'}
            >
              <div className="hist-vineta">
                {revelado && <EscenaPixel escena={p.escena} avatar={avatar} />}
                <span className="hist-numero">{i + 1}</span>
              </div>
              <figcaption className="hist-texto">
                {revelado && (
                  <>
                    {p.quien && <span className="hist-quien">{p.quien}</span>}
                    <span className="hist-frase">{p.texto}</span>
                  </>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>

      {/* Región que anuncia la viñeta recién revelada a lectores de pantalla. */}
      {!revelarTodo && (
        <p className="hist-anuncio" role="status" aria-live="polite" ref={anuncioRef}>
          Viñeta {Math.min(visibles, total)} de {total}. {paneles[visibles - 1]?.texto}
        </p>
      )}

      {!revelarTodo && (
        <div className="hist-pie">
          <span className="hist-progreso" aria-hidden="true">
            {paneles.map((p, i) => (
              <span key={p.escena + i} className={`hist-punto${i < visibles ? ' on' : ''}`} />
            ))}
          </span>
          <button type="button" className="btn-primary hist-boton" onClick={avanzar} ref={botonRef}>
            {completa ? textoBoton : 'Siguiente viñeta →'}
          </button>
        </div>
      )}
    </div>
  );
}
