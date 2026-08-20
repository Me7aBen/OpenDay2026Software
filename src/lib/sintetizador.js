// Sintetizador de música y efectos con Web Audio API.
//
// ¿Por qué generar el sonido en vez de traer archivos? Tres razones concretas:
//   1. Licencias: todo lo que suena acá nace de osciladores creados en este
//      archivo. No hay ni un sample descargado, así que no hay procedencia que
//      auditar ni atribución que arrastrar.
//   2. Peso: tres pistas de synthwave en mp3 son varios MB. Esto son ~9 KB de
//      JS y no agrega ni una petición de red.
//   3. Adaptabilidad: cambiar de 'misterio' a 'tension' es cambiar un patrón,
//      no hacer crossfade entre dos archivos que hay que precargar.
//
// Reglas que respeta (docs/CLAUDE.md, regla 7: el audio es decorativo):
//   - Todo va envuelto en try/catch. Si el navegador no soporta Web Audio, si
//     el contexto no arranca o si algo falla a mitad, la partida sigue igual.
//   - El AudioContext se crea recién cuando alguien pide sonido, y arranca
//     suspendido hasta que haya un gesto del usuario (política de autoplay).
//   - `detener()` mata el scheduler y todos los nodos vivos. No queda ni un
//     oscilador sonando ni un interval corriendo al salir de la partida.
//
// --- Cómo funciona el scheduler -------------------------------------------
// El patrón estándar de Web Audio: un setInterval "tonto" cada 25ms que mira
// qué notas caen en los próximos 120ms y las agenda con el reloj de audio
// (ctx.currentTime), que es preciso al microsegundo. Programar notas con
// setTimeout directamente suena inestable porque el timer de JS se desplaza
// con la carga de la página; agendarlas contra el reloj de audio, no.

const LOOKAHEAD_MS = 25;
const VENTANA_SEG = 0.12;
const PASOS_POR_COMPAS = 16;

// Frecuencia de un semitono relativo a una nota raíz, en temperamento igual.
function nota(raizHz, semitonos) {
  return raizHz * 2 ** (semitonos / 12);
}

// --- Definición de las pistas ---------------------------------------------
// Cada pista es un compás de 16 pasos. `null` es silencio. Los números son
// semitonos sobre la raíz. Están escritas a mano para que suenen a synthwave:
// bajo marcando el pulso, arpegio corto arriba y un pad sostenido de fondo.

const PISTAS = {
  // Investigación: lento, escala menor, mucho aire entre notas. La idea es que
  // acompañe a alguien leyendo pistas, no que lo apure.
  misterio: {
    bpm: 84,
    raiz: 55, // La1
    ondaBajo: 'triangle',
    ondaArpegio: 'square',
    ganancia: 0.5,
    corteFiltro: 1600,
    bajo: [0, null, null, null, 0, null, null, null, -5, null, null, null, -3, null, null, null],
    arpegio: [null, null, 12, null, 15, null, null, 19, null, 15, null, null, 12, null, null, null],
    pad: [0, 3, 7],
  },
  // Ataque en curso: más rápido, bajo en corcheas constantes y un arpegio que
  // no deja huecos. Sube la sensación de que el tiempo corre.
  tension: {
    bpm: 128,
    raiz: 55,
    ondaBajo: 'sawtooth',
    ondaArpegio: 'square',
    ganancia: 0.42,
    corteFiltro: 2200,
    bajo: [0, null, 0, null, 0, null, 0, null, -2, null, -2, null, 1, null, 1, null],
    arpegio: [12, null, 15, 12, 19, null, 15, null, 12, null, 18, 15, 22, null, 19, 15],
    pad: [0, 3, 7, 10],
  },
  // Ciudad recuperada: mayor, más brillante, el bajo baja de densidad y el
  // arpegio sube. Es el único de los tres que resuelve en acorde mayor.
  resolucion: {
    bpm: 100,
    raiz: 65.41, // Do2
    ondaBajo: 'triangle',
    ondaArpegio: 'triangle',
    ganancia: 0.5,
    corteFiltro: 2800,
    bajo: [0, null, null, null, 7, null, null, null, 5, null, null, null, 7, null, null, null],
    arpegio: [12, null, 16, null, 19, null, 24, null, 19, null, 16, null, 19, null, 12, null],
    pad: [0, 4, 7, 11],
  },
};

// --- Definición de los efectos --------------------------------------------
// Cada efecto es una lista de tonos con envolvente propia. Los volúmenes son
// deliberadamente bajos: esto se usa en un laboratorio con muchas máquinas
// sonando a la vez, y un blip estridente multiplicado por 20 PCs es una
// molestia real, no un detalle.

