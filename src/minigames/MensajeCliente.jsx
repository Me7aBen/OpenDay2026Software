import '../styles/mensaje-cliente.css';

// Mensaje contextual del cliente (cliente del escenario) arriba del
// minijuego. Es opcional: si la decision no trae `mensajeClienteDecision`,
// no se renderiza nada.
//
// Uso:
//   <MensajeCliente nombre="Rosa" rol="Profesora" texto="..." />
//
// El componente NO mantiene estado ni se acumula. Desaparece al cambiar
// de decisión, naturalmente.

export default function MensajeCliente({ nombre, rol, texto }) {
  if (!texto) return null;
  const quien = rol ? `${nombre} · ${rol}` : nombre;
  return (
    <div className="mensaje-cliente">
      <span className="emoji" aria-hidden="true">💬</span>
      <div className="contenido">
        <div className="quien">{quien}</div>
        <div className="texto">{texto}</div>
      </div>
    </div>
  );
}
