import { getItem, setItem } from './storage';
import { apagar, detenerPista, efecto, haySoporte, reproducirPista, setSilenciado } from './sintetizador';

// Banda sonora de la partida. Maneja DOS fuentes y expone una sola API:
//
//   1. El mp3 de fondo (public/audio/musica-fondo.mp3). Es lo que suena en
//      "Luz para Ccorca" v1 y v2, y sigue siendo el comportamiento por defecto:
//      llamar a `activarMusica()` sin argumentos hace exactamente lo mismo que
//      antes de que existiera Código Cero.
//   2. El sintetizador (src/lib/sintetizador.js), que genera synthwave por
//      código. Se usa cuando un escenario pide una pista por nombre
//      ('misterio' | 'tension' | 'resolucion'), como hace Código Cero.
//
// Las dos fuentes nunca suenan a la vez: activar una pausa la otra. Ese es el
// motivo de que haya un solo módulo y no dos independientes.
//
// Es un singleton de módulo, no un componente: el <audio> tiene que sobrevivir
// a los remontajes de React (cada cambio de fase remonta el cuerpo del HUD). Si
// viviera dentro de un componente, la música se reiniciaría a cada rato.
//
// Regla 7 de docs/CLAUDE.md: el audio es decorativo y las PCs del laboratorio
// no tienen parlantes. Todo acá falla en silencio: si el archivo no está, si el
// navegador bloquea el autoplay o si no hay Web Audio, la partida sigue igual y
// no se imprime ni un error.

const ARCHIVO = 'audio/musica-fondo.mp3';
const VOLUMEN = 0.35;
const MS_FADE = 1200;
const CLAVE_SILENCIO = 'musica-silenciada';

// BASE_URL respeta el `base` de vite.config.js ('/OpenDay2026Software/'), así
// que la ruta sirve igual en el dev server y en GitHub Pages.
const URL_ARCHIVO = `${import.meta.env.BASE_URL}${ARCHIVO}`;

let audio = null;
let archivoDisponible = true; // se pone en false si el archivo no carga
let queremosSonar = false; // si la partida pide música
let pistaSintetizada = null; // nombre de pista si el escenario usa sintetizador
let silenciada = getItem(CLAVE_SILENCIO) === true;
let esperandoGesto = false;
let idFade = null;

// El sintetizador arranca sabiendo si el jugador ya había silenciado: si no,
// el primer efecto de sonido sonaría a pesar del botón en "mute".
setSilenciado(silenciada);

const suscriptores = new Set();

// El estado se cachea en un objeto inmutable porque useSyncExternalStore
// compara por identidad: si devolviéramos uno nuevo en cada lectura, React
// entraría en un bucle de renders.
let snapshot = { disponible: archivoDisponible, silenciada, activa: false };

function fuenteDisponible() {
  return pistaSintetizada ? haySoporte() : archivoDisponible;
}

function publicar() {
  // `activa` es "la partida pide música", independiente del silencio: es lo que
  // decide si el botón de silencio se muestra. Así el botón aparece solo durante
  // la partida y no en el registro, donde no habría nada que silenciar.
  const disponible = fuenteDisponible();
  if (
    snapshot.disponible === disponible &&
    snapshot.silenciada === silenciada &&
    snapshot.activa === queremosSonar
  ) {
    return;
  }
  snapshot = { disponible, silenciada, activa: queremosSonar };
  suscriptores.forEach((fn) => fn());
}

function crearAudio() {
  if (audio) return audio;
  audio = new Audio(URL_ARCHIVO);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0;
  // Si el archivo no está o el formato no se puede decodificar, se desactiva
  // todo (y el botón de silencio se esconde).
  audio.addEventListener('error', () => {
    archivoDisponible = false;
    publicar();
  });
  return audio;
}

function frenarFade() {
  if (idFade !== null) {
    clearInterval(idFade);
    idFade = null;
  }
}

// Rampa lineal de volumen. Entrar y salir de golpe se escucha como un corte.
function fadeHacia(destino, alTerminar) {
  frenarFade();
  if (!audio) return;
  const paso = 50;
  const saltos = Math.max(1, Math.round(MS_FADE / paso));
  const delta = (destino - audio.volume) / saltos;
  let restantes = saltos;
  idFade = setInterval(() => {
    if (!audio) {
      frenarFade();
      return;
    }
    restantes -= 1;
    const siguiente = restantes <= 0 ? destino : audio.volume + delta;
    audio.volume = Math.min(1, Math.max(0, siguiente));
    if (restantes <= 0) {
      frenarFade();
      if (alTerminar) alTerminar();
    }
  }, paso);
}

