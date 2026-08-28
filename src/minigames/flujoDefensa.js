// BACKEND RUSH · NIVEL 2 — lógica pura del tablero "Construye la defensa".
//
// Está separada del componente a propósito: es JS sin JSX, así que `npm test`
// la ejecuta directamente y las reglas del puzzle quedan cubiertas por pruebas
// en vez de por clics a mano.
//
// Acá NO hay textos de narrativa: solo ids, estructura y reglas. Cada
// diagnóstico devuelve un `codigo` y el JSON del escenario decide qué se le
// dice al estudiante. Es la regla 1 de docs/CLAUDE.md.

// --- Estructura del tablero -------------------------------------------------
//
//          [ PAGO ]            (fijo, entrada)
//              |
//        ( slot: verificar )
//              |
//        < ¿YA EXISTE? >       (fijo, decisión)
//          /         \
//        SÍ           NO
//         |            |
//   ( slot: si )  ( slot: no )
//                      |
//                ( slot: stock )
//                      |
//                ( slot: enviar )

export const SLOTS = [
  { id: 'verificar', rama: 'principal', esperado: 'verificar-id' },
  { id: 'si', rama: 'si', esperado: 'bloquear' },
  { id: 'no', rama: 'no', esperado: 'crear' },
  { id: 'stock', rama: 'no', esperado: 'actualizar-stock' },
  { id: 'enviar', rama: 'no', esperado: 'enviar' },
];

// Aristas del grafo, en el orden en que se dibujan y se iluminan.
export const ARISTAS = [
  { id: 'e-pago', desde: 'pago', hasta: 'verificar', tono: 'cyan' },
  { id: 'e-verificar', desde: 'verificar', hasta: 'decision', tono: 'cyan' },
  { id: 'e-si', desde: 'decision', hasta: 'si', tono: 'rojo', etiqueta: 'SÍ' },
  { id: 'e-no', desde: 'decision', hasta: 'no', tono: 'verde', etiqueta: 'NO' },
  { id: 'e-stock', desde: 'no', hasta: 'stock', tono: 'ambar' },
  { id: 'e-enviar', desde: 'stock', hasta: 'enviar', tono: 'cyan' },
];

// Piezas que resuelven el nivel. Las demás (reintento, rate-limit, cola) se
// muestran bloqueadas: existen en el mundo del juego y se usan más adelante,
// pero tenerlas activas acá solo agrega ruido (§6 del brief).
export const PIEZAS_ACTIVAS = [
  'verificar-id',
  'bloquear',
  'crear',
  'actualizar-stock',
  'enviar',
];

export function tableroVacio() {
  return Object.fromEntries(SLOTS.map((slot) => [slot.id, null]));
}

export function tableroCompleto(tablero) {
  return SLOTS.every((slot) => tablero[slot.id]);
}

export function piezasColocadas(tablero) {
  return Object.values(tablero).filter(Boolean);
}

// --- Validación -------------------------------------------------------------
//
// Se valida la RELACIÓN lógica, y el orden de las comprobaciones importa: se
// informa primero el error más grave y más instructivo, no el primero que
// aparece en el tablero. Un flujo que crea antes de verificar tiene el mismo
// bug que el estudiante acaba de descubrir en el nivel 1, y eso es lo que hay
// que decirle — no "falta una pieza en el paso 2".

export function validarFlujo(tablero) {
  if (!tableroCompleto(tablero)) {
    return { ok: false, codigo: 'incompleto', slots: [] };
  }

  const enVerificar = tablero.verificar;
  const enSi = tablero.si;
  const enNo = tablero.no;
  const enStock = tablero.stock;
  const enEnviar = tablero.enviar;

  // 1. Crear antes de verificar: es literalmente el bug del pedido fantasma.
  if (enVerificar === 'crear') {
    return { ok: false, codigo: 'verificar-tarde', slots: ['verificar'] };
  }

  // 2. Las dos ramas crean: el duplicado entra igual por la rama SÍ.
  if (enSi === 'crear' && enNo === 'crear') {
    return { ok: false, codigo: 'ambas-crean', slots: ['si', 'no'] };
  }

  // 3. La rama SÍ (el pedido YA existe) no puede terminar creándolo.
  if (enSi === 'crear') {
    return { ok: false, codigo: 'si-crea', slots: ['si'] };
  }

  // 4. Sin verificación no hay defensa posible.
  if (enVerificar !== 'verificar-id') {
    return { ok: false, codigo: 'falta-verificar', slots: ['verificar'] };
  }

  // 5. La rama SÍ debe bloquear.
  if (enSi !== 'bloquear') {
    return { ok: false, codigo: 'si-mal', slots: ['si'] };
  }

  // 6. La rama NO debe crear.
  if (enNo !== 'crear') {
    return { ok: false, codigo: 'no-mal', slots: ['no'] };
  }

  // 7. Inventario y envío, en ese orden.
  if (enStock !== 'actualizar-stock') {
    return { ok: false, codigo: 'falta-stock', slots: ['stock'] };
  }
  if (enEnviar !== 'enviar') {
    return { ok: false, codigo: 'falta-enviar', slots: ['enviar'] };
  }

  return { ok: true, codigo: 'ok', slots: [] };
}

// --- Recorridos del pulso ---------------------------------------------------
//
// Qué aristas se encienden, en qué orden, en cada simulación. Se calcula desde
// el tablero real: si el flujo está mal, el pulso recorre lo que el estudiante
// construyó y se detiene donde revienta. Ver el propio flujo fallar es la
// mitad de la enseñanza.

export const RUTA_PEDIDO_NUEVO = ['e-pago', 'e-verificar', 'e-no', 'e-stock', 'e-enviar'];
export const RUTA_REINTENTO = ['e-pago', 'e-verificar', 'e-si'];

export function rutaDeFallo(codigo) {
  switch (codigo) {
    case 'verificar-tarde':
      // El pulso llega al primer slot y ahí ya se creó el pedido duplicado.
      return ['e-pago'];
    case 'ambas-crean':
    case 'si-crea':
    case 'si-mal':
      return ['e-pago', 'e-verificar', 'e-si'];
    case 'falta-verificar':
      return ['e-pago'];
    case 'no-mal':
      return ['e-pago', 'e-verificar', 'e-no'];
    case 'falta-stock':
      return ['e-pago', 'e-verificar', 'e-no'];
    case 'falta-enviar':
      return ['e-pago', 'e-verificar', 'e-no', 'e-stock'];
    default:
      return ['e-pago'];
  }
}

// --- Puntaje ----------------------------------------------------------------
//
// El techo y los castigos vienen del JSON; acá solo vive la fórmula, para que
// se pueda probar sin montar React.

export function calcularPuntaje({
  intentos = 1,
  pistasUsadas = 0,
  puntosMax = 185,
  puntosMin = 65,
  penalizacionPorIntento = 40,
  penalizacionPorPista = 15,
} = {}) {
  const bruto =
    puntosMax - (intentos - 1) * penalizacionPorIntento - pistasUsadas * penalizacionPorPista;
  return Math.max(puntosMin, Math.min(puntosMax, bruto));
}

// "Flujo perfecto": resuelto al primer intento y sin pistas (§27).
export function esFlujoPerfecto({ intentos, pistasUsadas }) {
  return intentos === 1 && pistasUsadas === 0;
}
