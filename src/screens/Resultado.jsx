import { useEffect, useRef, useState } from 'react';
import { useGame } from '../engine/useGame';
import { guardarPartida, obtenerTop } from '../lib/leaderboard';
import { limpiarPartida } from '../lib/storage';
import TopBar from '../ui/TopBar';
import Avatar from '../ui/Avatar';
import EscenaFondo from '../ui/EscenaFondo';
import HistorietaPixel from '../ui/HistorietaPixel';
import RetratoCliente from '../ui/RetratoCliente';
import '../styles/resultado.css';

export default function Resultado() {
  const { state, reiniciar } = useGame();
  const { escenario, jugador, resultado, indicadorValor } = state;
  const presentacion = escenario.presentacion ?? {};
  const hayHistorietaEpilogo = !!presentacion.historietaEpilogo?.length;
  const mostrarDuo = !!jugador.avatar && !hayHistorietaEpilogo;
  const guardadoRef = useRef(false);
  const [top, setTop] = useState([]);

  useEffect(() => {
    if (guardadoRef.current) return;
    guardadoRef.current = true;
    // El avatar NO viaja al leaderboard a propósito: el ranking es una lista
    // pública de nombre, colegio y puntaje, y no tiene por qué guardar cómo se
    // vistió cada jugador. La forma de esta llamada no cambió.
    guardarPartida({
      nombre: jugador.nombre,
      colegio: jugador.colegio,
      escenario: escenario.id,
      puntaje: resultado.total,
      tiempoSeg: resultado.tiempoUsadoSeg,
    });
    limpiarPartida();
    setTop(obtenerTop(5));
  }, [escenario.id, jugador, resultado]);

  function jugarDeNuevo() {
    reiniciar();
  }

  return (
    <div className="resultado">
      <TopBar />

      <div className="resultado-cuerpo">
        <div className="resultado-columna">
          {/* Cierre ilustrado. Si el escenario trae historieta de epílogo, se
              muestra la tira; si solo trae escena, la franja de ciudad; si no
              trae ninguna de las dos (Ccorca), no se renderiza nada. */}
          {hayHistorietaEpilogo ? (
            <div className="panel resultado-historieta">
              <HistorietaPixel paneles={presentacion.historietaEpilogo} avatar={jugador.avatar} revelarTodo />
            </div>
          ) : (
            presentacion.escena && (
              <div className="panel resultado-escena">
                <EscenaFondo tipo={presentacion.escena} progreso={indicadorValor} />
              </div>
            )
          )}

          <div className="resultado-epilogo">
            <div className="label-pixel rotulo">MISIÓN COMPLETADA</div>
            <div className="texto">"{resultado.epilogo.texto}"</div>
            {resultado.epilogo.mensaje && (
              <div className="resultado-epilogo-mensaje">{resultado.epilogo.mensaje}</div>
            )}
          </div>

          {/* Fila de cierre: el personaje junto a su guía, y el perfil
              vocacional. Las dos mitades son opcionales e independientes, así
              que Ccorca (que no tiene ninguna) no agrega esta fila.

              El dúo se omite cuando hay historieta de epílogo: su última viñeta
              ya muestra al jugador junto a su guía, y repetirlo empujaba el
              puntaje fuera de la pantalla. */}
          {mostrarDuo && (
            <div className="panel resultado-duo">
              <div className="resultado-duo-figura">
                <Avatar avatar={jugador.avatar} tam={64} titulo={`Personaje de ${jugador.nombre}`} />
                <span className="nombre">{jugador.nombre}</span>
              </div>
              {escenario.cliente.retrato && (
                <div className="resultado-duo-figura">
                  <div className="retrato">
                    <RetratoCliente tipo={escenario.cliente.retrato} estado="feliz" />
                  </div>
                  <span className="nombre">{escenario.cliente.nombre}</span>
                </div>
              )}
            </div>
          )}

          {/* Puntaje y perfil comparten fila. El perfil es null salvo que el
              escenario declare `presentacion.perfiles`, y entonces el desglose
              ocupa el ancho completo, que es lo que ve Ccorca. */}
          <div className="resultado-cierre">
            <div className="panel resultado-desglose">
              <div className="resultado-puntaje">
                <div className="total">{resultado.total}</div>
                <div className="sobre">/ 1000</div>
              </div>
              <div className="resultado-lista">
                <div className="fila"><span>Decisiones</span><span style={{ color: 'var(--text)' }}>{resultado.puntajeDecisiones}</span></div>
                <div className="fila"><span>Bonos especiales</span><span style={{ color: 'var(--pink)' }}>+{resultado.puntajeBonos}</span></div>
                <div className="fila"><span>Bono de tiempo</span><span style={{ color: 'var(--cyan)' }}>+{resultado.bonoTiempo}</span></div>
                <div className="fila"><span>Pistas usadas</span><span style={{ color: 'var(--text-dim)' }}>-{resultado.penalizaciones}</span></div>
              </div>
            </div>

            {resultado.perfil && (
              <div className="panel resultado-perfil">
                <div className="label-pixel">TU PERFIL</div>
                <div className="nombre">{resultado.perfil.nombre}</div>
                <div className="descripcion">{resultado.perfil.descripcion}</div>
              </div>
            )}
          </div>

          {presentacion.mensajeFinal && (
            <div className="resultado-mensaje-final">{presentacion.mensajeFinal}</div>
          )}

          <button type="button" className="btn-primary btn-pixel" style={{ justifyContent: 'center' }} onClick={jugarDeNuevo}>
            JUGAR DE NUEVO
          </button>
        </div>

        <div className="panel resultado-ranking">
          <div className="label-pixel" style={{ marginBottom: 6 }}>RANKING · ESTA SESIÓN</div>
          {top.map((fila, i) => (
            <div className={`resultado-fila-ranking${i === 0 ? ' propia' : ''}`} key={i}>
              <div className="puesto">{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div className="nombre">{fila.nombre}</div>
                <div className="colegio">{fila.colegio}</div>
              </div>
              <div className="puntos" style={{ color: i === 0 ? 'var(--gold)' : 'var(--text)' }}>{fila.puntaje}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="resultado-footer">
        <span>TECSUP · Formación que transforma</span>
        <span>Diseño y Desarrollo de Software · Centro de Innovación Tecnológica</span>
      </div>
    </div>
  );
}
