import { useEffect } from 'react';
import { Enlace } from '../../../app/router/Router';
import { aplicarMeta } from '../../../app/seo';
import { useExploracion } from '../useExploracion';
import { alternarCarreraGuardada } from '../almacen';
import { carreraPorId, listarCarreras } from '../../careers/normalizar';
import { SIMULACIONES, simulacionPorId } from '../../simulations/catalogo';
import { CURSOS, cursoPorId } from '../../learning/data/cursos';

// "Mi exploración" (§49) y el pasaporte (§50).
//
// El pasaporte NO es una entidad nueva: se DERIVA de lo que ya hay —qué
// simulaciones jugó, qué carreras guardó, qué cursos miró— agrupado por
// carrera. Por eso no hay tabla ni modelo de pasaporte en ninguna parte.

function construirPasaporte(exploracion) {
  const porCarrera = new Map();

  function asegurar(carreraId) {
    if (!porCarrera.has(carreraId)) {
      porCarrera.set(carreraId, { carreraId, simulaciones: [], guardada: false, cursos: [] });
    }
    return porCarrera.get(carreraId);
  }

  exploracion.carrerasGuardadas.forEach((id) => {
    asegurar(id).guardada = true;
  });

  Object.keys(exploracion.simulaciones).forEach((simulacionId) => {
    const simulacion = simulacionPorId(simulacionId);
    (simulacion?.carreraIds ?? []).forEach((carreraId) => {
      asegurar(carreraId).simulaciones.push({
        simulacion,
        datos: exploracion.simulaciones[simulacionId],
      });
    });
  });

  Object.keys(exploracion.cursos).forEach((cursoId) => {
    const curso = cursoPorId(cursoId);
    (curso?.carreraIds ?? []).forEach((carreraId) => {
      asegurar(carreraId).cursos.push(curso);
    });
  });

  return [...porCarrera.values()]
    .map((entrada) => ({ ...entrada, carrera: carreraPorId(entrada.carreraId) }))
    .filter((entrada) => entrada.carrera);
}

