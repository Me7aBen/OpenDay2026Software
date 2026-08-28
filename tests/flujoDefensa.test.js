// BACKEND RUSH · NIVEL 2 — pruebas de la lógica del puzzle.
//
// La validación vive en `src/minigames/flujoDefensa.js` (JS puro, sin JSX)
// justamente para poder probarla acá sin montar React ni simular clics.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  RUTA_PEDIDO_NUEVO,
  RUTA_REINTENTO,
  SLOTS,
  calcularPuntaje,
  esFlujoPerfecto,
  rutaDeFallo,
  tableroVacio,
  validarFlujo,
} from '../src/minigames/flujoDefensa.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const ESCENARIO = JSON.parse(
  readFileSync(join(RAIZ, 'src/content/pedido-fantasma.json'), 'utf8'),
);
const NIVEL2 = ESCENARIO.fases
  .find((f) => f.id === 'flujo')
  .decisiones.find((d) => d.id === 'flujo-1');

function tablero(parcial) {
  return { ...tableroVacio(), ...parcial };
}

const SOLUCION = {
  verificar: 'verificar-id',
  si: 'bloquear',
  no: 'crear',
  stock: 'actualizar-stock',
  enviar: 'enviar',
};

test('caso 1 — flujo correcto: verificar, bifurcar, bloquear o crear', () => {
  const resultado = validarFlujo(tablero(SOLUCION));
  assert.equal(resultado.ok, true);
  assert.equal(resultado.codigo, 'ok');
});

test('caso 2 — verificar DESPUÉS de crear: falla y lo dice', () => {
  const resultado = validarFlujo(
    tablero({ ...SOLUCION, verificar: 'crear', no: 'verificar-id' }),
  );
  assert.equal(resultado.ok, false);
  assert.equal(resultado.codigo, 'verificar-tarde');
  assert.deepEqual(resultado.slots, ['verificar']);
});

test('caso 3 — la rama SÍ crea el pedido: falla', () => {
  const resultado = validarFlujo(tablero({ ...SOLUCION, si: 'crear', no: 'bloquear' }));
  assert.equal(resultado.ok, false);
  assert.equal(resultado.codigo, 'si-crea');
});

test('caso 3b — las DOS ramas crean: se informa el error de lógica', () => {
  const resultado = validarFlujo(
    tablero({ verificar: 'verificar-id', si: 'crear', no: 'crear', stock: 'actualizar-stock', enviar: 'enviar' }),
  );
  assert.equal(resultado.ok, false);
  assert.equal(resultado.codigo, 'ambas-crean');
});

test('caso 4 — falta actualizar stock: falla señalando esa ranura', () => {
  const resultado = validarFlujo(tablero({ ...SOLUCION, stock: 'enviar', enviar: 'actualizar-stock' }));
  assert.equal(resultado.ok, false);
  assert.equal(resultado.codigo, 'falta-stock');
  assert.deepEqual(resultado.slots, ['stock']);
});

test('un tablero incompleto no se puede probar', () => {
  const resultado = validarFlujo(tablero({ verificar: 'verificar-id' }));
  assert.equal(resultado.ok, false);
  assert.equal(resultado.codigo, 'incompleto');
});

test('caso 5 — el reintento del mismo ID recorre la rama SÍ y termina en el bloqueo', () => {
  // La ruta del reintento no puede pasar por CREAR: si lo hiciera, el nivel
  // estaría enseñando exactamente el bug que viene a corregir.
  assert.deepEqual(RUTA_REINTENTO, ['e-pago', 'e-verificar', 'e-si']);
  assert.ok(!RUTA_REINTENTO.includes('e-no'));
  // Y el pedido nuevo sí recorre la rama NO completa.
  assert.deepEqual(RUTA_PEDIDO_NUEVO, ['e-pago', 'e-verificar', 'e-no', 'e-stock', 'e-enviar']);
});

test('cada fallo tiene un recorrido de pulso y un texto propio', () => {
  const codigos = [
    'verificar-tarde',
    'ambas-crean',
    'si-crea',
    'falta-verificar',
    'si-mal',
    'no-mal',
    'falta-stock',
    'falta-enviar',
  ];
  for (const codigo of codigos) {
    assert.ok(rutaDeFallo(codigo).length > 0, `sin ruta de pulso: ${codigo}`);
    const fallo = NIVEL2.metaMinijuego.fallos[codigo];
    assert.ok(fallo, `sin texto para el fallo: ${codigo}`);
    assert.ok(fallo.mensaje && fallo.valeria, `fallo incompleto: ${codigo}`);
    assert.ok(fallo.consola?.length, `fallo sin consola: ${codigo}`);
  }
});