const EFECTOS = {
  seleccion: [{ de: 620, a: 780, onda: 'square', dur: 0.06, vol: 0.1 }],
  girar: [{ de: 380, a: 300, onda: 'square', dur: 0.05, vol: 0.09 }],
  conectar: [{ de: 440, a: 880, onda: 'triangle', dur: 0.14, vol: 0.11 }],
  error: [{ de: 220, a: 165, onda: 'sawtooth', dur: 0.2, vol: 0.08 }],
  ejecutar: [{ de: 180, a: 1100, onda: 'sawtooth', dur: 0.26, vol: 0.09 }],
  codigoOk: [
    { de: 660, a: 660, onda: 'triangle', dur: 0.1, vol: 0.11 },
    { de: 990, a: 990, onda: 'triangle', dur: 0.16, vol: 0.11, retraso: 0.09 },
  ],
  deteccion: [
    { de: 880, a: 880, onda: 'square', dur: 0.05, vol: 0.09 },
    { de: 880, a: 880, onda: 'square', dur: 0.05, vol: 0.09, retraso: 0.1 },
    { de: 1180, a: 1180, onda: 'square', dur: 0.1, vol: 0.1, retraso: 0.2 },
  ],
  barrera: [{ de: 520, a: 110, onda: 'square', dur: 0.22, vol: 0.11 }],
  puzzleCompleto: [
    { de: 523, a: 523, onda: 'triangle', dur: 0.1, vol: 0.1 },
    { de: 659, a: 659, onda: 'triangle', dur: 0.1, vol: 0.1, retraso: 0.09 },
    { de: 784, a: 784, onda: 'triangle', dur: 0.1, vol: 0.1, retraso: 0.18 },
    { de: 1046, a: 1046, onda: 'triangle', dur: 0.28, vol: 0.11, retraso: 0.27 },
  ],
  ciudadRecuperada: [
    { de: 392, a: 392, onda: 'triangle', dur: 0.14, vol: 0.1 },
    { de: 523, a: 523, onda: 'triangle', dur: 0.14, vol: 0.1, retraso: 0.13 },
    { de: 659, a: 659, onda: 'triangle', dur: 0.14, vol: 0.1, retraso: 0.26 },
    { de: 784, a: 784, onda: 'triangle', dur: 0.16, vol: 0.11, retraso: 0.39 },
    { de: 1046, a: 1046, onda: 'triangle', dur: 0.5, vol: 0.12, retraso: 0.52 },
  ],
};

// --- Estado del módulo ----------------------------------------------------

let ctx = null;
let masterGain = null;
let soportado = true;
let pistaActual = null;
let idScheduler = null;
let paso = 0;
let proximoTiempo = 0;
let nodosVivos = new Set();
let volumenMusica = 0.35;
let silenciado = false;

function obtenerContexto() {
  if (!soportado) return null;
  if (ctx) return ctx;
  try {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) {
      soportado = false;
      return null;
    }
    ctx = new Ctor();
    masterGain = ctx.createGain();
    masterGain.gain.value = silenciado ? 0 : volumenMusica;
    masterGain.connect(ctx.destination);
    return ctx;
  } catch {
    soportado = false;
    return null;
  }
}

// Los nodos se registran para poder matarlos de golpe en `detener()`. Sin esto,
// cambiar de pista dejaría sonando la cola de las notas ya agendadas.
function registrar(nodo) {
  nodosVivos.add(nodo);
  nodo.onended = () => nodosVivos.delete(nodo);
}

function matarNodos() {
  nodosVivos.forEach((n) => {
    try {
      n.stop();
      n.disconnect();
    } catch {
      // Ya estaba detenido: no hay nada que hacer.
    }
  });
  nodosVivos = new Set();
}

// Una nota = oscilador -> ganancia con envolvente ADSR simplificada -> destino.
// La envolvente importa: sin ella, cada nota arranca y corta con un "click"
// audible, que es el sonido clásico de Web Audio mal usado.
function tocarNota({ freq, inicio, dur, onda, vol, destino }) {
  const c = ctx;
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = onda;
  osc.frequency.setValueAtTime(freq, inicio);
  const ataque = Math.min(0.02, dur * 0.3);
  g.gain.setValueAtTime(0, inicio);
  g.gain.linearRampToValueAtTime(vol, inicio + ataque);
  g.gain.exponentialRampToValueAtTime(0.0001, inicio + dur);
  osc.connect(g);
  g.connect(destino ?? masterGain);
  osc.start(inicio);
  osc.stop(inicio + dur + 0.02);
  registrar(osc);
}

