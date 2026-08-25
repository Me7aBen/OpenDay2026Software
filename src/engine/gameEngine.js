// Lógica pura de puntaje y progreso. No conoce narrativa: solo lee la forma
// del contrato descrito en docs/contrato-escenario.md.

import { puntajeMaximoFase, puntajeObtenidoFase } from '../lib/perfilVocacional.js';

export const TIEMPO_TOTAL_DEFAULT_SEG = 960; // 16 min
export const BONO_TIEMPO_MAX = 200;
// La pista ayuda a aprender y no debe destruir el puntaje. El costo es visible
// antes de abrirla y se aplica una sola vez por reto.
export const PENALIZACION_PISTA = 10;

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

  // Camino genérico para minijuegos que calculan su propio puntaje. Un
  // componente que sabe cuánto vale lo que hizo el jugador (giros del circuito,
  // intentos del intruso, reintentos del código) lo pasa como `puntajeDirecto`
  // y el motor lo toma tal cual, sin tener que aprender las reglas de cada
  // mecánica. Es la extensión que evita ir sumando ramas por tipo acá dentro.
  //
  // Va DESPUÉS de arquitectura-nodos porque esa mecánica ya usaba el parámetro
  // con su propia regla de bonus, y esa regla no cambia.
  //
  // El bonus sigue saliendo de la opción elegida, igual que en el resto: así un
  // minijuego nuevo puede otorgar bonos sin lógica especial.
  if (puntajeDirecto !== null && puntajeDirecto !== undefined) {
    const opcion = decision.opciones?.find((o) => o.id === opcionIds[0]);
    return { puntaje: puntajeDirecto, bono: opcion?.bonus?.puntos ?? 0 };
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
  // Una simulación puede apagar el reloj (`presentacion.temporizador: false`).
  // Si lo hace, tampoco puede haber bono de tiempo: sería un regalo fijo de 200
  // puntos que descuadra el techo del escenario. Ver §55 del brief: el tiempo no
  // debe castigar a quien juega desde el celular.
  const usaTemporizador = escenario.presentacion?.temporizador !== false;
  const bonoTiempo = usaTemporizador
    ? calcularBonoTiempo(tiempoGlobalRestanteSeg, tiempoTotalSeg)
    : 0;
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

// --- Techo de puntaje y desglose por fase -----------------------------------
//
// El HUD mostraba "/ 800" hardcodeado, que era el techo de Código Cero. Con
// simulaciones de distinta longitud (El Pedido Fantasma tiene 6 etapas) el
// número tiene que salir del contenido, no del componente.
//
// Vive acá y no en perfilVocacional.js para que el motor no dependa de un
// módulo cuyo tema es otro; la regla de "cuánto vale como máximo una decisión"
// sí se reutiliza desde ahí, que es donde ya estaba escrita.

export function puntajeMaximoEscenario(escenario) {
  return escenario.fases.reduce((total, fase) => total + puntajeMaximoFase(fase), 0);
}

// Desglose "ANÁLISIS 160 / LÓGICA 230 / ..." de la pantalla de resultado.
// Una fila por fase, con el nombre que la propia fase declara.
export function desglosePorFase(escenario, respuestas) {
  return escenario.fases.map((fase) => ({
    id: fase.id,
    etiqueta: fase.rotuloPuntaje ?? fase.rol ?? fase.titulo ?? fase.id,
    puntaje: puntajeObtenidoFase(fase, respuestas),
    maximo: puntajeMaximoFase(fase),
  }));
}
