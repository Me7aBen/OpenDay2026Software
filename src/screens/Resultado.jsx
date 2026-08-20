import { useEffect, useRef, useState } from 'react';
import { useGame } from '../engine/useGame';
import { guardarPartida, obtenerTop } from '../lib/leaderboard';
import { limpiarPartida } from '../lib/storage';
import TopBar from '../ui/TopBar';
import '../styles/resultado.css';

export default function Resultado() {
  const { state, reiniciar } = useGame();
  const { escenario, jugador, resultado } = state;
  const guardadoRef = useRef(false);
  const [top, setTop] = useState([]);

  useEffect(() => {
    if (guardadoRef.current) return;
    guardadoRef.current = true;
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
          <div className="resultado-epilogo">
            <div className="label-pixel rotulo">MISIÓN COMPLETADA</div>
            <div className="texto">"{resultado.epilogo.texto}"</div>
          </div>

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
