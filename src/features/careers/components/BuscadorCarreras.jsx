import { useId, useState } from 'react';
import { useRuta } from '../../../app/router/useRuta';
import { buscarCarreras, SUGERENCIAS_BUSQUEDA } from '../normalizar';

// Buscador grande de la home (§10).
//
// Es un <form> de verdad: se envía con Enter, funciona con teclado y el botón
// es un submit. Mientras se escribe muestra hasta 5 coincidencias como enlaces
// reales, así el estudiante llega a la ficha en un toque desde el celular.
export default function BuscadorCarreras({ autoFocus = false }) {
  const { navegar } = useRuta();
  const [texto, setTexto] = useState('');
  const id = useId();
  const coincidencias = texto.trim().length >= 2 ? buscarCarreras({ texto }).slice(0, 5) : [];

  function enviar(evento) {
    evento.preventDefault();
    const primera = coincidencias[0];
    if (primera) navegar(`/carreras/${primera.slug}`);
    else navegar(`/carreras?q=${encodeURIComponent(texto.trim())}`);
  }

  return (
    <div className="pf-buscador">
      <form onSubmit={enviar} role="search">
        <label className="pf-sr" htmlFor={id}>
          Buscar una carrera
        </label>
        <div className="pf-buscador-campo">
          <svg
            className="pf-buscador-icono"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            id={id}
            type="search"
            value={texto}
            autoFocus={autoFocus}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar una carrera..."
            autoComplete="off"
          />
          <button type="submit" className="pf-buscador-boton">
            Buscar
          </button>
        </div>
      </form>

      {coincidencias.length > 0 && (
        <div className="pf-resultados-rapidos" role="listbox" aria-label="Coincidencias">
          {coincidencias.map((carrera) => (
            <a
              key={carrera.id}
              className="pf-resultado-rapido"
              href={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/carreras/${carrera.slug}`}
              onClick={(e) => {
                e.preventDefault();
                navegar(`/carreras/${carrera.slug}`);
              }}
            >
              <span aria-hidden="true">{carrera.areaInfo?.emoji}</span>
              <span>{carrera.nombre}</span>
              <span className="area">{carrera.areaInfo?.nombre}</span>
            </a>
          ))}
        </div>
      )}

      <div className="pf-sugerencias">
        {SUGERENCIAS_BUSQUEDA.map((sugerencia) => (
          <button
            key={sugerencia}
            type="button"
            className="pf-sugerencia"
            onClick={() => setTexto(sugerencia)}
          >
            {sugerencia}
          </button>
        ))}
      </div>
    </div>
  );
}
