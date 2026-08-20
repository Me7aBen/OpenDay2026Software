import { ESTADO_IDLE, ESTADOS } from './estadosCliente';
import '../styles/estado-cliente.css';

// Componente que muestra el emoji de reacción del personaje.
// Las animaciones son CSS keyframes simples: bounce, shake, recoil, pop.
// Sin librerías, sin canvas. Re-trigger de la animación cada vez que cambia
// el estado (key={estado} en el <span>).

export default function EstadoCliente({ estado = ESTADO_IDLE }) {
  const data = ESTADOS[estado] ?? ESTADOS[ESTADO_IDLE];
  return (
    <div className="estado-cliente" aria-label={data.label}>
      <span key={estado} className={`emoji estado-${estado}`}>
        {data.emoji}
      </span>
    </div>
  );
}
