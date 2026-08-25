import { useEffect } from 'react';
import { Enlace } from '../../../app/router/Router';
import { useRuta } from '../../../app/router/useRuta';
import { aplicarMeta } from '../../../app/seo';
import { AREAS } from '../../careers/data/areas';
import BuscadorCarreras from '../../careers/components/BuscadorCarreras';
import { SIMULACIONES } from '../../simulations/catalogo';
import { APP_DESCRIPCION } from '../../../config/marca';

const PASOS = [
  {
    titulo: 'EXPLORA',
    texto: 'Busca una carrera y descubre qué se estudia realmente en ella.',
  },
  {
    titulo: 'EXPERIMENTA',
    texto: 'Juega una simulación basada en situaciones profesionales reales.',
  },
  {
    titulo: 'COMPARA',
    texto: 'Pon lado a lado las opciones que te interesan antes de decidir.',
  },
  {
    titulo: 'APRENDE',
    texto: 'Si algo te enganchó, profundiza con un microcurso corto.',
  },
];

export default function HomePage() {
  const { navegar } = useRuta();
  const destacadas = SIMULACIONES.filter((s) => s.destacada);
  const otras = SIMULACIONES.filter((s) => !s.destacada);

  useEffect(() => {
    aplicarMeta({ ruta: '/' });
  }, []);

  return (
    <>
      <section className="pf-hero">
        <span className="pf-hero-kicker">Antes de elegir una carrera, experiméntala</span>
        <h1>¿Aún no sabes qué estudiar?</h1>
        <p>{APP_DESCRIPCION}</p>
        <BuscadorCarreras />
      </section>

      <section className="pf-seccion" aria-labelledby="titulo-categorias">
        <h2 className="pf-seccion-titulo" id="titulo-categorias">
          Explora por área
        </h2>
        <p className="pf-seccion-sub">Toca un área para ver las carreras que incluye.</p>
        <div className="pf-categorias">
          {AREAS.map((area) => (
            <button
              key={area.id}
              type="button"
              className="pf-categoria"
              onClick={() => navegar(`/carreras?area=${area.id}`)}
            >
              <span className="emoji" aria-hidden="true">
                {area.emoji}
              </span>
              {area.nombre}
            </button>
          ))}
        </div>
      </section>

      <section className="pf-seccion" aria-labelledby="titulo-como">
        <h2 className="pf-seccion-titulo" id="titulo-como">
          Cómo funciona
        </h2>
        <p className="pf-seccion-sub">Cuatro pasos, sin cuenta y sin costo para empezar.</p>
        <div className="pf-pasos">
          {PASOS.map((paso, i) => (
            <div className="pf-paso" key={paso.titulo}>
              <span className="pf-paso-numero">{i + 1}</span>
              <div>
                <h3>{paso.titulo}</h3>
                <p>{paso.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pf-seccion" aria-labelledby="titulo-sims">
        <h2 className="pf-seccion-titulo" id="titulo-sims">
          Prueba una profesión
        </h2>
        <p className="pf-seccion-sub">
          Simulaciones gratuitas donde resuelves un problema real de esa profesión.
        </p>

        <div className="pf-grid-carreras">
          {[...destacadas, ...otras].map((simulacion) => (
            <article className="pf-sim-card" key={simulacion.id}>
              <div className="cuerpo">
                <span className="etiqueta">{simulacion.etiqueta}</span>
                <h3>{simulacion.titulo}</h3>
                <p className="resumen">{simulacion.resumen}</p>
                <div className="datos">
                  <span className="pf-etiqueta">⏱ {simulacion.duracionLabel}</span>
                  <span className="pf-etiqueta gratis">GRATIS</span>
                </div>
                <Enlace to={`/simulaciones/${simulacion.slug}`} className="pf-boton ancho">
                  Ver simulación
                </Enlace>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="pf-seccion">
        <div className="pf-card">
          <h2 className="pf-seccion-titulo">Tu puntaje no decide tu futuro</h2>
          <p className="pf-seccion-sub" style={{ margin: 0 }}>
            Las simulaciones te dan un puntaje porque son un juego. Ese número dice cómo resolviste
            ese reto, no si una carrera es o no adecuada para ti. Lo que sí importa es qué sentiste
            mientras la jugabas.
          </p>
        </div>
      </section>
    </>
  );
}
