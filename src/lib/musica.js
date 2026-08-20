import { getItem, setItem } from './storage';

// Música de fondo de la partida.
//
// Es un singleton de módulo, no un componente: el <audio> tiene que sobrevivir
// a los remontajes de React (cada cambio de fase remonta el cuerpo del HUD). Si
// viviera dentro de un componente, la música se reiniciaría a cada rato.
//
// Regla 7 de docs/CLAUDE.md: el audio es decorativo y las PCs del laboratorio
// no tienen parlantes. Todo acá falla en silencio: si el archivo no está, si el
// navegador bloquea el autoplay o si el formato no se soporta, la partida sigue
// igual y no se imprime ni un error.
//
// El archivo lo pone el equipo en public/audio/ (ver public/audio/LEEME.md).

const ARCHIVO = 'audio/musica-fondo.mp3';
const VOLUMEN = 0.35;
const MS_FADE = 1200;
const CLAVE_SILENCIO = 'musica-silenciada';

// BASE_URL respeta el `base` de vite.config.js ('/OpenDay2026Software/'), así
// que la ruta sirve igual en el dev server y en GitHub Pages.
const URL_ARCHIVO = `${import.meta.env.BASE_URL}${ARCHIVO}`;

let audio = null;
let disponible = true; // se pone en false si el archivo no carga
let queremosSonar = false; // si la partida pide música
let silenciada = getItem(CLAVE_SILENCIO) === true;
let esperandoGesto = false;
let idFade = null;

const suscriptores = new Set();

// El estado se cachea en un objeto inmutable porque useSyncExternalStore
// compara por identidad: si devolviéramos uno nuevo en cada lectura, React
// entraría en un bucle de renders.
let snapshot = { disponible, silenciada, activa: false };

function publicar() {
  // `activa` es "la partida pide música", independiente del silencio: es lo que
  // decide si el botón de silencio se muestra. Así el botón aparece solo durante
  // la partida y no en el registro, donde no habría nada que silenciar.
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
    disponible = false;
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
  if (!disponible || silenciada) return;
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

function pausar({ inmediato = false } = {}) {
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

// La partida quiere música (se eligió escenario). Idempotente: llamarla de
// nuevo mientras ya suena no reinicia el track.
export function activarMusica() {
  queremosSonar = true;
  if (!silenciada) reproducir();
  publicar();
}

// La partida ya no quiere música (se volvió al registro). Rebobina, así la
// próxima partida arranca el track desde el principio.
export function desactivarMusica() {
  queremosSonar = false;
  pausar({ inmediato: true });
  if (audio) audio.currentTime = 0;
  publicar();
}

export function alternarSilencio() {
  silenciada = !silenciada;
  setItem(CLAVE_SILENCIO, silenciada);
  if (silenciada) pausar();
  else if (queremosSonar) reproducir();
  publicar();
}

export function suscribirMusica(fn) {
  suscriptores.add(fn);
  return () => suscriptores.delete(fn);
}

export function estadoMusica() {
  return snapshot;
}
