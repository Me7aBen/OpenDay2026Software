import { useEffect } from 'react';
import { Enlace } from '../../../app/router/Router';
import { aplicarMeta } from '../../../app/seo';
import { cursoPorSlug, formatearPrecio, ESTADO_COMERCIAL } from '../data/cursos';
import { simulacionPorId } from '../../simulations/catalogo';
import { registrarCurso } from '../../exploration/almacen';
import NoEncontrada from '../../../app/pages/NoEncontrada';

export default function CursoDetallePage({ params }) {
  const curso = cursoPorSlug(params.slug);

  useEffect(() => {
    if (!curso) return;
    aplicarMeta({
      titulo: curso.titulo,
      descripcion: curso.descripcion,
      ruta: `/aprender/${curso.slug}`,
      tipo: 'article',
    });
    // Ver la ficha ya cuenta como "explorado" en Mi exploración: es un rastro
    // de interés, no una compra ni una inscripción.
    registrarCurso(curso.id, 'visto');
  }, [curso]);

  if (!curso) return <NoEncontrada mensaje="No encontramos ese microcurso." />;

  const simulacion = curso.simulacionRelacionadaId
    ? simulacionPorId(curso.simulacionRelacionadaId)
    : null;

  return (
    <>
      <nav className="pf-migas" aria-label="Ruta de navegación">
        <Enlace to="/">Inicio</Enlace>
        <span aria-hidden="true">/</span>
        <Enlace to="/aprender">Aprender</Enlace>
        <span aria-hidden="true">/</span>
        <span>{curso.titulo}</span>
      </nav>

      <header className="pf-ficha-hero">
        <span className="pf-etiqueta">{curso.subtitulo}</span>
        <h1>{curso.titulo}</h1>
        <p className="resumen">{curso.descripcion}</p>
        <div className="pf-chips" style={{ marginBottom: 16 }}>
          <span className="pf-chip-dato">⏱ {curso.duracionLabel}</span>
          <span className="pf-chip-dato">{curso.nivel}</span>
          <span className="pf-chip-dato">{curso.lecciones.length} lecciones</span>
        </div>

        <div className="pf-card" style={{ display: 'grid', gap: 12 }}>
          <div className="pf-precio">{formatearPrecio(curso)}</div>
          {/* §48: sin backend de pagos NO se simula ninguna compra. El botón
              dice la verdad y no pide un solo dato. */}
          <button type="button" className="pf-boton ancho" disabled>
            {ESTADO_COMERCIAL.modo === 'checkout' ? 'Comprar' : 'Próximamente disponible'}
          </button>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Todavía no habilitamos el pago. Cuando esté listo se hará con una pasarela segura; no
            pedimos datos de tarjeta en esta pantalla ni en ninguna otra.
          </p>
        </div>
      </header>

      {simulacion && (
        <section className="pf-bloque">
          <h2>Viene de esta simulación</h2>
          <article className="pf-sim-card">
            <div className="cuerpo">
              <span className="etiqueta">{simulacion.etiqueta}</span>
              <h3>{simulacion.titulo}</h3>
              <p className="resumen">{simulacion.resumen}</p>
              <Enlace to={`/simulaciones/${simulacion.slug}`} className="pf-boton secundario ancho">
                Jugarla gratis
              </Enlace>
            </div>
          </article>
        </section>
      )}

      <section className="pf-bloque">
        <h2>Qué vas a aprender</h2>
        <ul className="pf-lista-check">
          {curso.loQueAprenderas.map((punto) => (
            <li key={punto}>{punto}</li>
          ))}
        </ul>
      </section>

      <section className="pf-bloque">
        <h2>Contenido</h2>
        <div className="pf-lecciones">
          {curso.lecciones.map((leccion, i) => (
            <article className="pf-leccion" key={leccion.id}>
              <h3>
                {i + 1}. {leccion.titulo}
              </h3>
              <p>{leccion.resumen}</p>
              {leccion.codigo && (
                <pre className="pf-codigo">
                  <code>{leccion.codigo}</code>
                </pre>
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
