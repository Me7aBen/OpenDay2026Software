import { useEffect } from 'react';
import { Enlace } from '../../../app/router/Router';
import { aplicarMeta } from '../../../app/seo';
import { SIMULACIONES } from '../catalogo';
import { carreraPorId } from '../../careers/normalizar';
import { useExploracion } from '../../exploration/useExploracion';

// Catálogo de simulaciones (§9).
//
// Importante: acá NO hay bloqueos. En el evento las misiones se jugaban en
// secuencia obligatoria; en la plataforma un estudiante entra a la que quiera,
// en el orden que quiera (§5). Esa regla vive en `engine/misiones.js`, que
// ahora recibe `secuencial: false` para este contexto.
export default function SimulacionesPage() {
  const exploracion = useExploracion();

  useEffect(() => {
    aplicarMeta({
      titulo: 'Simulaciones gratuitas de profesiones',
      descripcion:
        'Experimenta cómo es trabajar en una profesión resolviendo un problema real. Simulaciones gratuitas, sin cuenta.',
      ruta: '/simulaciones',
    });
  }, []);

  return (
    <>
      <div className="pf-hero" style={{ paddingBottom: 12 }}>
        <h1>Prueba una profesión</h1>
        <p>
          Cada simulación es un problema real de esa carrera. Las juegas gratis, sin crear cuenta y
          en el orden que quieras.
        </p>
      </div>

      <div className="pf-grid-carreras">
        {SIMULACIONES.map((simulacion) => {
          const carrera = simulacion.carreraIds?.[0] ? carreraPorId(simulacion.carreraIds[0]) : null;
          const jugada = exploracion.simulaciones[simulacion.id];
          return (
            <article className="pf-sim-card" key={simulacion.id}>
              <div className="cuerpo">
                <span className="etiqueta">{simulacion.etiqueta}</span>
                <h3>{simulacion.titulo}</h3>
                <p className="resumen">{simulacion.resumen}</p>
                <div className="datos">
                  <span className="pf-etiqueta">⏱ {simulacion.duracionLabel}</span>
                  <span className="pf-etiqueta gratis">GRATIS</span>
                  {jugada && (
                    <span className="pf-etiqueta gratis">✓ {jugada.puntaje} pts</span>
                  )}
                </div>
                {carrera && (
                  <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                    Relacionada con <strong>{carrera.nombre}</strong>
                  </div>
                )}
                <Enlace to={`/simulaciones/${simulacion.slug}`} className="pf-boton ancho">
                  {jugada ? 'Volver a jugar' : '▶ Iniciar simulación'}
                </Enlace>
              </div>
            </article>
          );
        })}
      </div>

      <div className="pf-card" style={{ marginTop: 28 }}>
        <h2 className="pf-seccion-titulo">Estamos construyendo más</h2>
        <p className="pf-seccion-sub" style={{ margin: 0 }}>
          Queremos que cada área tenga al menos una simulación: salud, negocios, diseño, derecho.
          Preferimos publicar pocas y buenas antes que muchas y vacías.
        </p>
      </div>
    </>
  );
}