test('el puntaje respeta el techo, el piso y los castigos', () => {
  const config = {
    puntosMax: 185,
    puntosMin: 65,
    penalizacionPorIntento: 40,
    penalizacionPorPista: 15,
  };
  assert.equal(calcularPuntaje({ ...config, intentos: 1, pistasUsadas: 0 }), 185);
  assert.equal(calcularPuntaje({ ...config, intentos: 2, pistasUsadas: 0 }), 145);
  assert.equal(calcularPuntaje({ ...config, intentos: 1, pistasUsadas: 2 }), 155);
  // Nunca baja del piso, por mal que salga.
  assert.equal(calcularPuntaje({ ...config, intentos: 9, pistasUsadas: 3 }), 65);
});

test('"flujo perfecto" es al primer intento y sin pistas', () => {
  assert.equal(esFlujoPerfecto({ intentos: 1, pistasUsadas: 0 }), true);
  assert.equal(esFlujoPerfecto({ intentos: 2, pistasUsadas: 0 }), false);
  assert.equal(esFlujoPerfecto({ intentos: 1, pistasUsadas: 1 }), false);
});

test('el contenido declara todas las piezas que el tablero necesita', () => {
  const piezas = NIVEL2.metaMinijuego.piezas.map((p) => p.id);
  for (const slot of SLOTS) {
    assert.ok(piezas.includes(slot.esperado), `falta la pieza ${slot.esperado} en el JSON`);
  }
  // Las piezas de niveles futuros están, pero bloqueadas: no deben poder
  // colocarse ni confundir en este nivel (§6).
  for (const id of ['reintento', 'rate-limit', 'cola']) {
    const pieza = NIVEL2.metaMinijuego.piezas.find((p) => p.id === id);
    assert.ok(pieza, `falta la pieza ${id}`);
    assert.equal(pieza.bloqueada, true, `${id} debería estar bloqueada en el nivel 2`);
  }
});

test('el nivel 2 conserva su contribución de 185 puntos', () => {
  assert.equal(NIVEL2.metaMinijuego.puntosMax, 185);
  assert.equal(NIVEL2.tipoInteraccion, 'flow-debugger');
});

// --- Estado compartido entre niveles (§5) -----------------------------------

test('la estabilidad viaja del nivel 1 al nivel 2', async () => {
  const { leerBackendRush, actualizarBackendRush, reiniciarBackendRush } = await import(
    '../src/features/simulations/backendRush.js'
  );

  reiniciarBackendRush();
  // El sistema arranca dañado: los pedidos fantasma ya están en producción.
  assert.equal(leerBackendRush().estabilidad, 72);

  // Nivel 1 perfecto: 3 duplicados cazados, ninguno escapado.
  actualizarBackendRush({
    nivelActual: 1,
    pedidosProcesados: (n) => n + 9,
    duplicadosDetectados: (n) => n + 3,
    duplicadosBloqueados: (n) => n + 3,
    estabilidad: (n) => n + 3 * 4,
  });
  const trasNivel1 = leerBackendRush();
  assert.equal(trasNivel1.estabilidad, 84);
  assert.equal(trasNivel1.duplicadosBloqueados, 3);

  // Nivel 2 resuelto.
  actualizarBackendRush({
    nivelActual: 2,
    duplicadosBloqueados: (n) => n + 1,
    pedidosProcesados: (n) => n + 1,
    estabilidad: (n) => n + 8,
  });
  const trasNivel2 = leerBackendRush();
  assert.equal(trasNivel2.estabilidad, 92);
  assert.equal(trasNivel2.duplicadosBloqueados, 4);
  assert.equal(trasNivel2.nivelActual, 2);
});

test('un flujo fallido en el nivel 2 baja la estabilidad y suma un error', async () => {
  const { leerBackendRush, actualizarBackendRush, reiniciarBackendRush } = await import(
    '../src/features/simulations/backendRush.js'
  );
  reiniciarBackendRush();
  actualizarBackendRush({ errores: (n) => n + 1, estabilidad: (n) => n - 6 });
  assert.equal(leerBackendRush().estabilidad, 66);
  assert.equal(leerBackendRush().errores, 1);
});

test('la estabilidad nunca se sale de 0..100', async () => {
  const { leerBackendRush, actualizarBackendRush, reiniciarBackendRush } = await import(
    '../src/features/simulations/backendRush.js'
  );
  reiniciarBackendRush();
  actualizarBackendRush({ estabilidad: () => 250 });
  assert.equal(leerBackendRush().estabilidad, 100);
  actualizarBackendRush({ estabilidad: () => -80 });
  assert.equal(leerBackendRush().estabilidad, 0);
  reiniciarBackendRush();
  assert.equal(leerBackendRush().estabilidad, 72);
});
