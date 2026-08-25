import { useEffect, useMemo, useState } from 'react';
import { aplicarMeta } from '../../../app/seo';
import { AREAS } from '../data/areas';
import { buscarCarreras } from '../normalizar';
import CarreraCard from '../components/CarreraCard';

// Lee ?q= y ?area= de la URL para que un enlace compartido abra ya filtrado.
function parametrosIniciales() {
  const params = new URLSearchParams(window.location.search);
  return { texto: params.get('q') ?? '', area: params.get('area') ?? null };
}

export default function CarrerasPage() {
  const iniciales = useMemo(() => parametrosIniciales(), []);
  const [texto, setTexto] = useState(iniciales.texto);
  const [area, setArea] = useState(iniciales.area);
  const resultados = buscarCarreras({ texto, area });

  useEffect(() => {
    aplicarMeta({
      titulo: 'Explorar carreras',
      descripcion:
        'Busca entre carreras de tecnología, ingeniería, salud, negocios, diseño, ciencias sociales, derecho y ciencias. Descubre qué se estudia en cada una.',
      ruta: '/carreras',
    });
  }, []);

  return (
    <>
      <div className="pf-hero" style={{ paddingBottom: 16 }}>
        <h1>Explorar carreras</h1>
        <p>Busca por nombre, por lo que te gustaría hacer o filtra por área.</p>

        <div className="pf-buscador">
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
              type="search"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar una carrera..."
              aria-label="Buscar una carrera"
            />
          </div>
        </div>
      </div>

      <div className="pf-filtros" role="group" aria-label="Filtrar por área">
        <button
          type="button"
          className={`pf-filtro${area === null ? ' on' : ''}`}
          aria-pressed={area === null}
          onClick={() => setArea(null)}
        >
          Todas
        </button>
        {AREAS.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`pf-filtro${area === a.id ? ' on' : ''}`}
            aria-pressed={area === a.id}
            onClick={() => setArea(area === a.id ? null : a.id)}
          >
            {a.emoji} {a.nombre}
          </button>
        ))}
      </div>

      <p className="pf-seccion-sub" role="status">
        {resultados.length === 0
          ? 'No encontramos carreras con ese criterio.'
          : `${resultados.length} carrera${resultados.length === 1 ? '' : 's'}`}
      </p>

      {resultados.length === 0 ? (
        <div className="pf-vacio">
          Prueba con otra palabra, o quita el filtro de área.
        </div>
      ) : (
        <div className="pf-grid-carreras">
          {resultados.map((carrera) => (
            <CarreraCard key={carrera.id} carrera={carrera} />
          ))}
        </div>
      )}
    </>
  );
}
