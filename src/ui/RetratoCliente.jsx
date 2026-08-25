import EstadoCliente from './EstadoCliente';
import RetratoNIA from './RetratoNIA';
import RetratoValeria from '../features/simulations/ui/RetratoValeria';

// Elige cómo se dibuja el cliente del escenario. Es un mapa de componentes, no
// una cadena de ifs: agregar un retrato nuevo es agregar una entrada acá y
// declarar `cliente.retrato` en el JSON del escenario.
//
// El default es 'emoji', que es exactamente lo que hacían Ccorca v1 y v2 antes
// de que existiera este archivo. Como sus JSON no declaran `retrato`, caen en
// el default y su comportamiento no cambia en nada.
const RETRATOS = {
  emoji: EstadoCliente,
  nia: RetratoNIA,
  valeria: RetratoValeria,
};

export default function RetratoCliente({ tipo, estado }) {
  const Componente = RETRATOS[tipo] ?? RETRATOS.emoji;
  return <Componente estado={estado} />;
}
