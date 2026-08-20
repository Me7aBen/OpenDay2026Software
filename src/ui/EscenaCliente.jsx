import '../styles/escena-cliente.css';
import EstadoCliente from './EstadoCliente';

// Ilustración placeholder del cliente del escenario (paisaje + colegio +
// personaje + burbuja + emoji). El arte de personaje real (retrato
// ilustrado) es un encargo aparte, ver docs/propuesta-taller-simulador-software.md §9.
//
// La burbuja de diálogo recepciona todos los mensajes del cliente: el
// `intro` de la fase al arrancar y el `mensajeClienteDecision` de cada
// decisión cuando cambia. El componente padre (PantallaJuego) decide qué
// texto pasar en cada momento.
//
// Props:
//   nombre   string
//   rol      string
//   dialogo  string  - el texto activo (intro o mensaje de la decisión)
//   estado   'idle' | 'feliz' | 'confundido' | 'molesto' | 'sorprendido'
export default function EscenaCliente({ nombre, rol, dialogo, estado = 'idle' }) {
  return (
    <div className="escena">
      <svg className="fondo" viewBox="0 0 640 400" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2b3f7a" />
            <stop offset="55%" stopColor="#5c6fb0" />
            <stop offset="100%" stopColor="#e8a866" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="640" height="400" fill="url(#sky)" />

        <circle cx="500" cy="120" r="46" fill="#ffdf80" />
        <circle cx="500" cy="120" r="60" fill="#ffdf80" opacity="0.25" />

        <polygon points="0,260 90,160 180,260" fill="#41508c" />
        <polygon points="120,260 230,140 340,260" fill="#48598f" />
        <polygon points="300,260 400,170 520,260" fill="#41508c" />
        <polygon points="120,260 145,205 170,260" fill="#e9edf5" opacity="0.55" />
        <polygon points="345,260 365,215 385,260" fill="#e9edf5" opacity="0.55" />

        <rect x="0" y="255" width="640" height="145" fill="#8a6b45" />
        <rect x="0" y="255" width="640" height="18" fill="#9c7c52" />

        <rect x="60" y="60" width="34" height="14" fill="#e9edf5" opacity="0.85" />
        <rect x="100" y="60" width="46" height="14" fill="#e9edf5" opacity="0.7" />

        <rect x="220" y="150" width="230" height="110" fill="#c9a06a" />
        <polygon points="205,150 335,95 465,150" fill="#a2452f" />
        <rect x="230" y="90" width="90" height="52" fill="#2b3350" />
        <rect x="233" y="93" width="20" height="22" fill="#4a5a8a" />
        <rect x="257" y="93" width="20" height="22" fill="#4a5a8a" />
        <rect x="281" y="93" width="20" height="22" fill="#4a5a8a" />
        <rect x="233" y="119" width="20" height="20" fill="#4a5a8a" />
        <rect x="257" y="119" width="20" height="20" fill="#4a5a8a" />
        <rect x="281" y="119" width="20" height="20" fill="#4a5a8a" />

        <rect x="252" y="180" width="20" height="30" fill="#7a5a34" />
        <rect x="284" y="185" width="26" height="42" fill="#3f2f5a" />
        <rect x="287" y="188" width="8" height="10" fill="#8fd9ff" />
        <rect x="299" y="188" width="8" height="10" fill="#8fd9ff" />
        <rect x="340" y="185" width="26" height="42" fill="#3f2f5a" />
        <rect x="343" y="188" width="8" height="10" fill="#8fd9ff" />
        <rect x="355" y="188" width="8" height="10" fill="#8fd9ff" />
        <rect x="396" y="185" width="26" height="42" fill="#3f2f5a" />
        <rect x="399" y="188" width="8" height="10" fill="#8fd9ff" />
        <rect x="411" y="188" width="8" height="10" fill="#8fd9ff" />

        <text x="335" y="175" textAnchor="middle" fontFamily="Baloo 2, sans-serif" fontSize="11" fontWeight="800" fill="#3a2c1e">
          I.E. CCORCA
        </text>

        <g transform="translate(555,60)">
          <rect x="0" y="0" width="4" height="140" fill="#c9c9c9" />
          <rect x="4" y="6" width="30" height="18" fill="#d91e36" />
          <rect x="4" y="24" width="30" height="18" fill="#f4f4f4" />
          <rect x="4" y="42" width="30" height="18" fill="#d91e36" />
        </g>

        <g transform="translate(56,180)">
          <rect x="0" y="30" width="14" height="40" fill="#3d5a34" />
          <polygon points="7,-6 -12,34 26,34" fill="#4d7a3f" />
          <polygon points="7,6 -8,42 22,42" fill="#5c8c4c" />
        </g>
      </svg>

      <div className="escena-personaje-wrap">
        <div className="escena-personaje">
          <div style={{ width: 16, height: 16, background: '#241a33', marginBottom: -2 }} />
          <div style={{ display: 'flex' }}>
            <div style={{ width: 6, height: 22, background: '#241a33' }} />
            <div style={{ width: 38, height: 22, background: '#f0c8a0' }} />
            <div style={{ width: 6, height: 22, background: '#241a33' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 50, height: 8, background: '#f0c8a0', position: 'relative', top: -1 }}>
            <div style={{ width: 10, height: 4, border: '2px solid #241a33', margin: '0 2px' }} />
            <div style={{ width: 10, height: 4, border: '2px solid #241a33', margin: '0 2px' }} />
          </div>
          <div style={{ width: 70, height: 58, background: '#6a3f8f', borderTop: '6px solid #56327a' }} />
          <div style={{ display: 'flex', width: 74, justifyContent: 'space-between', marginTop: -4 }}>
            <div style={{ width: 16, height: 34, background: '#f0c8a0' }} />
            <div style={{ width: 16, height: 34, background: '#f0c8a0' }} />
          </div>
          <div style={{ display: 'flex', width: 70, justifyContent: 'space-between' }}>
            <div style={{ width: 22, height: 30, background: '#2b2440' }} />
            <div style={{ width: 22, height: 30, background: '#2b2440' }} />
          </div>
          <div style={{ display: 'flex', width: 70, justifyContent: 'space-between' }}>
            <div style={{ width: 24, height: 10, background: '#1c1830' }} />
            <div style={{ width: 24, height: 10, background: '#1c1830' }} />
          </div>
        </div>
        <EstadoCliente estado={estado} />
      </div>

      <div className="escena-dialogo">
        <div className="etiqueta">{nombre} · {rol}</div>
        <div className="texto">{dialogo}</div>
        <div className="pico" />
      </div>
    </div>
  );
}
