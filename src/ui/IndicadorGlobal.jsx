import '../styles/indicador.css';

// Medidor global del escenario ("CIUDAD RECUPERADA: 65 %").
//
// Es opcional y declarativo: solo se renderiza si el escenario trae
// `presentacion.indicadorGlobal` en su JSON. Ccorca v1/v2 no lo traen, así que
// para ellos este componente ni se monta.
//
// El valor no lo simula nadie: lo fija el motor con los hitos que cada decisión
// declara (`hitoIndicador`). Ver docs/contrato-escenario.md.
//
// Props:
//   etiqueta  string  - 'CIUDAD RECUPERADA'
//   unidad    string  - '%'
//   valor     number  - 0..100
//   maximo    number  - default 100

export default function IndicadorGlobal({ etiqueta, unidad = '%', valor = 0, maximo = 100 }) {
  const pct = Math.max(0, Math.min(100, (valor / maximo) * 100));
  // Tres tramos, con nombre además del color: el estado no depende solo del
  // color de la barra, también del texto de estado que va al lado.
  const tramo = pct >= 80 ? 'alto' : pct >= 40 ? 'medio' : 'bajo';
  const nombreTramo = { bajo: 'crítico', medio: 'parcial', alto: 'estable' }[tramo];

  return (
    <div className={`indicador indicador-${tramo}`}>
      <div className="indicador-cabecera">
        <span className="label-pixel">{etiqueta}</span>
        <span className="indicador-valor">
          {Math.round(valor)}
          {unidad}
        </span>
      </div>
      <div
        className="indicador-pista"
        role="progressbar"
        aria-valuenow={Math.round(valor)}
        aria-valuemin={0}
        aria-valuemax={maximo}
        aria-label={`${etiqueta}: ${Math.round(valor)}${unidad}, estado ${nombreTramo}`}
      >
        <div className="indicador-relleno" style={{ width: `${pct}%` }} />
      </div>
      <div className="indicador-estado">Estado de la red: {nombreTramo}</div>
    </div>
  );
}
