import { useEffect } from 'react';
import { Enlace } from '../../../app/router/Router';
import { aplicarMeta } from '../../../app/seo';
import { carreraPorSlug } from '../normalizar';
import { alternarCarreraGuardada, alternarComparar, MAX_COMPARAR } from '../../exploration/almacen';
import { useExploracion } from '../../exploration/useExploracion';
import { CURSOS, formatearPrecio } from '../../learning/data/cursos';
import NoEncontrada from '../../../app/pages/NoEncontrada';

function Bloque({ titulo, children }) {
  return (
    <section className="pf-bloque">
      <h2>{titulo}</h2>
      {children}
    </section>
  );
}

export default function CarreraDetallePage({ params }) {
  const carrera = carreraPorSlug(params.slug);
  const exploracion = useExploracion();

  useEffect(() => {
    if (!carrera) return;
    // §60: "Ingeniería de Software en Perú | PRIMER DÍA"
    aplicarMeta({
      titulo: `${carrera.nombre} en Perú`,
      descripcion: `Conoce qué estudia ${carrera.nombre}, dónde puedes estudiarla y prueba una simulación gratuita.`,
      ruta: `/carreras/${carrera.slug}`,
      tipo: 'article',
    });
  }, [carrera]);

  if (!carrera) return <NoEncontrada mensaje="No encontramos esa carrera." />;

  const guardada = exploracion.carrerasGuardadas.includes(carrera.id);
  const enComparador = exploracion.comparador.includes(carrera.id);
  const comparadorLleno = exploracion.comparador.length >= MAX_COMPARAR && !enComparador;
  const cursos = CURSOS.filter((c) => c.carreraIds.includes(carrera.id));

  return (
    <>
      <nav className="pf-migas" aria-label="Ruta de navegación">
        <Enlace to="/">Inicio</Enlace>
        <span aria-hidden="true">/</span>
        <Enlace to="/carreras">Carreras</Enlace>
        <span aria-hidden="true">/</span>
        <span>{carrera.nombre}</span>
      </nav>

      <header className="pf-ficha-hero">
        <span className="pf-etiqueta" style={{ color: carrera.areaInfo?.color }}>
          {carrera.areaInfo?.emoji} {carrera.areaInfo?.nombre}
        </span>
        <h1>{carrera.nombre}</h1>
        <p className="resumen">{carrera.descripcionCorta}</p>

        <div className="pf-chips" style={{ marginBottom: 16 }}>
          <span className="pf-chip-dato">⏱ {carrera.duracionLabel}</span>
          {carrera.fuenteEstado === 'demo' && (
            <span className="pf-etiqueta demo">Contenido orientativo</span>
          )}
        </div>

        <div className="pf-ficha-acciones">
          <button
            type="button"
            className={`pf-boton ${guardada ? '' : 'secundario'}`}
            aria-pressed={guardada}
            onClick={() => alternarCarreraGuardada(carrera.id)}
          >
            {guardada ? '♥ Guardada' : '♡ Guardar carrera'}
          </button>
          <button
            type="button"
            className="pf-boton secundario"
            disabled={comparadorLleno}
            aria-pressed={enComparador}
            onClick={() => alternarComparar(carrera.id)}
          >
            {enComparador ? '✓ En el comparador' : '⚖ Comparar'}
          </button>
        </div>
      </header>

      {carrera.simulaciones.length > 0 && (
        <Bloque titulo="Prueba esta carrera">
          <p>
            Antes de decidir, vive un problema real de esta profesión. Es gratis y no necesitas
            crear una cuenta.
          </p>
          <div className="pf-grid-carreras">
            {carrera.simulaciones.map((simulacion) => (
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
                    ▶ Iniciar simulación
                  </Enlace>
                </div>
              </article>
            ))}
          </div>
        </Bloque>
      )}

      <Bloque titulo="¿De qué trata?">
        <p>{carrera.deQueTrata}</p>
      </Bloque>

      <Bloque titulo="¿Qué problemas resuelve?">
        <ul className="pf-lista-check">
          {carrera.problemasQueResuelve.map((problema) => (
            <li key={problema}>{problema}</li>
          ))}
        </ul>
      </Bloque>

      <Bloque titulo="¿Qué estudiarás?">
        <div className="pf-columnas">
          <div className="pf-card">
            <h3 style={{ marginTop: 0, fontSize: 15 }}>Bases</h3>
            <ul className="pf-lista-check">
              {carrera.cursosBase.map((curso) => (
                <li key={curso}>{curso}</li>
              ))}
            </ul>
          </div>
          <div className="pf-card">
            <h3 style={{ marginTop: 0, fontSize: 15 }}>Más adelante</h3>
            <ul className="pf-lista-check">
              {carrera.cursosAvanzados.map((curso) => (
                <li key={curso}>{curso}</li>
              ))}
            </ul>
          </div>
        </div>
        <p style={{ marginTop: 12, fontSize: 13 }}>
          Los cursos exactos dependen de la universidad o instituto. Esto es una orientación
          general, no una malla oficial.
        </p>
      </Bloque>

      <Bloque titulo="Campo laboral">
        <p>Algunos de los roles en los que trabaja quien estudia esta carrera:</p>
        <div className="pf-chips">
          {carrera.campoLaboral.map((rol) => (
            <span className="pf-chip-dato" key={rol}>
              {rol}
            </span>
          ))}
        </div>
      </Bloque>

      <Bloque titulo="Dónde se puede estudiar">
        {carrera.programas.length === 0 ? (
          <div className="pf-aviso">
            Todavía no tenemos programas verificados para esta carrera. Estamos construyendo esta
            sección con fuentes oficiales; preferimos no mostrar nada antes que mostrar información
            inventada.
          </div>
        ) : (
          <>
            <div className="pf-aviso" style={{ marginBottom: 12 }}>
              Los registros que ves abajo son <strong>de ejemplo</strong>, para mostrar cómo se verá
              esta sección. No representan programas reales ni información oficial.
            </div>
            <div className="pf-tabla-programas">
              {carrera.programas.map((programa) => (
                <div className="pf-programa" key={programa.id}>
                  <div className="nombre">{programa.nombreOficial}</div>
                  <div className="datos">
                    <span>🏛 {programa.institucion?.nombre}</span>
                    <span>📍 {programa.institucion?.ciudad}</span>
                    <span>🎓 {programa.modalidad}</span>
                    <span>⏱ {programa.duracionLabel}</span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span className="pf-etiqueta demo">Registro de ejemplo</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Bloque>

      {cursos.length > 0 && (
        <Bloque titulo="Aprende un poco más">
          <div className="pf-grid-carreras">
            {cursos.map((curso) => (
              <article className="pf-curso-card" key={curso.id}>
                <span className="pf-etiqueta">{curso.subtitulo}</span>
                <h3 style={{ margin: 0 }}>{curso.titulo}</h3>
                <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 14 }}>
                  {curso.descripcion}
                </p>
                <div className="pf-precio">{formatearPrecio(curso)}</div>
                <Enlace to={`/aprender/${curso.slug}`} className="pf-boton secundario ancho">
                  Ver microcurso
                </Enlace>
              </article>
            ))}
          </div>
        </Bloque>
      )}
    </>
  );
}
