import CiudadPixel from './CiudadPixel';

// Escena ilustrada de fondo del escenario, elegida por nombre desde el JSON
// (`presentacion.escena`). Es un mapa de componentes, igual que
// minijuegoPorTipo: sumar una escena nueva es sumar una entrada acá.
//
// Si el escenario no declara escena (Ccorca v1 y v2), esto devuelve null y el
// HUD no reserva ni un píxel para ella.
const ESCENAS = {
  'ciudad-nexo': CiudadPixel,
};

export default function EscenaFondo({ tipo, progreso, alto }) {
  const Componente = ESCENAS[tipo];
  if (!Componente) return null;
  return <Componente progreso={progreso} alto={alto} />;
}
