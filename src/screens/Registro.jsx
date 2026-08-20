import { useState } from 'react';
import { useGame } from '../engine/useGame';
import TopBar from '../ui/TopBar';
import '../styles/registro.css';

export default function Registro() {
  const { registrarJugador } = useGame();
  const [nombre, setNombre] = useState('');
  const [colegio, setColegio] = useState('');

  function enviar(e) {
    e.preventDefault();
    if (!nombre.trim() || !colegio.trim()) return;
    registrarJugador({ nombre: nombre.trim(), colegio: colegio.trim() });
  }

  return (
    <div className="registro">
      <TopBar mostrarPerfil={false} />

      <div className="registro-fondo">
        <svg className="cielo" viewBox="0 0 1366 704" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b1220" />
              <stop offset="60%" stopColor="#1c2b57" />
              <stop offset="100%" stopColor="#3a2f63" />
            </linearGradient>
          </defs>
          <rect width="1366" height="704" fill="url(#sky2)" />
          <circle cx="1180" cy="140" r="70" fill="#ffdf80" opacity="0.9" />
          <polygon points="0,560 180,380 360,560" fill="#233463" />
          <polygon points="260,560 470,340 680,560" fill="#2c3f74" />
          <polygon points="560,560 760,380 980,560" fill="#233463" />
          <polygon points="880,560 1100,360 1366,560" fill="#2c3f74" />
          <rect x="0" y="555" width="1366" height="149" fill="#141d38" />
          <g opacity="0.5">
            <rect x="80" y="500" width="18" height="18" fill="var(--cyan)" />
            <rect x="220" y="470" width="14" height="14" fill="var(--pink)" />
            <rect x="980" y="480" width="16" height="16" fill="var(--gold)" />
            <rect x="1220" y="510" width="14" height="14" fill="var(--cyan)" />
          </g>
        </svg>

        <div className="registro-contenido">
          <div className="registro-titulo">
            <div className="wordmark">
              <span style={{ color: 'var(--cyan)' }}>MISIÓN</span> DEPLOY
            </div>
            <div className="subtitulo">Tu primer proyecto como desarrollador</div>
          </div>

          <form className="registro-tarjeta" onSubmit={enviar}>
            <div className="encabezado">REGISTRO DE MISIÓN</div>

            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              placeholder="Andrea M."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />

            <label htmlFor="colegio">Colegio</label>
            <input
              id="colegio"
              type="text"
              placeholder="Colegio San José"
              value={colegio}
              onChange={(e) => setColegio(e.target.value)}
              required
            />

            <button type="submit" className="btn-primary btn-pixel" style={{ width: '100%', justifyContent: 'center' }}>
              ACEPTAR MISIÓN
            </button>

            <div className="aviso">Tu nombre y colegio se mostrarán en la pantalla del ranking durante el evento.</div>
          </form>
        </div>
      </div>

      <div className="registro-footer">
        <span>TECSUP · Formación que transforma</span>
        <span>Diseño y Desarrollo de Software · Centro de Innovación Tecnológica</span>
      </div>
    </div>
  );
}
