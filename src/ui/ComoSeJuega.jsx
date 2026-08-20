import { useEffect, useRef } from 'react';
import '../styles/como-se-juega.css';

// Explicación básica de la partida, abierta desde el enlace de la TopBar.
//
// A propósito NO menciona minutos ni cantidad exacta de decisiones: cada
// escenario define su propio `tiempoTotalSeg` y su propia cantidad de
// decisiones (Ccorca corre 16 min con 10, Código Cero 7 min con 12), así que
// cualquier número concreto acá quedaría mintiendo en la mitad de los casos.
// El tope de 1000 sí es del motor (`calcularPuntajeFinal` lo capea), no del
// contenido, así que ese sí se puede afirmar.
//
// Props:
//   abierto   boolean
//   onCerrar  function

const PASOS = [
  {
    titulo: 'Recibes un cliente con un problema real',
    texto: 'Alguien necesita algo que solo el software puede resolver. Te va a hablar durante toda la partida desde la esquina de la pantalla.',
  },
  {
    titulo: 'Pasas por las 5 fases',
    texto: 'Descubrir, Diseñar, Construir, Probar y Desplegar. Son las mismas etapas por las que pasa cualquier producto de software de verdad.',
  },
  {
    titulo: 'En cada fase tomas decisiones',
    texto: 'Cada una suma puntos según qué tan bien resuelve el problema del cliente. Ninguna decisión te elimina: todas te dejan avanzar, pero unas llevan a un final mejor que otras.',
  },
  {
    titulo: 'El reloj corre',
    texto: 'El tiempo que te sobre al final se convierte en puntos, así que conviene decidir bien y rápido. Si se acaba el tiempo de una fase, pasas a la siguiente igual.',
  },
  {
    titulo: 'Al final ves cómo terminó la historia',
    texto: 'El desenlace cambia según lo que decidiste, y tu puntaje se compara con el de los demás sobre un total de 1000.',
  },
];

export default function ComoSeJuega({ abierto, onCerrar }) {
  const cerrarRef = useRef(null);

  // Escape cierra. El listener solo existe mientras el modal está abierto,
  // así que no interfiere con nada del resto del juego.
  useEffect(() => {
    if (!abierto) return;
    function alPresionar(e) {
      if (e.key === 'Escape') onCerrar();
    }
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [abierto, onCerrar]);

  // El foco entra al modal al abrirse: si alguien navega con teclado no queda
  // atrás en la barra superior.
  useEffect(() => {
    if (abierto) cerrarRef.current?.focus();
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div className="csj-fondo" onClick={onCerrar}>
      <div
        className="csj-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="csj-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="csj-cabecera">
          <h2 className="csj-titulo" id="csj-titulo">¿CÓMO SE JUEGA?</h2>
          <button
            type="button"
            className="csj-cerrar"
            onClick={onCerrar}
            ref={cerrarRef}
            aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <p className="csj-intro">Hoy no vas a escuchar sobre software. Lo vas a hacer.</p>

        <ol className="csj-pasos">
          {PASOS.map((paso, i) => (
            <li className="csj-paso" key={paso.titulo}>
              <span className="csj-numero">{i + 1}</span>
              <div>
                <div className="csj-paso-titulo">{paso.titulo}</div>
                <div className="csj-paso-texto">{paso.texto}</div>
              </div>
            </li>
          ))}
        </ol>

        <div className="csj-pie">
          <span className="csj-consejo">
            Consejo: lee lo que dice el cliente. Casi siempre ahí está la respuesta.
          </span>
          <button type="button" className="btn-primary" onClick={onCerrar}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
