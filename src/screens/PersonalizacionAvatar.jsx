import { useState } from 'react';
import { useGame } from '../engine/useGame';
import TopBar from '../ui/TopBar';
import Avatar from '../ui/Avatar';
import { ACCESORIOS, AVATAR_POR_DEFECTO, COLORES, ROSTROS } from '../ui/avatarOpciones';
import '../styles/personalizacion.css';
import { APP_NAME, APP_TAGLINE } from '../config/marca';

// Pantalla de personalización del personaje. Se muestra entre la selección de
// escenario y la partida, y SOLO si el escenario declaró
// `presentacion.personalizacionAvatar` (ver gameReducer.crearEstadoConEscenario).
// Ccorca no lo declara y por eso nunca pasa por acá.
//
// Está pensada para durar 15-20 segundos: tres filas, pocas opciones y un botón.
// El nombre no se vuelve a pedir: ya lo dio en el registro general y se muestra
// arriba del avatar como confirmación.
//
// Cada opción es un <button> con `aria-pressed`, así que el estado elegido se
// anuncia solo y la pantalla se recorre entera con Tab y Enter.

const FILAS = [
  { clave: 'rostro', titulo: 'Rostro', opciones: ROSTROS },
  { clave: 'color', titulo: 'Color de chaqueta', opciones: COLORES },
  { clave: 'accesorio', titulo: 'Accesorio', opciones: ACCESORIOS },
];

// Miniatura de cada opción: el mismo avatar con esa única pieza cambiada. Así
// el jugador ve exactamente lo que va a elegir, no una etiqueta abstracta.
function Miniatura({ clave, opcionId, seleccion }) {
  return <Avatar avatar={{ ...seleccion, [clave]: opcionId }} tam={44} />;
}

export default function PersonalizacionAvatar() {
  const { state, confirmarAvatar } = useGame();
  const { escenario, jugador } = state;
  const config = escenario?.presentacion?.personalizacionAvatar ?? {};

  const [seleccion, setSeleccion] = useState(AVATAR_POR_DEFECTO);

  function elegir(clave, id) {
    setSeleccion((prev) => ({ ...prev, [clave]: id }));
  }

  return (
    <div className="pers">
      <TopBar />

      <div className="pers-cuerpo">
        <div className="pers-encabezado">
          <div className="titulo">{config.titulo ?? 'Elige tu identidad'}</div>
          <div className="subtitulo">
            {config.subtitulo ?? 'Rápido: puedes cambiar de idea cuando quieras. Toma 15 segundos.'}
          </div>
        </div>

        <div className="pers-tablero">
          <div className="pers-vista panel">
            <div className="label-pixel">TU PERSONAJE</div>
            <div className="pers-avatar">
              <Avatar avatar={seleccion} tam={140} titulo="Vista previa de tu personaje" />
            </div>
            <div className="pers-nombre">{jugador?.nombre}</div>
            <div className="pers-rol">{config.rolJugador ?? 'Equipo de respuesta'}</div>
          </div>

          <div className="pers-opciones">
            {FILAS.map((fila) => (
              <fieldset className="pers-fila panel" key={fila.clave}>
                <legend className="label-pixel">{fila.titulo}</legend>
                <div className="pers-chips">
                  {fila.opciones.map((op) => {
                    const activa = seleccion[fila.clave] === op.id;
                    return (
                      <button
                        type="button"
                        key={op.id}
                        className={`pers-chip${activa ? ' on' : ''}`}
                        aria-pressed={activa}
                        onClick={() => elegir(fila.clave, op.id)}
                      >
                        <span className="pers-chip-mini" aria-hidden="true">
                          <Miniatura clave={fila.clave} opcionId={op.id} seleccion={seleccion} />
                        </span>
                        <span className="pers-chip-nombre">{op.nombre}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <button
              type="button"
              className="btn-primary btn-pixel pers-comenzar"
              onClick={() => confirmarAvatar(seleccion)}
            >
              {config.textoBoton ?? 'ENTRAR A NEXO'}
            </button>
          </div>
        </div>
      </div>

      <div className="pers-footer">
        <span>{APP_NAME}</span>
        <span>{APP_TAGLINE}</span>
      </div>
    </div>
  );
}
