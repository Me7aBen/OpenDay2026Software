import { useEffect } from 'react';
import { Enlace } from '../../../app/router/Router';
import { aplicarMeta } from '../../../app/seo';
import { useExploracion } from '../../exploration/useExploracion';
import { alternarComparar, limpiarComparador, MAX_COMPARAR } from '../../exploration/almacen';
import { carreraPorId, listarCarreras } from '../../careers/normalizar';

// Comparador de carreras (§51). Primera versión, deliberadamente simple:
// hasta 3 carreras, lado a lado, con lo que SÍ sabemos. No hay salarios porque
// no tenemos fuente confiable y el brief lo prohíbe explícitamente.

const FILAS = [
  { id: 'area', rotulo: 'Área', valor: (c) => `${c.areaInfo?.emoji} ${c.areaInfo?.nombre}` },
  { id: 'duracion', rotulo: 'Duración', valor: (c) => c.duracionLabel },
  { id: 'resumen', rotulo: 'De qué trata', valor: (c) => c.descripcionCorta },
  { id: 'bases', rotulo: 'Qué estudias al inicio', lista: (c) => c.cursosBase },
  { id: 'avanzado', rotulo: 'Más adelante', lista: (c) => c.cursosAvanzados },
  { id: 'trabajo', rotulo: 'Campo laboral', lista: (c) => c.campoLaboral },
  { id: 'actividades', rotulo: 'Tipo de actividades', lista: (c) => c.tipoDeActividades },
  {
    id: 'simulaciones',
    rotulo: 'Simulaciones',
    lista: (c) => (c.simulaciones.length ? c.simulaciones.map((s) => s.titulo) : ['Todavía no hay']),
  },
];

export default function CompararPage() {
  const exploracion = useExploracion();
  const seleccionadas = exploracion.comparador.map(carreraPorId).filter(Boolean);
  const disponibles = listarCarreras().filter((c) => !exploracion.comparador.includes(c.id));

  useEffect(() => {
    aplicarMeta({
      titulo: 'Comparar carreras',
      descripcion: 'Pon hasta tres carreras lado a lado y compáralas antes de decidir.',
      ruta: '/comparar',
    });
  }, []);

  return (
    <>
      <div className="pf-hero" style={{ paddingBottom: 12 }}>
        <h1>Comparar carreras</h1>
        <p>Elige hasta {MAX_COMPARAR} carreras y míralas lado a lado.</p>
      </div>

      <div className="pf-filtros" role="group" aria-label="Agregar carreras a comparar">
        {seleccionadas.map((carrera) => (
          <button
            key={carrera.id}
            type="button"
            className="pf-filtro on"
            onClick={() => alternarComparar(carrera.id)}
          >
            ✕ {carrera.nombre}
          </button>
        ))}
        {seleccionadas.length < MAX_COMPARAR &&
          disponibles.slice(0, 8).map((carrera) => (
            <button
              key={carrera.id}
              type="button"
              className="pf-filtro"
              onClick={() => alternarComparar(carrera.id)}
            >
              + {carrera.nombre}
            </button>
          ))}
      </div>

      {seleccionadas.length === 0 ? (
        <div className="pf-vacio">
          <p style={{ marginBottom: 20 }}>
            Todavía no elegiste ninguna carrera. Agrégalas desde los botones de arriba o desde la
            ficha de cada carrera.
          </p>
          <Enlace to="/carreras" className="pf-boton">
            Explorar carreras
          </Enlace>
        </div>
      ) : (
        <>
          <div className="pf-comparador-scroll">
            <div
              className="pf-comparador"
              style={{ minWidth: seleccionadas.length > 1 ? 560 : 'auto' }}
            >
              <div
                className="pf-comparador-fila"
                style={{
                  gridTemplateColumns: `repeat(${seleccionadas.length}, minmax(200px, 1fr))`,
                }}
              >
                {seleccionadas.map((carrera) => (
                  <div className="pf-comparador-celda" key={carrera.id}>
                    <strong style={{ fontSize: 16 }}>{carrera.nombre}</strong>
                    <div style={{ marginTop: 8 }}>
                      <Enlace to={`/carreras/${carrera.slug}`} className="pf-boton secundario">
                        Ver ficha
                      </Enlace>
                    </div>
                  </div>
                ))}
              </div>

              {FILAS.map((fila) => (
                <div key={fila.id}>
                  <div className="pf-comparador-rotulo">{fila.rotulo}</div>
                  <div
                    className="pf-comparador-fila"
                    style={{
                      gridTemplateColumns: `repeat(${seleccionadas.length}, minmax(200px, 1fr))`,
                    }}
                  >
                    {seleccionadas.map((carrera) => (
                      <div className="pf-comparador-celda" key={carrera.id}>
                        {fila.lista ? (
                          <ul>
                            {fila.lista(carrera).map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          fila.valor(carrera)
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="pf-boton fantasma" onClick={limpiarComparador}>
              Vaciar comparación
            </button>
          </div>

          <p className="pf-aviso" style={{ marginTop: 20 }}>
            No mostramos sueldos ni rankings de universidades: no tenemos una fuente que podamos
            respaldar. Preferimos no publicar un número antes que publicar uno inventado.
          </p>
        </>
      )}
    </>
  );
}
