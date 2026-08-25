// Categorías del explorador (§11). El emoji es parte del dato porque es la
// única señal visual de la tarjeta en móvil, donde no entra nada más.

export const AREAS = [
  { id: 'tecnologia', nombre: 'Tecnología', emoji: '💻', color: 'var(--cyan)' },
  { id: 'ingenierias', nombre: 'Ingenierías', emoji: '⚙️', color: 'var(--gold)' },
  { id: 'salud', nombre: 'Salud', emoji: '🩺', color: 'var(--green)' },
  { id: 'negocios', nombre: 'Negocios', emoji: '💼', color: '#8ab4ff' },
  { id: 'diseno', nombre: 'Diseño y creatividad', emoji: '🎨', color: 'var(--pink)' },
  { id: 'sociales', nombre: 'Ciencias sociales', emoji: '🧠', color: '#c9a7ff' },
  { id: 'derecho', nombre: 'Derecho', emoji: '⚖️', color: '#ffb37a' },
  { id: 'ciencias', nombre: 'Ciencias', emoji: '🔬', color: '#7ce0c4' },
];

export function areaPorId(id) {
  return AREAS.find((a) => a.id === id) ?? null;
}