// Los navegadores exigen un gesto del usuario para reproducir. El clic en
// "ELEGIR ESCENARIO" alcanza, pero si por alguna razón se rechaza, dejamos un
// listener de un solo uso para reintentar en la próxima interacción. No se le
// pide nada al jugador: si nunca vuelve a tocar nada, simplemente no hay música.
function reintentarConGesto() {
  if (esperandoGesto) return;
  esperandoGesto = true;
  const reintento = () => {
    esperandoGesto = false;
    document.removeEventListener('pointerdown', reintento);
    document.removeEventListener('keydown', reintento);
    if (queremosSonar && !silenciada) reproducir();
  };
  document.addEventListener('pointerdown', reintento, { once: true });
  document.addEventListener('keydown', reintento, { once: true });
}

function reproducir() {
  if (silenciada) return;

  if (pistaSintetizada) {
    // El sintetizador maneja su propia política de autoplay: si el contexto
    // está suspendido intenta reanudarlo y, si no puede, no suena nada.
    reproducirPista(pistaSintetizada);
    return;
  }

  if (!archivoDisponible) return;
  const el = crearAudio();
  const promesa = el.play();
  // En navegadores viejos play() no devuelve promesa.
  if (promesa && typeof promesa.catch === 'function') {
    promesa
      .then(() => fadeHacia(VOLUMEN))
      .catch(() => {
        // Bloqueado por la política de autoplay: esperamos un gesto.
        reintentarConGesto();
      });
  } else {
    fadeHacia(VOLUMEN);
  }
}

function pausarArchivo({ inmediato = false } = {}) {
  if (!audio) return;
  if (inmediato) {
    frenarFade();
    audio.pause();
    audio.volume = 0;
    return;
  }
  fadeHacia(0, () => {
    if (audio) audio.pause();
  });
}

// --- API pública ---------------------------------------------------------

// La partida quiere música. Sin argumentos suena el mp3 de fondo (lo que hacen
// Ccorca v1 y v2). Con el nombre de una pista, la genera el sintetizador.
//
// Idempotente por partida: llamarla de nuevo con la misma pista no reinicia
// nada, así que se puede invocar en cada render sin efectos raros.
export function activarMusica(pista = null) {
  const cambioDeFuente = pista !== pistaSintetizada;
  queremosSonar = true;

  if (cambioDeFuente) {
    // Cambiar de fuente (o de pista dentro del sintetizador) apaga la anterior
    // primero. Es lo que garantiza que nunca haya dos pistas encimadas.
    if (pistaSintetizada && !pista) detenerPista();
    if (!pistaSintetizada && pista) pausarArchivo({ inmediato: true });
    pistaSintetizada = pista;
  }

  if (!silenciada) reproducir();
  publicar();
}

// La partida ya no quiere música (se volvió al registro). Rebobina el mp3 y
// libera el contexto de audio del sintetizador: no queda ni un oscilador ni un
// interval corriendo fuera de la partida.
export function desactivarMusica() {
  queremosSonar = false;
  pausarArchivo({ inmediato: true });
  if (audio) audio.currentTime = 0;
  if (pistaSintetizada) {
    apagar();
    pistaSintetizada = null;
  }
  publicar();
}

export function alternarSilencio() {
  silenciada = !silenciada;
  setItem(CLAVE_SILENCIO, silenciada);
  setSilenciado(silenciada);
  if (silenciada) {
    pausarArchivo();
    detenerPista();
  } else if (queremosSonar) {
    reproducir();
  }
  publicar();
}

// Efecto de sonido puntual, para los minijuegos. Se enruta por acá (y no
// importando el sintetizador directo) para que el botón de silencio sea la
// única fuente de verdad: si está silenciado, no suena nada.
export function reproducirEfecto(nombre) {
  if (silenciada) return;
  efecto(nombre);
}

export function suscribirMusica(fn) {
  suscriptores.add(fn);
  return () => suscriptores.delete(fn);
}

export function estadoMusica() {
  return snapshot;
}
