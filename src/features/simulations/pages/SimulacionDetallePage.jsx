import { useEffect, useState } from 'react';
import { Enlace } from '../../../app/router/Router';
import { useRuta } from '../../../app/router/useRuta';
import { aplicarMeta } from '../../../app/seo';
import { simulacionPorSlug, cargarEscenario } from '../catalogo';
import { carreraPorId } from '../../careers/normalizar';
import EscenaKawsay from '../ui/EscenaKawsay';
import RetratoValeria from '../ui/RetratoValeria';
import NoEncontrada from '../../../app/pages/NoEncontrada';
import '../../../styles/simulacion-intro.css';

// Pantalla de entrada a una simulación: /simulaciones/:slug
//
// Es la que reproduce la referencia visual del brief (§20, §25): título grande,
// etiqueta de categoría, escena pixel art con el tablero de pedidos, caja de
// diálogo de Valeria, panel derecho con objetivo/dificultad/recompensa y la
// barra de etapas abajo.
//
// El JSON del escenario se trae con import dinámico (§57): la home nunca lo
// descarga, y cuando el estudiante toca JUGAR el módulo ya está en caché.

function Panel({ icono, titulo, children }) {
  return (
    <div className="si-panel">
      <div className="si-panel-titulo">
        <span aria-hidden="true">{icono}</span>
        {titulo}
      </div>
      {children}
    </div>
  );
}

function BarraDificultad({ nivel }) {
  return (
    <div className="si-dificultad" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <span key={n} className={n <= nivel ? 'on' : ''} />
      ))}
    </div>
  );
}

