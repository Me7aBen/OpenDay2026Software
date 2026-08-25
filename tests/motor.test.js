// Pruebas del motor y del contenido. Se corren con `npm test` (node --test),
// sin runner ni dependencias nuevas: todo lo que se prueba acá es JS puro.
//
// Su razón de ser es la migración a plataforma vocacional: el shell exterior
// cambia entero, y estas pruebas son el contrato que garantiza que "Código
// Cero", "Luz para Ccorca" y "El Pedido Fantasma" se siguen pudiendo jugar de
// principio a fin.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { gameReducer, estadoInicial, crearEstadoConEscenario } from '../src/engine/gameReducer.js';
import { encontrarEpilogo, puntajeMaximoEscenario } from '../src/engine/gameEngine.js';
import { puntajeMaximoDecision } from '../src/lib/perfilVocacional.js';
import { estadoMisiones } from '../src/engine/misiones.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

function leerEscenario(archivo) {
  return JSON.parse(readFileSync(join(RAIZ, 'src/content', archivo), 'utf8'));
}

const ESCENARIOS = {
  'codigo-cero': leerEscenario('codigo-cero.json'),
  'ccorca-v2': leerEscenario('ccorca-v2.json'),
  'pedido-fantasma': leerEscenario('pedido-fantasma.json'),
};

// Elige, para cada mecánica, la respuesta que un jugador perfecto daría.
// Devuelve [opcionIds, puntajeDirecto] tal como los manda el minijuego.
function respuestaPerfecta(decision) {
  const meta = decision.metaMinijuego ?? {};
  switch (decision.tipoInteraccion) {
    case 'seleccion-multiple':
      return [decision.opciones.filter((o) => o.esCorrecta).map((o) => o.id), undefined];
    case 'mapa-calor':
      return [(meta.zonasClicables ?? []).filter((z) => z.esCritica).map((z) => z.id), undefined];
    case 'seleccion-cards': {
      const mejor = [...(meta.imagenes ?? [])].sort((a, b) => (b.puntaje ?? 0) - (a.puntaje ?? 0))[0];
      return [[mejor?.id ?? 'x'], undefined];
    }
    case 'arquitectura-nodos':
      return [['arquitectura'], (meta.pasos ?? []).reduce((t, p) => t + (p.puntosMax ?? 0), 0)];
    case 'ordenar-pasos':
      return [[meta.idRespuesta ?? 'orden-correcto'], meta.puntosMax ?? 0];
    case 'circuito-conexiones':
    case 'detectar-intruso':
    case 'mecanografia-codigo':
    case 'puerta-seguridad':
    case 'flow-debugger':
    case 'traza-peticiones':
    case 'revelar-codigo':
    case 'deploy-secuencia':
      return [[decision.id], meta.puntosMax ?? 0];
    default: {
      const mejor = [...decision.opciones].sort((a, b) => (b.puntaje ?? 0) - (a.puntaje ?? 0))[0];
      return [[mejor.id], undefined];
    }
  }
}

// Juega el escenario completo respondiendo siempre lo mejor posible.
function jugarEscenario(escenario) {
  let state = crearEstadoConEscenario({ ...estadoInicial }, escenario);
  state = { ...state, pantalla: 'jugando' };
  let guardia = 0;

  while (state.pantalla === 'jugando') {
    if (guardia++ > 200) throw new Error('El escenario no termina: posible bucle en el reducer');
    const fase = state.escenario.fases[state.faseIndex];
    const decision = fase.decisiones[state.decisionIndex];
    assert.ok(decision, `Fase ${fase.id} sin decisión en índice ${state.decisionIndex}`);

    const [opcionIds, puntajeDirecto] = respuestaPerfecta(decision);
    state = gameReducer(state, {
      type: 'RESPONDER_DECISION',
      decisionId: decision.id,
      opcionIds,
      puntajeDirecto,
    });
    state = gameReducer(state, { type: 'SIGUIENTE_DECISION' });
  }

  return state;
}

