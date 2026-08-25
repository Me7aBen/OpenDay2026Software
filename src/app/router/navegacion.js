// Utilidades puras del router. Viven aparte de `Router.jsx` porque ese archivo
// solo debe exportar componentes (regla de react-refresh), y además así se
// pueden usar desde módulos que no son React.
//
// El sitio se publica bajo una base (`/OpenDay2026Software/` en GitHub Pages),
// así que las rutas internas se escriben SIN esa base ('/carreras') y acá se
// arma el href real.

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export const EVENTO_NAVEGACION = 'ruta:cambio';

export function rutaDesdeUbicacion() {
  const bruta = window.location.pathname;
  const sinBase = BASE && bruta.startsWith(BASE) ? bruta.slice(BASE.length) : bruta;
  return sinBase.startsWith('/') ? sinBase : `/${sinBase}`;
}

export function hrefDe(ruta) {
  return `${BASE}${ruta.startsWith('/') ? ruta : `/${ruta}`}`;
}

export function navegarA(ruta, { reemplazar = false } = {}) {
  const href = hrefDe(ruta);
  if (reemplazar) window.history.replaceState({}, '', href);
  else window.history.pushState({}, '', href);
  window.dispatchEvent(new Event(EVENTO_NAVEGACION));
}

// Compara una ruta contra un patrón con parámetros: '/carreras/:slug'.
// Devuelve los parámetros si coincide, o null.
export function coincidir(patron, ruta) {
  const partesPatron = patron.split('/').filter(Boolean);
  const partesRuta = ruta.split('/').filter(Boolean);
  if (partesPatron.length !== partesRuta.length) return null;

  const params = {};
  for (let i = 0; i < partesPatron.length; i += 1) {
    const p = partesPatron[i];
    if (p.startsWith(':')) params[p.slice(1)] = decodeURIComponent(partesRuta[i]);
    else if (p !== partesRuta[i]) return null;
  }
  return params;
}
