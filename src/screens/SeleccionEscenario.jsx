import { useGame } from '../engine/useGame';
import ccorca from '../content/ccorca.json';
import ccorcaV2 from '../content/ccorca-v2.json';
import TopBar from '../ui/TopBar';
import '../styles/seleccion.css';

// Escenarios B y C se agregan aquí como solo-contenido, sin tocar el motor.
// ccorca-v2 es la versión paralela con la mecánica de arquitectura-nodos en
// la fase Construir. Convive con ccorca (v1) para poder comparar.
const ESCENARIOS_DISPONIBLES = [
  {
    ...ccorca,
    titulo: 'Luz para Ccorca (v1)',
    etiqueta: 'ENERGÍA LIMPIA',
  },
  {
    ...ccorcaV2,
    titulo: 'Luz para Ccorca (v2)',
    etiqueta: 'ENERGÍA LIMPIA · ARQUITECTURA',
  },
];

const PROXIMAMENTE = [
  {
    id: 'turno-seguro',
    categoria: 'SEGURIDAD LABORAL',
    titulo: 'Turno Seguro',
    dolorFrase: 'El checklist en papel de una mina se pierde. Ya hubo un incidente evitable.',
    color: 'var(--pink)',
    fondo: 'linear-gradient(160deg,#3a2a2c,#5a3a3a)',
  },
  {
    id: 'campo-mercado',
    categoria: 'PRODUCCIÓN RESPONSABLE',
    titulo: 'Del Campo al Mercado',
    dolorFrase: 'Productoras de quinua venden a mitad de precio por no poder demostrar su origen.',
    color: 'var(--green)',
    fondo: 'linear-gradient(160deg,#213a2c,#2f5a3a)',
  },
];

export default function SeleccionEscenario() {
  const { iniciarPartida } = useGame();

  return (
    <div className="seleccion">
      <TopBar />

      <div className="seleccion-cuerpo">
        <div className="seleccion-encabezado">
          <div className="titulo">Elige tu misión</div>
          <div className="subtitulo">
            Cada escenario es un cliente real con un problema real. El motor es el mismo — lo que cambia es la historia.
          </div>
        </div>

        <div className="seleccion-escenarios">
          {ESCENARIOS_DISPONIBLES.map((escenario) => (
            <div className="seleccion-card disponible" key={escenario.id}>
              <div className="portada" style={{ background: 'linear-gradient(160deg,#1c2b57,#2c3f74)' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
                </svg>
              </div>
              <div>
                <div className="etiqueta" style={{ color: 'var(--gold)' }}>{escenario.etiqueta}</div>
                <div className="titulo">{escenario.titulo}</div>
                <div className="dolor">{escenario.cliente.dolorFrase}</div>
              </div>
              <button type="button" className="btn-elegir" onClick={() => iniciarPartida(escenario)}>
                ELEGIR ESCENARIO
              </button>
            </div>
          ))}

          {PROXIMAMENTE.map((escenario) => (
            <div className="seleccion-card bloqueada" key={escenario.id}>
              <div className="portada" style={{ background: escenario.fondo }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={escenario.color} strokeWidth="1.6">
                  <path d="M12 3c-4 3-6 6-6 9a6 6 0 0 0 12 0c0-3-2-6-6-9Z" />
                </svg>
              </div>
              <div>
                <div className="etiqueta" style={{ color: escenario.color }}>{escenario.categoria}</div>
                <div className="titulo">{escenario.titulo}</div>
                <div className="dolor">{escenario.dolorFrase}</div>
              </div>
              <button type="button" className="btn-proximamente" disabled>PRÓXIMAMENTE</button>
            </div>
          ))}
        </div>
      </div>

      <div className="seleccion-footer">
        <span>TECSUP · Formación que transforma</span>
        <span>Diseño y Desarrollo de Software · Centro de Innovación Tecnológica</span>
      </div>
    </div>
  );
}