export default function SimulacionDetallePage({ params }) {
  const simulacion = simulacionPorSlug(params.slug);
  const { navegar } = useRuta();
  const [escenario, setEscenario] = useState(null);
  const [linea, setLinea] = useState(0);

  useEffect(() => {
    if (!simulacion) return;
    aplicarMeta({
      titulo: `${simulacion.titulo} — simulación gratuita`,
      descripcion: simulacion.descripcion,
      ruta: `/simulaciones/${simulacion.slug}`,
      tipo: 'article',
    });
  }, [simulacion]);

  useEffect(() => {
    if (!simulacion) return;
    let vivo = true;
    cargarEscenario(simulacion).then((datos) => {
      if (vivo) setEscenario(datos);
    });
    return () => {
      vivo = false;
    };
  }, [simulacion]);

  if (!simulacion) return <NoEncontrada mensaje="No encontramos esa simulación." />;

  const intro = escenario?.presentacion?.introSimulacion ?? null;
  const dialogo = intro?.dialogo ?? [];
  const actual = dialogo[Math.min(linea, Math.max(0, dialogo.length - 1))] ?? null;
  const esUltima = linea >= dialogo.length - 1;
  const carreras = (simulacion.carreraIds ?? []).map(carreraPorId).filter(Boolean);
  const etapas = simulacion.etapas ?? [];

  return (
    <div className="si">
      <nav className="si-volver">
        <Enlace to="/simulaciones" className="si-volver-link">
          ← Volver a simulaciones
        </Enlace>
      </nav>

      <header className="si-cabecera">
        <span className="si-tag-fase">{intro?.etiquetaFase ?? 'INTRO'}</span>
        <h1 className="si-titulo">{simulacion.titulo}</h1>
        <div className="si-subtitulo">{simulacion.etiqueta}</div>
      </header>

      <div className="si-cuerpo">
        <div className="si-escena-col">
          <div className="si-escena">
            {simulacion.id === 'pedido-fantasma' ? (
              <EscenaKawsay metricas={intro?.metricas} alerta />
            ) : (
              <div className="si-escena-generica">
                <span className="si-escena-generica-tag">{simulacion.etiqueta}</span>
                <p>{simulacion.descripcion}</p>
              </div>
            )}

            {actual && (
              <div className="si-dialogo">
                <div className="si-dialogo-retrato">
                  <RetratoValeria estado={actual.estado ?? 'idle'} />
                </div>
                <div className="si-dialogo-cuerpo">
                  <div className="si-dialogo-quien">
                    <strong>{actual.hablante}</strong>
                    <span>{actual.rol}</span>
                  </div>
                  <p className="si-dialogo-texto" key={linea}>
                    {actual.texto}
                  </p>
                </div>
                {!esUltima && (
                  <button
                    type="button"
                    className="si-dialogo-siguiente"
                    onClick={() => setLinea((n) => Math.min(n + 1, dialogo.length - 1))}
                    aria-label="Siguiente línea de diálogo"
                  >
                    ▼
                  </button>
                )}
              </div>
            )}
          </div>

          {esUltima && intro?.misionTexto && (
            <div className="si-mision">
              <div className="si-mision-rotulo">{intro.misionTitulo ?? 'TU MISIÓN'}</div>
              <p>{intro.misionTexto}</p>
            </div>
          )}

          <div className="si-acciones">
            <button
              type="button"
              className="si-boton-principal"
              onClick={() => navegar(`/simulaciones/${simulacion.slug}/jugar`)}
            >
              ▶ ACEPTAR MISIÓN
            </button>
            <a className="si-boton-secundario" href="#detalles">
              📄 VER DETALLES
            </a>
          </div>

          {intro?.consejo && (
            <div className="si-consejo">
              <span className="si-consejo-icono" aria-hidden="true">
                {'>_'}
              </span>
              <div>
                <div className="si-consejo-titulo">Consejo de campo</div>
                <p>{intro.consejo}</p>
              </div>
            </div>
          )}
        </div>

        <aside className="si-lateral" aria-label="Datos de la simulación">
          <Panel icono="🎯" titulo="OBJETIVO">
            <p className="si-panel-texto">{intro?.objetivo ?? simulacion.resumen}</p>
          </Panel>

          <Panel icono="📶" titulo="DIFICULTAD">
            <p className="si-panel-texto">{simulacion.dificultad}</p>
            <BarraDificultad nivel={simulacion.dificultadNivel} />
          </Panel>

          <Panel icono="⭐" titulo="RECOMPENSA">
            <p className="si-panel-valor">+{simulacion.recompensaXp} XP</p>
            <p className="si-panel-nota">Puntos de experiencia dentro de la simulación.</p>
          </Panel>

          <Panel icono="⏱" titulo="DURACIÓN">
            <p className="si-panel-texto">{simulacion.duracionLabel}</p>
            <p className="si-panel-nota">Sin reloj en pantalla: avanzas a tu ritmo.</p>
          </Panel>

          <Panel icono="{ }" titulo="TECNOLOGÍAS CLAVE">
            <ul className="si-panel-lista">
              {simulacion.tecnologias.map((tecnologia) => (
                <li key={tecnologia}>{tecnologia}</li>
              ))}
            </ul>
          </Panel>

          {carreras.length > 0 && (
            <Panel icono="🎓" titulo="CARRERA RELACIONADA">
              {carreras.map((carrera) => (
                <Enlace key={carrera.id} to={`/carreras/${carrera.slug}`} className="si-panel-enlace">
                  {carrera.nombre} →
                </Enlace>
              ))}
            </Panel>
          )}
        </aside>
      </div>

      {etapas.length > 0 && (
        <ol className="si-etapas" aria-label="Etapas de la simulación">
          {etapas.map((etapa, i) => (
            <li key={etapa} className={i === 0 ? 'activa' : ''}>
              <span className="si-etapa-num">{i + 1}</span>
              <span className="si-etapa-nombre">{etapa}</span>
            </li>
          ))}
        </ol>
      )}

      <section id="detalles" className="si-detalles">
        <h2>Sobre esta simulación</h2>
        <p>{simulacion.descripcion}</p>
        <div className="si-detalles-chips">
          <span className="pf-etiqueta gratis">GRATIS</span>
          <span className="pf-etiqueta">⏱ {simulacion.duracionLabel}</span>
          <span className="pf-etiqueta">Sin cuenta</span>
        </div>
        <h3>Lo que vas a usar sin darte cuenta</h3>
        <div className="pf-chips">
          {simulacion.conceptos.map((concepto) => (
            <span className="pf-chip-dato" key={concepto}>
              {concepto}
            </span>
          ))}
        </div>
        <p className="si-detalles-nota">
          El puntaje de esta simulación mide cómo resolviste este reto concreto. No determina si una
          carrera es o no adecuada para ti.
        </p>
      </section>
    </div>
  );
}
