import Entrevista from './Entrevista';
import Wireframe from './Wireframe';
import Logica from './Logica';
import Bugs from './Bugs';
import Deploy from './Deploy';
import ArquitecturaNodos from './ArquitecturaNodos';
import MapaCalor from './MapaCalor';
import SeleccionCards from './SeleccionCards';

// Mapeo de tipoInteraccion (declarado por cada Decision en el JSON del
// escenario) -> componente de minijuego. Esto reemplaza el antiguo mapeo
// por `fase.estilo`, que asumía 1-a-1 entre fase y mecánica. Ahora una
// fase puede mezclar mecánicas libremente.
export const minijuegoPorTipo = {
  'seleccion-unica': Entrevista,
  'seleccion-multiple': Wireframe,
  escribir: Logica,
  'arquitectura-nodos': ArquitecturaNodos,
  'mapa-calor': MapaCalor,
  'seleccion-cards': SeleccionCards,
};

// Compatibilidad hacia atrás: mapa por estilo de fase, para los lugares que
// aún lo usen (no debería haber, pero por las dudas).
export const minijuegoPorEstilo = {
  entrevista: Entrevista,
  wireframe: Wireframe,
  logica: Logica,
  bugs: Bugs,
  deploy: Deploy,
};
