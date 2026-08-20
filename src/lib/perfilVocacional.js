// Perfil vocacional del jugador al terminar un escenario.
//
// La idea: cada fase del ciclo de desarrollo corresponde a una forma de
// trabajar (investigar, diseñar, construir, probar, desplegar). El perfil que
// se le muestra al jugador es aquel donde su desempeño RELATIVO fue mejor —
// no donde más puntos sacó en bruto, porque las fases no valen lo mismo.
//
// Es determinista y auditable: mismas respuestas, mismo perfil. No hay azar.
//
// Es opcional: solo se calcula si el escenario declara `presentacion.perfiles`.
// Ccorca v1/v2 no los declaran, así que para ellos esto devuelve null y su
// pantalla de resultado no cambia en nada.

// Máximo alcanzable en una decisión. Cada mecánica sabe puntuar distinto, así
// que el techo se lee de donde corresponda en cada caso.
export function puntajeMaximoDecision(decision) {
  const meta = decision.metaMinijuego ?? {};

  switch (decision.tipoInteraccion) {
    case 'arquitectura-nodos': {
      const pasos = meta.pasos ?? [];
      const suma = pasos.reduce((acc, p) => acc + (p.puntosMax ?? 0), 0);
      return suma + (meta.bonusArquitecturaCompleta ?? 0);
    }
    case 'circuito-conexiones':
    case 'detectar-intruso':
    case 'mecanografia-codigo':
      return meta.puntosMax ?? 0;
    case 'seleccion-cards':
      return Math.max(0, ...(meta.imagenes ?? []).map((i) => i.puntaje ?? 0));
    case 'seleccion-multiple':
    case 'mapa-calor':
      return Math.max(0, ...Object.values(decision.tablaPuntaje ?? {}));
    default:
      return Math.max(0, ...(decision.opciones ?? []).map((o) => o.puntaje ?? 0));
  }
}

export function puntajeMaximoFase(fase) {
  return fase.decisiones.reduce((acc, d) => acc + puntajeMaximoDecision(d), 0);
}

export function puntajeObtenidoFase(fase, respuestas) {
  return fase.decisiones.reduce((acc, d) => {
    const r = respuestas[d.id];
    return acc + (r ? r.puntaje + r.bono : 0);
  }, 0);
}

// Devuelve el perfil declarado cuya fase tuvo el mejor desempeño relativo, o
// null si el escenario no declara perfiles. Los empates se resuelven por el
// orden de declaración: el JSON manda, no el azar.
export function calcularPerfil(escenario, respuestas) {
  const perfiles = escenario.presentacion?.perfiles;
  if (!perfiles?.length) return null;

  let mejor = null;
  let mejorRatio = -1;

  perfiles.forEach((perfil) => {
    const fase = escenario.fases.find((f) => f.id === perfil.fase);
    if (!fase) return;
    const maximo = puntajeMaximoFase(fase);
    if (maximo <= 0) return;
    const ratio = puntajeObtenidoFase(fase, respuestas) / maximo;
    if (ratio > mejorRatio) {
      mejorRatio = ratio;
      mejor = perfil;
    }
  });

  if (!mejor) return null;
  return { ...mejor, desempeno: Math.round(mejorRatio * 100) };
}
