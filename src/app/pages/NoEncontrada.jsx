import { Enlace } from '../router/Router';

export default function NoEncontrada({ mensaje = 'No encontramos esa página.' }) {
  return (
    <div className="pf-vacio">
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>{mensaje}</h1>
      <p style={{ marginBottom: 20 }}>Puede que el enlace esté mal escrito o que ya no exista.</p>
      <Enlace to="/" className="pf-boton">
        Volver al inicio
      </Enlace>
    </div>
  );
}
