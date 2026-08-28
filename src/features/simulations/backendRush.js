// Estado compartido de BACKEND RUSH.
//
// Los niveles de "El Pedido Fantasma" son decisiones independientes del motor,
// y el motor no tiene memoria entre decisiones: cada minijuego recibe su
// `decision` y devuelve un puntaje, nada más. Pero la barra de ESTABILIDAD y
// los contadores (pedidos procesados, duplicados bloqueados, errores) tienen
// que sobrevivir de un nivel al siguiente.
//
// En vez de reestructurar el motor para eso —que sería un cambio grande para
// una barra de progreso— esto es un store de módulo diminuto: un objeto, un
// setter y una suscripción. Los niveles lo leen y lo actualizan; nadie más lo
// conoce.
//
// Se reinicia al montar una partida (ver JugarSimulacionPage), así que volver a
// jugar empieza de cero.

const INICIAL = {
  estabilidad: 72,
  pedidosProcesados: 0,
  duplicadosDetectados: 0,
  duplicadosBloqueados: 0,
  errores: 0,
  nivelActual: 1,
};

let estado = { ...INICIAL };
const suscriptores = new Set();

export function leerBackendRush() {
  return estado;
}

export function reiniciarBackendRush() {
  estado = { ...INICIAL };
  suscriptores.forEach((fn) => fn(estado));
  return estado;
}

// `parcial` puede traer valores absolutos o funciones (valorAnterior) => nuevo.
export function actualizarBackendRush(parcial) {
  const siguiente = { ...estado };
  for (const [clave, valor] of Object.entries(parcial)) {
    siguiente[clave] = typeof valor === 'function' ? valor(estado[clave]) : valor;
  }
  siguiente.estabilidad = Math.max(0, Math.min(100, Math.round(siguiente.estabilidad)));
  estado = siguiente;
  suscriptores.forEach((fn) => fn(estado));
  return estado;
}

export function suscribirBackendRush(fn) {
  suscriptores.add(fn);
  return () => suscriptores.delete(fn);
}