for (const [id, escenario] of Object.entries(ESCENARIOS)) {
  test(`${id}: el JSON cumple el contrato de escenario`, () => {
    assert.equal(escenario.id, id);
    assert.ok(escenario.titulo, 'falta título');
    assert.ok(escenario.cliente?.nombre, 'falta cliente');
    assert.ok(escenario.fases.length >= 1, 'sin fases');

    const ids = new Set();
    for (const fase of escenario.fases) {
      assert.ok(fase.id, 'fase sin id');
      assert.ok(fase.decisiones.length >= 1, `fase ${fase.id} sin decisiones`);
      // `tiempoSegFase` es opcional (Ccorca no lo declara y sus fases no se
      // auto-adelantan). Lo que no se acepta es que exista con otro tipo.
      if (fase.tiempoSegFase !== undefined) {
        assert.equal(typeof fase.tiempoSegFase, 'number', `fase ${fase.id}: tiempoSegFase inválido`);
      }
      assert.ok(
        fase.explicacion || fase.historieta?.length,
        `fase ${fase.id} sin explicación ni historieta`,
      );
      for (const decision of fase.decisiones) {
        assert.ok(!ids.has(decision.id), `id de decisión duplicado: ${decision.id}`);
        ids.add(decision.id);
        assert.ok(decision.tipoInteraccion, `decisión ${decision.id} sin tipoInteraccion`);
        assert.ok(decision.pregunta, `decisión ${decision.id} sin pregunta`);
      }
    }
  });

  test(`${id}: todo tipoInteraccion tiene minijuego registrado`, () => {
    // Se lee el índice como texto porque es JSX y no se puede importar desde
    // node sin transpilar. Alcanza: lo que importa es que la clave exista.
    const indice = readFileSync(join(RAIZ, 'src/minigames/index.js'), 'utf8');
    for (const fase of escenario.fases) {
      for (const decision of fase.decisiones) {
        const tipo = decision.tipoInteraccion;
        assert.ok(
          indice.includes(`'${tipo}'`) || new RegExp(`\\b${tipo}:`).test(indice),
          `tipoInteraccion sin renderer: ${tipo}`,
        );
      }
    }
  });

  test(`${id}: se juega de principio a fin y produce resultado`, () => {
    const final = jugarEscenario(escenario);
    assert.equal(final.pantalla, 'resultado');
    assert.ok(final.resultado, 'no hay resultado');
    assert.ok(final.resultado.total > 0, 'puntaje total en cero jugando perfecto');
    assert.ok(final.resultado.epilogo, 'no se encontró epílogo');
    assert.ok(final.completadas[escenario.id], 'la misión no quedó anotada como completada');
  });

  test(`${id}: los epílogos cubren todo el rango de puntaje`, () => {
    for (const puntaje of [0, 199, 400, 650, 799, 800, 999, 1000]) {
      assert.ok(encontrarEpilogo(escenario, puntaje), `sin epílogo para ${puntaje}`);
    }
  });

  test(`${id}: el techo de puntaje de retos es coherente`, () => {
    const maximo = puntajeMaximoEscenario(escenario);
    assert.ok(maximo > 0, 'techo de puntaje en cero');
    const suma = escenario.fases.reduce(
      (t, f) => t + f.decisiones.reduce((x, d) => x + puntajeMaximoDecision(d), 0),
      0,
    );
    assert.equal(maximo, suma);
  });
}

test('el reducer termina la partida cuando se agota el tiempo global', () => {
  let state = crearEstadoConEscenario({ ...estadoInicial }, ESCENARIOS['codigo-cero']);
  state = { ...state, pantalla: 'jugando', tiempoGlobalRestante: 1 };
  state = gameReducer(state, { type: 'TICK' });
  assert.equal(state.pantalla, 'resultado');
});

test('modo libre: iniciar una simulación no exige jugador registrado', () => {
  const state = gameReducer(
    { ...estadoInicial },
    { type: 'INICIAR_SIMULACION_LIBRE', escenario: ESCENARIOS['pedido-fantasma'] },
  );
  assert.equal(state.modo, 'libre');
  assert.ok(state.jugador, 'el modo libre debe crear un jugador anónimo');
  assert.notEqual(state.pantalla, 'registro');
});

test('modo libre: el reloj no corre si la simulación no lo pide', () => {
  const escenario = ESCENARIOS['pedido-fantasma'];
  assert.equal(
    escenario.presentacion?.temporizador ?? true,
    false,
    'El Pedido Fantasma debe declarar temporizador: false (§55)',
  );
  let state = gameReducer({ ...estadoInicial }, { type: 'INICIAR_SIMULACION_LIBRE', escenario });
  state = { ...state, pantalla: 'jugando' };
  const antes = state.tiempoGlobalRestante;
  state = gameReducer(state, { type: 'TICK' });
  assert.equal(state.tiempoGlobalRestante, antes, 'el reloj avanzó con el temporizador apagado');
});

test('las simulaciones no se bloquean entre sí en el catálogo libre', () => {
  const lista = Object.values(ESCENARIOS);
  const estados = estadoMisiones(lista, {}, { secuencial: false });
  assert.ok(estados.every((m) => m.estado !== 'bloqueada'), 'hay simulaciones bloqueadas');
});

test('el modo evento conserva la secuencia obligatoria de la jornada', () => {
  const lista = [ESCENARIOS['codigo-cero'], ESCENARIOS['ccorca-v2']];
  const estados = estadoMisiones(lista, {});
  assert.equal(estados[0].estado, 'disponible');
  assert.equal(estados[1].estado, 'bloqueada');
});