// Agenda todos los pasos del patrón que caen dentro de la ventana de lookahead.
function agendar() {
  const c = ctx;
  const pista = PISTAS[pistaActual];
  if (!c || !pista) return;

  const segPorPaso = 60 / pista.bpm / 4; // 16 pasos = 4 tiempos

  while (proximoTiempo < c.currentTime + VENTANA_SEG) {
    const i = paso % PASOS_POR_COMPAS;

    const semiBajo = pista.bajo[i];
    if (semiBajo !== null && semiBajo !== undefined) {
      tocarNota({
        freq: nota(pista.raiz, semiBajo),
        inicio: proximoTiempo,
        dur: segPorPaso * 1.8,
        onda: pista.ondaBajo,
        vol: pista.ganancia * 0.5,
      });
    }

    const semiArp = pista.arpegio[i];
    if (semiArp !== null && semiArp !== undefined) {
      tocarNota({
        freq: nota(pista.raiz, semiArp),
        inicio: proximoTiempo,
        dur: segPorPaso * 0.9,
        onda: pista.ondaArpegio,
        vol: pista.ganancia * 0.22,
      });
    }

    // El pad entra solo al inicio de cada compás y dura el compás entero: es
    // el colchón armónico que hace que esto suene a synthwave y no a bips.
    if (i === 0) {
      pista.pad.forEach((semi) => {
        tocarNota({
          freq: nota(pista.raiz, semi + 12),
          inicio: proximoTiempo,
          dur: segPorPaso * PASOS_POR_COMPAS,
          onda: 'sine',
          vol: pista.ganancia * 0.1,
        });
      });
    }

    proximoTiempo += segPorPaso;
    paso += 1;
  }
}

// --- API pública ----------------------------------------------------------

// Arranca (o cambia) la pista de música. Idempotente: pedir la pista que ya
// está sonando no la reinicia, así cambiar de decisión dentro de la misma fase
// no corta la música.
export function reproducirPista(nombre) {
  if (!PISTAS[nombre]) return;
  if (pistaActual === nombre && idScheduler !== null) return;

  const c = obtenerContexto();
  if (!c) return;

  detenerPista();
  pistaActual = nombre;
  paso = 0;

  try {
    // El contexto nace suspendido si todavía no hubo gesto del usuario. resume()
    // devuelve una promesa que se rechaza en ese caso: no es un error nuestro,
    // simplemente todavía no toca sonar.
    const arrancar = () => {
      proximoTiempo = c.currentTime + 0.06;
      agendar();
      idScheduler = setInterval(agendar, LOOKAHEAD_MS);
    };
    if (c.state === 'suspended') {
      c.resume().then(arrancar).catch(() => {});
    } else {
      arrancar();
    }
  } catch {
    // Sin música. La partida sigue.
  }
}

export function detenerPista() {
  if (idScheduler !== null) {
    clearInterval(idScheduler);
    idScheduler = null;
  }
  matarNodos();
  pistaActual = null;
}

// Corta todo y suelta el AudioContext. Se llama al salir de la partida: no
// queda ningún proceso de audio vivo detrás.
export function apagar() {
  detenerPista();
  if (ctx) {
    try {
      ctx.close();
    } catch {
      // Contexto ya cerrado.
    }
    ctx = null;
    masterGain = null;
  }
}

// Efecto puntual. No depende de que haya música sonando: se usa igual en los
// puzzles con la música silenciada... salvo que el jugador haya silenciado
// todo, en cuyo caso el masterGain está en 0 y no se escucha nada.
export function efecto(nombre) {
  const tonos = EFECTOS[nombre];
  if (!tonos) return;
  const c = obtenerContexto();
  if (!c || silenciado) return;
  try {
    if (c.state === 'suspended') c.resume().catch(() => {});
    const base = c.currentTime + 0.01;
    tonos.forEach((t) => {
      const inicio = base + (t.retraso ?? 0);
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = t.onda;
      osc.frequency.setValueAtTime(t.de, inicio);
      if (t.a !== t.de) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, t.a), inicio + t.dur);
      }
      g.gain.setValueAtTime(0, inicio);
      g.gain.linearRampToValueAtTime(t.vol, inicio + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, inicio + t.dur);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(inicio);
      osc.stop(inicio + t.dur + 0.02);
      registrar(osc);
    });
  } catch {
    // Sin efecto. Nada más que hacer.
  }
}

// El silencio lo gobierna src/lib/musica.js, que es el dueño del botón y de la
// preferencia guardada. Acá solo obedecemos.
export function setSilenciado(valor) {
  silenciado = valor;
  if (masterGain && ctx) {
    try {
      masterGain.gain.setTargetAtTime(valor ? 0 : volumenMusica, ctx.currentTime, 0.1);
    } catch {
      masterGain.gain.value = valor ? 0 : volumenMusica;
    }
  }
}

export function haySoporte() {
  return soportado;
}
