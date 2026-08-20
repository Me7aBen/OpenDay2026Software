// Lógica pura del puzzle de circuito. Sin React y sin DOM: son funciones que
// reciben datos y devuelven datos, así que se pueden razonar (y testear) sin
// montar nada.
//
// --- Modelo ---------------------------------------------------------------
// El tablero es una lista plana de celdas más el número de columnas. Cada celda
// declara qué lados suyos tienen cable, en la rotación 0:
//
//   conexiones = [N, E, S, O]   // índices 0,1,2,3
//
// Girar la pieza 90° en sentido horario mueve el cable del lado i al lado
// (i+1)%4. Eso es TODO lo que hace una rotación: no hay geometría, solo un
// desplazamiento circular de cuatro booleanos.
//
// Dos celdas vecinas están unidas si LAS DOS tienen cable en el lado que da a
// la otra. Un cable que apunta a una pared, o a un vecino que no le devuelve el
// cable, simplemente no conecta.

export const N = 0;
export const E = 1;
export const S = 2;
export const O = 3;

// Formas base en rotación 0.
export const FORMAS = {
  recta: [true, false, true, false], // N-S
  curva: [true, true, false, false], // N-E
  te: [true, true, true, false], // N-E-S
  vacia: [false, false, false, false],
};

// El lado opuesto: por dónde entra el cable del vecino.
const OPUESTO = { [N]: S, [E]: O, [S]: N, [O]: E };

export function conexionesDe(celda) {
  const base = celda.conexiones ?? FORMAS[celda.forma] ?? FORMAS.vacia;
  const rot = (((celda.rotacion ?? 0) % 4) + 4) % 4;
  const salida = [false, false, false, false];
  for (let i = 0; i < 4; i += 1) {
    if (base[i]) salida[(i + rot) % 4] = true;
  }
  return salida;
}

// Gira una celda. Las fijas (origen, seguridad, destinos, nodo infectado) no se
// mueven: son el enunciado del problema, no la solución.
export function rotarCelda(celda) {
  if (celda.fija) return celda;
  return { ...celda, rotacion: ((celda.rotacion ?? 0) + 1) % 4 };
}

export function rotarEn(celdas, indice) {
  const objetivo = celdas[indice];
  if (!objetivo || objetivo.fija) return celdas;
  return celdas.map((c, i) => (i === indice ? rotarCelda(c) : c));
}

// Índice del vecino en un lado dado, o null si se sale del tablero.
function vecino(indice, lado, columnas, total) {
  const fila = Math.floor(indice / columnas);
  const col = indice % columnas;
  if (lado === N) return fila > 0 ? indice - columnas : null;
  if (lado === S) return indice + columnas < total ? indice + columnas : null;
  if (lado === O) return col > 0 ? indice - 1 : null;
  if (lado === E) return col < columnas - 1 ? indice + 1 : null;
  return null;
}

// Recorre el circuito desde el origen y reporta qué se alcanzó.
//
// Devuelve:
//   alcanzados       Set de índices conectados al origen
//   tramos           pares "a-b" de celdas unidas dentro de lo alcanzado
//                    (los usa el render para pintar el pulso de energía)
//   destinosOk       ids de los destinos alcanzados
//   destinosFaltan   ids de los destinos que aún no llegan
//   seguridadOk      true si la ruta pasa por el nodo de seguridad
//   tocaInfectado    true si la ruta llega al nodo infectado
//   resuelto         los destinos requeridos, con seguridad y sin infectado
export function analizarCircuito(tablero) {
  const { celdas, columnas } = tablero;
  const total = celdas.length;
  const origen = celdas.findIndex((c) => c.rol === 'origen');

  const alcanzados = new Set();
  const tramos = new Set();

  if (origen >= 0) {
    const cola = [origen];
    alcanzados.add(origen);
    while (cola.length) {
      const actual = cola.shift();
      const conex = conexionesDe(celdas[actual]);
      for (let lado = 0; lado < 4; lado += 1) {
        if (!conex[lado]) continue;
        const vec = vecino(actual, lado, columnas, total);
        if (vec === null) continue;
        if (!conexionesDe(celdas[vec])[OPUESTO[lado]]) continue;
        // El tramo se registra aunque el vecino ya estuviera visitado: es la
        // arista lo que se dibuja, no el nodo.
        tramos.add([actual, vec].sort((a, b) => a - b).join('-'));
        if (!alcanzados.has(vec)) {
          alcanzados.add(vec);
          cola.push(vec);
        }
      }
    }
  }

  const destinos = celdas.filter((c) => c.rol === 'destino');
  const destinosOk = destinos
    .filter((c) => alcanzados.has(celdas.indexOf(c)))
    .map((c) => c.id);
  const destinosFaltan = destinos.filter((c) => !destinosOk.includes(c.id)).map((c) => c.id);

  const indiceSeguridad = celdas.findIndex((c) => c.rol === 'seguridad');
  const indiceInfectado = celdas.findIndex((c) => c.rol === 'infectado');

  // Si el nivel no declara nodo de seguridad, no se exige pasar por ninguno.
  const seguridadOk = indiceSeguridad < 0 || alcanzados.has(indiceSeguridad);
  const tocaInfectado = indiceInfectado >= 0 && alcanzados.has(indiceInfectado);

  return {
    alcanzados,
    tramos,
    destinosOk,
    destinosFaltan,
    seguridadOk,
    tocaInfectado,
    resuelto: destinosFaltan.length === 0 && seguridadOk && !tocaInfectado && destinos.length > 0,
  };
}

// Puntaje del circuito. Premia la eficiencia pero garantiza el piso `puntosMin`
// a quien lo resuelva: equivocarse muchas veces cuesta puntos, no la partida.
export function puntuarCircuito({ resuelto, giros, reinicios, meta = {} }) {
  if (!resuelto) return 0;
  const max = meta.puntosMax ?? 200;
  const min = meta.puntosMin ?? 80;
  const optimo = meta.girosOptimos ?? 9;
  const penGiro = meta.penalizacionPorGiroExtra ?? 4;
  const penReinicio = meta.penalizacionPorReinicio ?? 15;
  const extra = Math.max(0, giros - optimo);
  return Math.max(min, max - extra * penGiro - reinicios * penReinicio);
}

// Copia profunda ligera del tablero declarado en el JSON. Se usa al montar y al
// reiniciar: sin esto, girar una pieza mutaría el objeto importado del JSON y el
// "reiniciar" devolvería el tablero ya girado.
export function clonarCeldas(celdas) {
  return celdas.map((c) => ({ ...c, rotacion: c.rotacion ?? 0 }));
}
