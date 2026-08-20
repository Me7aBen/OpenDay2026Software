import { useEffect, useRef, useState } from 'react';
import { useGame } from '../engine/useGame';
import { minijuegoPorTipo } from '../minigames';
import TopBar from '../ui/TopBar';
import ClienteFlotante from '../ui/ClienteFlotante';
import EscenaFondo from '../ui/EscenaFondo';
import IndicadorGlobal from '../ui/IndicadorGlobal';
import HistorietaPixel from '../ui/HistorietaPixel';
import { calcularEstadoActualDecision } from '../ui/estadosCliente';
import { PENALIZACION_PISTA } from '../engine/gameEngine';
import '../styles/hud.css';

const ORDEN_FASES = ['descubrir', 'disenar', 'construir', 'probar', 'desplegar'];

const NOMBRES_FASE = {
  descubrir: 'DESCUBRIR',
  disenar: 'DISEÑAR',
  construir: 'CONSTRUIR',
  probar: 'PROBAR',
  desplegar: 'DESPLEGAR',
};

const ICONOS_FASE = {
  descubrir: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
    </svg>
  ),
  disenar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="6" y="3" width="12" height="18" rx="2" /><path d="M10 18h4" />
    </svg>
  ),
  construir: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m8 6-6 6 6 6M16 6l6 6-6 6" />
    </svg>
  ),
  probar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 4h8M9 4v3M15 4v3M9 7a5 5 0 0 0-5 5v3a5 5 0 0 0 10 0v-3a5 5 0 0 0-5-5Z" /><path d="M4 12H2M22 12h-2M4 16l-2 2M20 16l2 2" />
    </svg>
  ),
  desplegar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 15c-3-3-2-8 2-11 3 3 8 4 11-2 3 4 2 9-2 11l-3 3-6-1-2-1Z" /><circle cx="12" cy="9" r="2" />
    </svg>
  ),
};

