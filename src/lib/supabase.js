// Acceso a Supabase por su API REST (PostgREST), con `fetch` plano.
//
// A propósito NO usa @supabase/supabase-js: lo único que necesitamos es un
// upsert y un select, y docs/CLAUDE.md pide no sumar dependencias que después
// haya que mantener. Con fetch esto sigue funcionando dentro de un año sin
// tocarlo.
//
// Si no hay variables de entorno configuradas, `estaConfigurado()` devuelve
// false y toda la app cae al modo local (localStorage) sin enterarse. Es la
// regla 3 de docs/CLAUDE.md: la partida nunca se bloquea esperando red.
//
// Setup: copiar .env.local.example a .env.local y llenar las dos variables.
// El SQL de las tablas está en docs/supabase.md.

// Una variable declarada pero vacía (el caso de copiar .env.local.example a
// .env.local sin llenarlo) cuenta como NO configurada. Con `??` no alcanzaba:
// '' no es null, así que la app se quedaba sin Supabase en silencio aunque acá
// abajo haya un valor por defecto perfectamente válido.
function deEntorno(valor, porDefecto) {
  const limpio = (valor ?? '').trim();
  return limpio || porDefecto;
}

const URL_BASE = deEntorno(import.meta.env.VITE_SUPABASE_URL, 'https://nqvvtkranuoymtuyiftr.supabase.co');
const ANON_KEY = deEntorno(import.meta.env.VITE_SUPABASE_ANON_KEY, 'sb_publishable_x_tCVdwHowI4Mr6mewgGbQ_pL0Sb2c4');

const TIMEOUT_MS = 6000;

export function estaConfigurado() {
  return !!URL_BASE && !!ANON_KEY;
}

function cabeceras(extra = {}) {
  return {
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

// Cualquier fallo (red caída, firewall del campus, tabla inexistente) devuelve
// null en vez de tirar: quien llama decide el fallback local. Nunca dejamos que
// un problema de red rompa la partida.
async function pedir(ruta, opciones = {}) {
  if (!estaConfigurado()) return null;
  const control = new AbortController();
  const corte = setTimeout(() => control.abort(), TIMEOUT_MS);
  try {
    const respuesta = await fetch(`${URL_BASE}/rest/v1/${ruta}`, {
      ...opciones,
      headers: cabeceras(opciones.headers),
      signal: control.signal,
    });
    if (!respuesta.ok) return null;
    const texto = await respuesta.text();
    return texto ? JSON.parse(texto) : [];
  } catch {
    return null;
  } finally {
    clearTimeout(corte);
  }
}

// Inserta o actualiza la fila del participante. La identidad es el `id` que
// genera el navegador, no el nombre: dos alumnos que se llamen igual en el
// mismo colegio siguen siendo dos filas distintas.
export async function guardarParticipante(fila) {
  return pedir('participantes', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(fila),
  });
}

// Ranking ordenado por puntaje total. `numeroColegio` filtra a una sola ronda;
// sin él trae todas.
export async function leerParticipantes({ numeroColegio = null, limite = 100 } = {}) {
  const filtros = [
    'select=id,nombre,colegio,numero_colegio,misiones,puntaje_total,tiempo_total_seg',
    'order=puntaje_total.desc,tiempo_total_seg.asc',
    `limit=${limite}`,
  ];
  if (numeroColegio) filtros.push(`numero_colegio=eq.${numeroColegio}`);
  return pedir(`participantes?${filtros.join('&')}`);
}
