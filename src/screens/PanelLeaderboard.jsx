import { useEffect, useState } from 'react';
import { obtenerRanking, estaConfigurado } from '../lib/leaderboard';
import { ORDEN_MISIONES } from '../engine/misiones';
import { ESCENARIOS } from '../content/catalogo';
import '../styles/panel-leaderboard.css';

// Pantalla del facilitador: el ranking de la jornada, proyectable.
//
// No es parte del flujo del alumno. Se entra por URL: ?vista=leaderboard
// (y opcionalmente &colegio=7 para abrir filtrado a esa ronda).
//
// Se refresca solo cada 3 s. La propuesta (§8) descarta Supabase Realtime a
// propósito: un SELECT periódico es más simple y aguanta mejor un wifi malo,
// y a 3 s se ve igual de "en vivo" en la práctica.
//
// Sin Supabase configurado muestra el ranking local de ESTA PC y lo dice, para
// que nadie proyecte 4 filas creyendo que son las de todo el laboratorio.

const REFRESCO_MS = 3000;
const NUMEROS = Array.from({ length: 20 }, (_, i) => i + 1);

// Títulos de misión por id, en el orden de juego, para las columnas.
const COLUMNAS = ORDEN_MISIONES.map((id) => ({
  id,
  titulo: ESCENARIOS.find((e) => e.id === id)?.titulo ?? id,
}));

function formatearTiempo(seg) {
  if (!seg) return '—';
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function paramInicialColegio() {
  const valor = new URLSearchParams(window.location.search).get('colegio');
  const n = Number(valor);
  return n >= 1 && n <= 20 ? String(n) : '';
}

export default function PanelLeaderboard() {
  const [colegio, setColegio] = useState(paramInicialColegio);
  const [datos, setDatos] = useState({ filas: [], origen: null, actualizado: null });

  useEffect(() => {
    // `vivo` evita escribir estado después de desmontar o de cambiar el filtro:
    // una lectura lenta que llega tarde no puede pisar a la nueva.
    let vivo = true;

    async function leer() {
      const res = await obtenerRanking({
        numeroColegio: colegio ? Number(colegio) : null,
        limite: 100,
      });
      if (!vivo) return;
      setDatos({ filas: res.filas, origen: res.origen, actualizado: new Date() });
    }

    leer();
    const id = setInterval(leer, REFRESCO_MS);

    // En modo local, además del poll, reacciona al instante cuando otra pestaña
    // de la misma PC termina una misión.
    function alCambiarStorage(e) {
      if (!estaConfigurado() && e.key?.startsWith('md:')) leer();
    }
    window.addEventListener('storage', alCambiarStorage);

    return () => {
      vivo = false;
      clearInterval(id);
      window.removeEventListener('storage', alCambiarStorage);
    };
  }, [colegio]);

  const { filas, origen, actualizado } = datos;
  const totalPuntos = filas.reduce((a, f) => a + f.puntajeTotal, 0);

  return (
    <div className="panel-lb">
      <header className="panel-lb-cabecera">
        <div>
          <div className="titulo">
            <span style={{ color: 'var(--cyan)' }}>MISIÓN</span> DEPLOY · RANKING
          </div>
          <div className="subtitulo">
            {colegio ? `Colegio N.º ${colegio}` : 'Todos los colegios'} · {filas.length} participantes
            {filas.length > 0 && ` · ${totalPuntos} puntos sumados`}
          </div>
        </div>

        <div className="panel-lb-controles">
          <label htmlFor="filtro-colegio" className="label-pixel">COLEGIO</label>
          <select
            id="filtro-colegio"
            value={colegio}
            onChange={(e) => setColegio(e.target.value)}
          >
            <option value="">Todos</option>
            {NUMEROS.map((n) => (
              <option key={n} value={n}>N.º {n}</option>
            ))}
          </select>
        </div>
      </header>

      {/* `origen === null` es "todavía no llegó la primera lectura". Sin esta
          guarda, el panel mostraba el aviso de modo local durante el segundo que
          tarda la primera consulta, y proyectado eso se lee como si Supabase
          estuviera caído cuando en realidad está cargando. */}
      {origen === null && <div className="panel-lb-aviso cargando">Cargando el ranking…</div>}

      {origen !== null && origen !== 'supabase' && (
        <div className="panel-lb-aviso">
          {origen === 'local-sin-conexion'
            ? 'Supabase no responde: se está mostrando el ranking guardado en ESTA PC.'
            : 'Modo local: solo se ven los alumnos de ESTA PC. Para el ranking de todo el laboratorio hay que configurar Supabase (ver docs/supabase.md).'}
        </div>
      )}

      <div className="panel-lb-tabla-wrap">
        <table className="panel-lb-tabla">
          <thead>
            <tr>
              <th className="col-puesto">#</th>
              <th>Alumno</th>
              <th>Colegio</th>
              {COLUMNAS.map((c) => (
                <th key={c.id} className="col-mision">{c.titulo}</th>
              ))}
              <th className="col-total">Total</th>
              <th className="col-tiempo">Tiempo</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => (
              <tr key={fila.id} className={i < 3 ? `podio p${i + 1}` : undefined}>
                <td className="col-puesto">{i + 1}</td>
                <td className="celda-nombre">{fila.nombre}</td>
                <td className="celda-colegio">
                  <span className="numero">{fila.numeroColegio}</span> {fila.colegio}
                </td>
                {COLUMNAS.map((c) => (
                  <td key={c.id} className="col-mision">
                    {fila.misiones?.[c.id] ? fila.misiones[c.id].puntaje : '—'}
                  </td>
                ))}
                <td className="col-total">{fila.puntajeTotal}</td>
                <td className="col-tiempo">{formatearTiempo(fila.tiempoTotalSeg)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filas.length === 0 && (
          <div className="panel-lb-vacio">
            Todavía no hay puntajes{colegio ? ` del colegio N.º ${colegio}` : ''}. La tabla se
            actualiza sola en cuanto alguien termine una misión.
          </div>
        )}
      </div>

      <footer className="panel-lb-pie">
        <span>TECSUP · Formación que transforma</span>
        <span>
          Se actualiza cada 3 s
          {actualizado && ` · última lectura ${actualizado.toLocaleTimeString('es-PE')}`}
        </span>
      </footer>
    </div>
  );
}
