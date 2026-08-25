import { useEffect, useRef, useState } from 'react';
import { Enlace } from '../../../app/router/Router';
import { useGame } from '../../../engine/useGame';
import { desglosePorFase, puntajeMaximoEscenario } from '../../../engine/gameEngine';
import { registrarOpinion, registrarSimulacion } from '../../exploration/almacen';
import { useExploracion } from '../../exploration/useExploracion';
import { cursoPorId, formatearPrecio } from '../../learning/data/cursos';
import { carreraPorId } from '../../careers/normalizar';
import RetratoValeria from '../ui/RetratoValeria';
import '../../../styles/resultado-simulacion.css';

// Cierre de una simulación en modo libre (§40–§45).
//
// Es una pantalla DISTINTA a `screens/Resultado.jsx`, que sigue siendo la del
// evento (ranking por colegio, siguiente misión de la jornada). Acá no hay
// ranking ni colegio: hay un final, un puntaje explicado, una separación
// explícita entre puntaje e interés vocacional, y una salida hacia la carrera
// o hacia un microcurso.

const TONO_CLASE = { ok: 'ok', aviso: 'aviso', error: 'error' };

export default function ResultadoSimulacion({ simulacion, onReintentar }) {
  const { state } = useGame();
  const { escenario, resultado } = state;
  const exploracion = useExploracion();
  const guardadoRef = useRef(false);
  const [opinionEnviada, setOpinionEnviada] = useState(null);

  const maximo = puntajeMaximoEscenario(escenario);
  const desglose = desglosePorFase(escenario, state.respuestas);
  const epilogo = resultado.epilogo;
  const presentacion = escenario.presentacion ?? {};
  const reflexion = presentacion.reflexion;
  const conceptos = presentacion.conceptos;
  const curso = simulacion?.cursoRelacionadoId ? cursoPorId(simulacion.cursoRelacionadoId) : null;
  const carrera = simulacion?.carreraIds?.[0] ? carreraPorId(simulacion.carreraIds[0]) : null;
  const opinionPrevia = exploracion.opiniones[simulacion?.id]?.valor ?? null;

  useEffect(() => {
    if (guardadoRef.current || !simulacion) return;
    guardadoRef.current = true;
    // El puntaje se guarda como historial de la exploración, NO como señal
    // vocacional. La señal vocacional es la opinión de más abajo, y se guarda
    // aparte (§43).
    registrarSimulacion(simulacion.id, {
      puntaje: resultado.total,
      maximo: 1000,
      perfil: resultado.perfil?.nombre ?? null,
    });
  }, [simulacion, resultado]);

  function opinar(valor) {
    registrarOpinion(simulacion.id, valor);
    setOpinionEnviada(valor);
  }

  const opinionActiva = opinionEnviada ?? opinionPrevia;

  return (
    <div className="rs">
      <div className={`rs-final ${epilogo.clave ?? 'excelente'}`}>
        <div className="rs-final-retrato">
          <RetratoValeria estado={epilogo.estadoValeria ?? 'feliz'} />
        </div>
        <div className="rs-final-texto">
          <div className="rs-final-rotulo">FINAL</div>
          <h1>{epilogo.titulo ?? 'SIMULACIÓN COMPLETADA'}</h1>
          <p>{epilogo.texto}</p>
        </div>
      </div>

      {epilogo.metricas?.length > 0 && (
        <div className="rs-metricas">
          {epilogo.metricas.map((metrica) => (
            <div className={`rs-metrica ${TONO_CLASE[metrica.tono] ?? ''}`} key={metrica.etiqueta}>
              <div className="valor">{metrica.valor}</div>
              <div className="etiqueta">{metrica.etiqueta}</div>
            </div>
          ))}
        </div>
      )}

      {epilogo.mensaje && (
        <blockquote className="rs-cita">
          <p>{epilogo.mensaje}</p>
          <footer>— {escenario.cliente.nombre}, {escenario.cliente.rol}</footer>
        </blockquote>
      )}

      {/* --- Puntaje ------------------------------------------------------ */}
      <section className="rs-bloque">
        <h2>Tu desempeño en esta simulación</h2>
        <div className="rs-puntaje">
          <div className="rs-puntaje-total">
            <span className="numero">{resultado.total}</span>
            <span className="sobre">/ 1000</span>
          </div>
          <div className="rs-desglose">
            {desglose.map((fila) => (
              <div className="rs-fila" key={fila.id}>
                <span className="rs-fila-nombre">{fila.etiqueta}</span>
                <span className="rs-fila-barra">
                  <span
                    style={{ width: `${fila.maximo ? (fila.puntaje / fila.maximo) * 100 : 0}%` }}
                  />
                </span>
                <span className="rs-fila-valor">{fila.puntaje}</span>
              </div>
            ))}
            {resultado.penalizaciones > 0 && (
              <div className="rs-fila rs-fila-resta">
                <span className="rs-fila-nombre">Pistas usadas</span>
                <span className="rs-fila-barra" />
                <span className="rs-fila-valor">−{resultado.penalizaciones}</span>
              </div>
            )}
          </div>
        </div>
        <p className="rs-aclaracion">
          {presentacion.mensajeFinal ??
            'Tu puntuación refleja cómo resolviste esta simulación. No determina si una carrera es o no adecuada para ti.'}
        </p>
        <p className="rs-nota-max">Puntaje máximo de los retos de esta simulación: {maximo}.</p>
      </section>

      {resultado.perfil && (
        <section className="rs-bloque rs-perfil">
          <div className="rs-perfil-rotulo">TU FORMA DE RESOLVER</div>
          <div className="rs-perfil-nombre">{resultado.perfil.nombre}</div>
          <p>{resultado.perfil.descripcion}</p>
          <p className="rs-perfil-nota">
            Es un apodo divertido según cómo jugaste esta simulación, no un diagnóstico.
          </p>
        </section>
      )}

      {/* --- Reflexión vocacional ---------------------------------------- */}
      {reflexion && (
        <section className="rs-bloque rs-reflexion">
          <h2>{reflexion.pregunta}</h2>
          <div className="rs-opiniones">
            {reflexion.opciones.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                className={`rs-opinion${opinionActiva === opcion.id ? ' on' : ''}`}
                aria-pressed={opinionActiva === opcion.id}
                onClick={() => opinar(opcion.id)}
              >
                <span className="emoji" aria-hidden="true">
                  {opcion.emoji}
                </span>
                {opcion.texto}
              </button>
            ))}
          </div>
          {opinionActiva && (
            <p className="rs-opinion-guardada" role="status">
              Guardado en tu exploración. Puedes cambiarlo cuando quieras.
            </p>
          )}
          <p className="rs-aclaracion">{reflexion.aclaracion}</p>
        </section>
      )}

      {/* --- Conceptos ---------------------------------------------------- */}
      {conceptos && (
        <section className="rs-bloque">
          <h2>{conceptos.titulo}</h2>
          <ul className="rs-conceptos">
            {conceptos.lista.map((concepto) => (
              <li key={concepto.nombre}>
                <strong>{concepto.nombre}</strong>
                <span>{concepto.detalle}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --- Microcurso --------------------------------------------------- */}
      {curso && (
        <section className="rs-bloque rs-curso">
          <h2>¿Quieres entender mejor lo que acabas de hacer?</h2>
          <div className="rs-curso-card">
            <div>
              <div className="rs-curso-etiqueta">{curso.subtitulo}</div>
              <div className="rs-curso-titulo">{curso.titulo}</div>
              <p>{curso.descripcion}</p>
              <div className="rs-curso-datos">
                <span className="pf-etiqueta">⏱ {curso.duracionLabel}</span>
                <span className="pf-etiqueta">{curso.nivel}</span>
                <span className="rs-curso-precio">{formatearPrecio(curso)}</span>
              </div>
            </div>
            <div className="rs-curso-acciones">
              <Enlace to={`/aprender/${curso.slug}`} className="pf-boton">
                Ver microcurso
              </Enlace>
              <Enlace to="/mi-exploracion" className="pf-boton fantasma">
                Ahora no
              </Enlace>
            </div>
          </div>
          <p className="rs-aclaracion">
            La simulación que acabas de jugar es y seguirá siendo gratuita.
          </p>
        </section>
      )}

      {/* --- Salidas ------------------------------------------------------ */}
      <section className="rs-salidas">
        <button type="button" className="pf-boton secundario" onClick={onReintentar}>
          ↺ {epilogo.textoBoton ?? 'Volver a intentarlo'}
        </button>
        {carrera && (
          <Enlace to={`/carreras/${carrera.slug}`} className="pf-boton secundario">
            Ver {carrera.nombre}
          </Enlace>
        )}
        <Enlace to="/mi-exploracion" className="pf-boton">
          Ir a mi exploración
        </Enlace>
      </section>
    </div>
  );
}