function formatearTiempo(seg) {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function Sidebar({ fase, faseIndex, totalFases, decisionesResueltas, totalDecisionesFase, tiempoGlobalRestante, puntajeAcumulado, cliente, onAbandonar }) {
  return (
    <div className="hud-sidebar">
      {/* Acá había un bloque de marca ("MISIÓN DEPLOY" + subtítulo) que repetía
          el wordmark que la TopBar ya muestra permanentemente unos centímetros
          más arriba. Costaba 79px del sidebar, que a 1366x768 son justo los que
          necesita el mensaje del cliente para no quedar cortado. */}
      <div className="panel hud-fase-card">
        <div className="rotulo label-pixel">FASE ACTUAL <span style={{ color: 'var(--cyan)' }}>{faseIndex + 1}/{totalFases}</span></div>
        <div className="encabezado">
          <div className="icono">{ICONOS_FASE[fase.id]}</div>
          <div className="titulo">{NOMBRES_FASE[fase.id]}</div>
        </div>
        <div className="descripcion">{fase.intro}</div>
      </div>

      <div className="panel hud-stat">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--gold)"><path d="M12 2l2.9 6.1 6.6.7-4.9 4.5 1.4 6.5L12 16.8 6 19.8l1.4-6.5-4.9-4.5 6.6-.7L12 2z" /></svg>
        <div>
          <div className="label-pixel">PUNTAJE RETOS</div>
          <div className="valor" style={{ color: 'var(--gold)' }}>{puntajeAcumulado} / 800</div>
        </div>
      </div>

      <div className="hud-stats-row">
        <div className="panel hud-stat">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
          <div>
            <div className="label-pixel" style={{ fontSize: "10px" }}>TIEMPO</div>
            <div className="valor">{formatearTiempo(tiempoGlobalRestante)}</div>
          </div>
        </div>

        <div className="panel hud-stat">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.4" strokeLinecap="round"><path d="m4 12 5 5L20 6" /></svg>
          <div>
            <div className="label-pixel" style={{ fontSize: "10px" }}>DECISIONES</div>
            <div className="valor">{decisionesResueltas} / {totalDecisionesFase}</div>
          </div>
        </div>
      </div>

      <div className="hud-progreso">
        <div className="label-pixel" style={{ marginBottom: 8 }}>PROGRESO</div>
        <div className="puntos">
          {ORDEN_FASES.map((id, i) => (
            <div
              key={id}
              className="punto"
              style={{
                width: i === faseIndex ? 14 : 11,
                height: i === faseIndex ? 14 : 11,
                background: i < faseIndex ? 'var(--green)' : i === faseIndex ? 'var(--cyan)' : 'var(--border)',
              }}
            />
          ))}
        </div>
      </div>

      {cliente}

      <button type="button" className="btn-outline-danger" onClick={onAbandonar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
        ABANDONAR MISIÓN
      </button>
    </div>
  );
}

// Se remonta (vía key={fase.id} en el padre) cada vez que cambia de fase,
// así que su estado de "¿ya vio la explicación?" siempre arranca en false.
function CuerpoFase({ escenario, fase, faseIndex, decisionIndex, respuestas, pistasUsadasIds, tiempoGlobalRestante, puntajeAcumulado, indicadorValor, avatarJugador, responderDecision, pedirPista, siguienteDecision, onAbandonar }) {
  const [explicacionVista, setExplicacionVista] = useState(false);
  const [mostrarCierre, setMostrarCierre] = useState(false);
  const panelDecisionRef = useRef(null);
  const decisionesResueltas = fase.decisiones.filter((d) => respuestas[d.id]).length;
  // Bloque opcional del JSON. Vacío para los escenarios que no lo declaran, y
  // entonces nada de lo que sigue se renderiza.
  const presentacion = escenario.presentacion ?? {};

  // El cliente reacciona a la decisión en curso: si ya la respondió muestra la
  // reacción, si no queda en idle. Habla con el mensaje de la decisión actual y,
  // mientras no hay decisión en pantalla (intro de fase), con el intro.
  const decisionActual = fase.decisiones[decisionIndex];

  // El panel principal tiene scroll interno. Al cambiar de reto el navegador
  // conservaba la posición del anterior y podía ocultar la primera opción
  // (justo la correcta en algunos puzzles). Cada reto debe empezar arriba.
  useEffect(() => {
    if (panelDecisionRef.current) panelDecisionRef.current.scrollTop = 0;
  }, [decisionIndex, explicacionVista, mostrarCierre]);
  const estadoCliente = calcularEstadoActualDecision(
    decisionActual,
    decisionActual ? respuestas[decisionActual.id] : null,
  );
  const textoCliente = mostrarCierre
    ? fase.mensajeCierre ?? fase.intro ?? ''
    : explicacionVista
      ? decisionActual?.mensajeClienteDecision ?? fase.intro ?? ''
      : fase.intro ?? '';

  const cliente = (
    <ClienteFlotante
      nombre={escenario.cliente.nombre}
      rol={escenario.cliente.rol}
      texto={textoCliente}
      estado={estadoCliente}
      retrato={escenario.cliente.retrato}
    />
  );

  const sidebar = (
    <Sidebar
      fase={fase}
      faseIndex={faseIndex}
      totalFases={escenario.fases.length}
      decisionesResueltas={decisionesResueltas}
      totalDecisionesFase={fase.decisiones.length}
      tiempoGlobalRestante={tiempoGlobalRestante}
      puntajeAcumulado={puntajeAcumulado}
      cliente={cliente}
      onAbandonar={onAbandonar}
    />
  );

  const badge = (
    <div className="panel hud-badge">
      <span>☀️</span>
      <span className="titulo">Escenario: {escenario.titulo}</span>
      <span className="separador">|</span>
      <span className="detalle">{escenario.cliente.dolorFrase}</span>
    </div>
  );

  // Cabecera de la columna principal. Por defecto es la franja de siempre con
  // el título del escenario. Un escenario que declara escena y/o medidor global
  // la reemplaza por su propia franja, sin que ninguno de los dos caminos sepa
  // del otro.
  const hayPresentacionPropia = !!presentacion.escena || !!presentacion.indicadorGlobal;
  const cabecera = hayPresentacionPropia ? (
    <div className="hud-escenario">
      {presentacion.escena && (
        <div className="hud-escenario-vista panel">
          <EscenaFondo tipo={presentacion.escena} progreso={indicadorValor} />
        </div>
      )}
      {presentacion.indicadorGlobal && (
        <div className="hud-escenario-medidor panel">
          <IndicadorGlobal
            etiqueta={presentacion.indicadorGlobal.etiqueta}
            unidad={presentacion.indicadorGlobal.unidad}
            valor={indicadorValor}
            maximo={presentacion.indicadorGlobal.maximo}
          />
        </div>
      )}
    </div>
  ) : (
    badge
  );

  if (!explicacionVista) {
    // Una fase que declara `historieta` abre con la tira de viñetas en vez del
    // párrafo de explicación. La que no la declara (Ccorca) sigue abriendo con
    // el texto de siempre, sin cambios.
    if (fase.historieta?.length) {
      return (
        <div className="hud-cuerpo">
          {sidebar}
          <div className="hud-principal">
            {cabecera}
            <div className="panel hud-panel hud-panel-historieta">
              <HistorietaPixel
                paneles={fase.historieta}
                avatar={avatarJugador}
                textoBoton={fase.textoBotonHistorieta ?? 'EMPEZAR FASE'}
                onTerminar={() => setExplicacionVista(true)}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="hud-cuerpo">
        {sidebar}
        <div className="hud-principal">
          {cabecera}
          <div className="panel hud-panel hud-explicacion hud-explicacion-intro">
            <div className="titulo">{fase.titulo} · {fase.rol}</div>
            <div className="texto">{fase.explicacion}</div>
            <button type="button" className="btn-primary" onClick={() => setExplicacionVista(true)}>Entiendo, comenzar</button>
          </div>
        </div>
      </div>
    );
  }

  const decision = decisionActual;
  const Minijuego = minijuegoPorTipo[decision.tipoInteraccion];
  const yaResuelta = !!respuestas[decision.id];
  const textoPista = decision.pista ?? decision.pistaTexto;
  const pistaVisible = pistasUsadasIds.includes(decision.id);
  const esUltimaDecision = decisionIndex === fase.decisiones.length - 1;

  function manejarElegir(opcionIds, puntajeDirecto) {
    if (yaResuelta) return;
    responderDecision(decision.id, opcionIds, puntajeDirecto);
  }

  function continuar() {
    if (esUltimaDecision && fase.historietaCierre?.length) {
      setMostrarCierre(true);
      return;
    }
    siguienteDecision();
  }

  if (mostrarCierre) {
    return (
      <div className="hud-cuerpo">
        {sidebar}
        <div className="hud-principal">
          {cabecera}
          <div className="panel hud-panel hud-panel-historieta hud-panel-cierre">
            <div className="hud-cierre-rotulo label-pixel">RESULTADO DE LA FASE</div>
            <HistorietaPixel
              paneles={fase.historietaCierre}
              avatar={avatarJugador}
              textoBoton={fase.textoBotonCierre ?? 'SIGUIENTE FASE'}
              onTerminar={siguienteDecision}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hud-cuerpo">
      {sidebar}
      <div className="hud-principal">
        {cabecera}
        <div ref={panelDecisionRef} className="panel hud-panel hud-panel-decision">
          {textoPista && (
            <div className={`hud-pista${pistaVisible ? ' abierta' : ''}`}>
              {!pistaVisible ? (
                <button
                  type="button"
                  className="hud-pista-boton"
                  onClick={() => pedirPista(decision.id)}
                  disabled={yaResuelta}
                >
                  💡 VER PISTA <span>−{PENALIZACION_PISTA} pts</span>
                </button>
              ) : (
                <div className="hud-pista-texto" role="status">
                  <strong>💡 PISTA:</strong> {textoPista}
                </div>
              )}
            </div>
          )}
          <Minijuego
            key={decision.id}
            decision={decision}
            onElegir={manejarElegir}
            avatar={avatarJugador}
          />
          {yaResuelta && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button type="button" className="btn-primary" onClick={continuar}>
                {esUltimaDecision && fase.historietaCierre?.length ? 'VER RESULTADO →' : 'Continuar →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PantallaJuego() {
  const { state, responderDecision, pedirPista, siguienteDecision, reiniciar } = useGame();
  const { escenario, faseIndex, decisionIndex, tiempoGlobalRestante, puntajeAcumulado, respuestas, pistasUsadasIds, indicadorValor } = state;
  const fase = escenario.fases[faseIndex];

  return (
    <div className="hud">
      <TopBar />
      <CuerpoFase
        key={fase.id}
        escenario={escenario}
        fase={fase}
        faseIndex={faseIndex}
        decisionIndex={decisionIndex}
        respuestas={respuestas}
        pistasUsadasIds={pistasUsadasIds}
        tiempoGlobalRestante={tiempoGlobalRestante}
        puntajeAcumulado={puntajeAcumulado}
        indicadorValor={indicadorValor}
        avatarJugador={state.jugador?.avatar}
        responderDecision={responderDecision}
        pedirPista={pedirPista}
        siguienteDecision={siguienteDecision}
        onAbandonar={reiniciar}
      />
      <div className="hud-footer">
        <span>TECSUP · Formación que transforma</span>
        <span>Diseño y Desarrollo de Software · Centro de Innovación Tecnológica</span>
      </div>
    </div>
  );
}
