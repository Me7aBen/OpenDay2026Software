import EstadoCliente from './EstadoCliente';
import '../styles/cliente-flotante.css';

// Panel del cliente. Antes era un overlay `position: fixed` en la esquina
// inferior izquierda, y por eso se montaba encima del sidebar (tapaba el
// progreso y el botón de abandonar). Ahora ocupa una fila propia del sidebar:
// misma esquina de la pantalla, mismo peso visual, pero dentro del layout, así
// que nunca se superpone ni bloquea nada.
//
// Lo que NO cambió: sigue vivo durante toda la partida (intro de fase,
// minijuego, feedback) y conserva sus animaciones. El emoji mantiene las
// reacciones de EstadoCliente, el retrato flota en loop, y la burbuja entra
// animada cada vez que el cliente dice algo nuevo (el `key={texto}` la
// remonta, que es lo que redispara el keyframe).
//
// Props:
//   nombre  string  - quién habla ('Rosa')
//   rol     string  - su rol ('Profesora')
//   texto   string  - el mensaje activo (intro de fase o mensajeClienteDecision)
//   estado  string  - 'idle' | 'feliz' | 'confundido' | 'molesto' | 'sorprendido'
//
// Si el texto está vacío, se muestra igual el retrato: el cliente nunca
// desaparece de la pantalla, solo se queda callado.

export default function ClienteFlotante({ nombre, rol, texto, estado = 'idle' }) {
  return (
    <aside className="cliente-flotante" aria-live="polite">
      <div className="cabecera">
        <div className="avatar">
          <EstadoCliente estado={estado} />
        </div>
        <div className="identidad">
          <div className="nombre">{nombre}</div>
          <div className="rol">{rol}</div>
        </div>
      </div>

      {texto && (
        <div className="burbuja" key={texto}>
          <div className="pico" />
          <p className="texto">{texto}</p>
        </div>
      )}
    </aside>
  );
}
