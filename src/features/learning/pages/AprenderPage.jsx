import { useEffect } from 'react';
import { Enlace } from '../../../app/router/Router';
import { aplicarMeta } from '../../../app/seo';
import { CURSOS, formatearPrecio } from '../data/cursos';

export default function AprenderPage() {
  useEffect(() => {
    aplicarMeta({
      titulo: 'Microcursos',
      descripcion:
        'Cursos cortos y económicos para profundizar en lo que acabas de experimentar en una simulación.',
      ruta: '/aprender',
    });
  }, []);

  return (
    <>
      <div className="pf-hero" style={{ paddingBottom: 12 }}>
        <h1>Aprender un poco más</h1>
        <p>
          Cursos cortos que continúan lo que ya hiciste en una simulación. Nunca son obligatorios:
          las simulaciones son y seguirán siendo gratuitas.
        </p>
      </div>

      <div className="pf-grid-carreras">
        {CURSOS.map((curso) => (
          <article className="pf-curso-card" key={curso.id}>
            <span className="pf-etiqueta">{curso.subtitulo}</span>
            <h3 style={{ margin: 0, fontSize: 18 }}>{curso.titulo}</h3>
            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.5 }}>
              {curso.descripcion}
            </p>
            <div className="pf-chips">
              <span className="pf-chip-dato">⏱ {curso.duracionLabel}</span>
              <span className="pf-chip-dato">{curso.nivel}</span>
              <span className="pf-chip-dato">{curso.lecciones.length} lecciones</span>
            </div>
            <div className="pf-precio">{formatearPrecio(curso)}</div>
            <Enlace to={`/aprender/${curso.slug}`} className="pf-boton ancho">
              Ver microcurso
            </Enlace>
          </article>
        ))}
      </div>
    </>
  );
}
