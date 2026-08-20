// Lógica pura de puntaje y progreso. No conoce narrativa: solo lee la forma
// del contrato descrito en docs/contrato-escenario.md.

export const TIEMPO_TOTAL_DEFAULT_SEG = 960; // 16 min
export const BONO_TIEMPO_MAX = 200;
export const PENALIZACION_PISTA = 20;

export function contarDecisionesTotales(escenario) {
  return escenario.fases.reduce((total, fase) => total + fase.decisiones.length, 0);
}

export function calcularPuntajeDecision(decision, opcionIds, puntajeDirecto = null) {
  // Caso especial: decisiones compuestas (arquitectura-nodos) que ya
  // calcularon su puntaje internamente paso a paso. El componente nos pasa
  // el total acumulado. No leemos `opciones`.
  if (decision.tipoInteraccion === 'arquitectura-nodos') {
    // Si completa la arquitectura a pleno (todos los pasos a 30), suma
    // `bonusArquitecturaCompleta` del metaMinijuego del JSON.
    const pasos = decision.metaMinijuego?.pasos ?? [];
    const maximoPosible = pasos.reduce(
      (acc, p) => acc + (p.puntosMax ?? 0),
      0,
    );
    const puntaje = puntajeDirecto ?? 0;
    const bonus =
      maximoPosible > 0 && puntaje >= maximoPosible
        ? (decision.metaMinijuego?.bonusArquitecturaCompleta ?? 0)
        : 0;
    return { puntaje, bono: bonus };
  }

  // Mapa de calor: el componente manda los ids de las zonas marcadas (únicas,
  // no se cuentan re-clics). El motor:
  //   1. Cuenta cuántas zonas son críticas (= aciertos).
  //   2. Mira la tablaPuntaje por ese número de aciertos.
  //   3. Descuenta `penalizacionPorIntentoExtra` por cada clic en una zona
  //      NO crítica (= int_util = intentos - aciertos).
  //   4. El puntaje no baja de 0.
  if (decision.tipoInteraccion === 'mapa-calor') {
    const meta = decision.metaMinijuego ?? {};
    const zonas = meta.zonasClicables ?? [];
    const penalizacionPorIntentoExtra = meta.penalizacionPorIntentoExtra ?? 0;
    const aciertos = opcionIds.filter((id) => {
      const zona = zonas.find((z) => z.id === id);
      return zona?.esCritica;
    }).length;
    const puntajeBase = decision.tablaPuntaje?.[String(aciertos)] ?? 0;
    const errores = opcionIds.length - aciertos;
    const penalizacion = errores * penalizacionPorIntentoExtra;
    const puntaje = Math.max(0, puntajeBase - penalizacion);
    return { puntaje, bono: 0 };
  }

  // Selección entre cards: el componente manda el id de la imagen elegida.
  // El motor busca el puntaje en `metaMinijuego.imagenes[].puntaje`.
  if (decision.tipoInteraccion === 'seleccion-cards') {
    const imagenes = decision.metaMinijuego?.imagenes ?? [];
    const imagen = imagenes.find((i) => i.id === opcionIds[0]);
    return {
      puntaje: imagen?.puntaje ?? 0,
      bono: imagen?.bonus?.puntos ?? 0,
    };
  }

  if (decision.tipoInteraccion === 'seleccion-multiple') {
    const correctas = opcionIds.filter((id) => {
      const opcion = decision.opciones.find((o) => o.id === id);
      return opcion?.esCorrecta;
    }).length;
    const puntaje = decision.tablaPuntaje?.[String(correctas)] ?? 0;
    return { puntaje, bono: 0 };
  }

  const opcion = decision.opciones.find((o) => o.id === opcionIds[0]);
  return {
    puntaje: opcion?.puntaje ?? 0,
    bono: opcion?.bonus?.puntos ?? 0,
  };
}

export function calcularBonoTiempo(tiempoRestanteSeg, tiempoTotalSeg) {
  if (tiempoTotalSeg <= 0) return 0;
  const proporcion = Math.max(0, Math.min(1, tiempoRestanteSeg / tiempoTotalSeg));
  return Math.round(BONO_TIEMPO_MAX * proporcion);
}

// respuestas: { [decisionId]: { opcionIds: string[], puntaje, bono, pistaUsada } }
export function calcularPuntajeFinal(escenario, respuestas, tiempoGlobalRestanteSeg) {
  let puntajeDecisiones = 0;
  let puntajeBonos = 0;
  let penalizaciones = 0;

  for (const respuesta of Object.values(respuestas)) {
    puntajeDecisiones += respuesta.puntaje;
    puntajeBonos += respuesta.bono;
    if (respuesta.pistaUsada) penalizaciones += PENALIZACION_PISTA;
  }

  const tiempoTotalSeg = escenario.tiempoTotalSeg ?? TIEMPO_TOTAL_DEFAULT_SEG;
  const bonoTiempo = calcularBonoTiempo(tiempoGlobalRestanteSeg, tiempoTotalSeg);
  const total = puntajeDecisiones + puntajeBonos + bonoTiempo - penalizaciones;

  return {
    puntajeDecisiones,
    puntajeBonos,
    bonoTiempo,
    penalizaciones,
    total: Math.max(0, Math.min(1000, total)),
  };
}

export function encontrarEpilogo(escenario, puntajeTotal) {
  const bucket = escenario.epilogos.find((e) => puntajeTotal >= e.min && puntajeTotal <= e.max);
  return bucket ?? escenario.epilogos[escenario.epilogos.length - 1];
}