export default function MiExploracionPage() {
  const exploracion = useExploracion();
  const pasaporte = construirPasaporte(exploracion);
  const guardadas = exploracion.carrerasGuardadas.map(carreraPorId).filter(Boolean);
  const jugadas = Object.entries(exploracion.simulaciones);
  const vacio = pasaporte.length === 0 && jugadas.length === 0;

  useEffect(() => {
    aplicarMeta({
      titulo: 'Mi exploración',
      descripcion: 'Tus carreras guardadas, las simulaciones que jugaste y lo que opinaste de cada una.',
      ruta: '/mi-exploracion',
    });
  }, []);

  return (
    <>
      <div className="pf-hero" style={{ paddingBottom: 12 }}>
        <h1>Mi exploración</h1>
        <p>
          Todo esto se guarda solo en este dispositivo. Todavía no hay cuentas: cuando las haya,
          podrás sincronizarlo.
        </p>
      </div>

      {vacio ? (
        <div className="pf-vacio">
          <p style={{ marginBottom: 20 }}>
            Aún no tienes nada guardado. Empieza explorando una carrera o jugando una simulación.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Enlace to="/carreras" className="pf-boton">
              Explorar carreras
            </Enlace>
            <Enlace to="/simulaciones" className="pf-boton secundario">
              Ver simulaciones
            </Enlace>
          </div>
        </div>
      ) : (
        <>
          {pasaporte.length > 0 && (
            <section className="pf-seccion">
              <h2 className="pf-seccion-titulo">Tu recorrido</h2>
              <p className="pf-seccion-sub">Lo que llevas hecho en cada carrera.</p>
              <div className="pf-grid-carreras">
                {pasaporte.map((entrada) => (
                  <div className="pf-pasaporte" key={entrada.carreraId}>
                    <h3>{entrada.carrera.nombre}</h3>
                    <div className="pf-pasaporte-lineas">
                      {entrada.simulaciones.map(({ simulacion, datos }) => (
                        <span key={simulacion.id}>
                          <span aria-hidden="true">✓</span>
                          {simulacion.titulo} · {datos.puntaje} pts
                          {exploracion.opiniones[simulacion.id] && (
                            <em style={{ color: 'var(--text-dim)' }}>
                              (
                              {
                                {
                                  'me-encanto': 'me gustó mucho',
                                  'me-intereso': 'me interesó',
                                  'no-seguro': 'no estoy seguro',
                                  'no-para-mi': 'no fue para mí',
                                }[exploracion.opiniones[simulacion.id].valor]
                              }
                              )
                            </em>
                          )}
                        </span>
                      ))}
                      {entrada.guardada && (
                        <span>
                          <span aria-hidden="true">♥</span> Carrera guardada
                        </span>
                      )}
                      {entrada.cursos.length > 0 && (
                        <span>
                          <span aria-hidden="true">📘</span> {entrada.cursos.length} microcurso
                          {entrada.cursos.length === 1 ? '' : 's'} explorado
                          {entrada.cursos.length === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                    <Enlace to={`/carreras/${entrada.carrera.slug}`} className="pf-boton secundario">
                      Ver la carrera
                    </Enlace>
                  </div>
                ))}
              </div>
            </section>
          )}

          {guardadas.length > 0 && (
            <section className="pf-seccion">
              <h2 className="pf-seccion-titulo">Carreras guardadas</h2>
              <div className="pf-grid-carreras">
                {guardadas.map((carrera) => (
                  <div className="pf-card" key={carrera.id}>
                    <div style={{ fontSize: 12, color: carrera.areaInfo?.color }}>
                      {carrera.areaInfo?.emoji} {carrera.areaInfo?.nombre}
                    </div>
                    <h3 style={{ margin: '4px 0 8px', fontSize: 17 }}>{carrera.nombre}</h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Enlace to={`/carreras/${carrera.slug}`} className="pf-boton secundario">
                        Ver ficha
                      </Enlace>
                      <button
                        type="button"
                        className="pf-icono-boton on"
                        aria-label={`Quitar ${carrera.nombre} de guardadas`}
                        onClick={() => alternarCarreraGuardada(carrera.id)}
                      >
                        ♥
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {jugadas.length > 0 && (
            <section className="pf-seccion">
              <h2 className="pf-seccion-titulo">Simulaciones realizadas</h2>
              <div className="pf-grid-carreras">
                {jugadas.map(([id, datos]) => {
                  const simulacion = simulacionPorId(id);
                  if (!simulacion) return null;
                  return (
                    <div className="pf-card" key={id}>
                      <div style={{ fontSize: 12, color: 'var(--cyan)' }}>{simulacion.etiqueta}</div>
                      <h3 style={{ margin: '4px 0 8px', fontSize: 17 }}>{simulacion.titulo}</h3>
                      <div className="pf-chips" style={{ marginBottom: 10 }}>
                        <span className="pf-chip-dato">Mejor puntaje: {datos.puntaje}</span>
                        {datos.perfil && <span className="pf-chip-dato">{datos.perfil}</span>}
                        <span className="pf-chip-dato">
                          {datos.veces} {datos.veces === 1 ? 'intento' : 'intentos'}
                        </span>
                      </div>
                      <Enlace to={`/simulaciones/${simulacion.slug}`} className="pf-boton secundario">
                        Volver a jugar
                      </Enlace>
                    </div>
                  );
                })}
              </div>
              <p className="pf-aviso" style={{ marginTop: 12 }}>
                El puntaje mide cómo resolviste ese reto concreto. No mide si una carrera es
                adecuada para ti.
              </p>
            </section>
          )}
        </>
      )}

      <section className="pf-seccion">
        <h2 className="pf-seccion-titulo">Sigue explorando</h2>
        <div className="pf-grid-carreras">
          {listarCarreras()
            .filter((c) => !exploracion.carrerasGuardadas.includes(c.id))
            .slice(0, 3)
            .map((carrera) => (
              <div className="pf-card" key={carrera.id}>
                <div style={{ fontSize: 12, color: carrera.areaInfo?.color }}>
                  {carrera.areaInfo?.emoji} {carrera.areaInfo?.nombre}
                </div>
                <h3 style={{ margin: '4px 0 8px', fontSize: 17 }}>{carrera.nombre}</h3>
                <Enlace to={`/carreras/${carrera.slug}`} className="pf-boton secundario">
                  Explorar
                </Enlace>
              </div>
            ))}
        </div>
      </section>

      {SIMULACIONES.length > 0 && CURSOS.length > 0 && (
        <p className="pf-seccion-sub" style={{ marginTop: 24 }}>
          ¿Quieres borrar esto? Se guarda en el navegador de este dispositivo; limpiar los datos del
          sitio lo elimina por completo.
        </p>
      )}
    </>
  );
}
