import { APP_NAME, APP_TAGLINE, APP_DESCRIPCION } from '../config/marca';

// Metadatos por página (§60).
//
// La app es un SPA, así que esto no reemplaza al renderizado en servidor: lo
// que hace es dejar el <head> correcto para el navegador, para quien comparte
// el enlace y para los rastreadores que sí ejecutan JS. La arquitectura queda
// lista (title, description, canonical, OpenGraph) para el día que se agregue
// prerender o SSG, que es un cambio de build, no de componentes.

function etiqueta(selector, crear) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = crear();
    document.head.appendChild(el);
  }
  return el;
}

function meta(nombre, contenido, atributo = 'name') {
  if (!contenido) return;
  const el = etiqueta(`meta[${atributo}="${nombre}"]`, () => {
    const nuevo = document.createElement('meta');
    nuevo.setAttribute(atributo, nombre);
    return nuevo;
  });
  el.setAttribute('content', contenido);
}

export function aplicarMeta({ titulo, descripcion, ruta, tipo = 'website' } = {}) {
  // Sin título propio (la home) el <title> es marca + tagline. La descripción
  // completa va en el meta description, no en la pestaña del navegador.
  const tituloCompleto = titulo ? `${titulo} | ${APP_NAME}` : `${APP_NAME} — ${APP_TAGLINE}`;
  const desc = descripcion ?? APP_DESCRIPCION;

  document.title = tituloCompleto;
  meta('description', desc);

  if (ruta) {
    const url = new URL(
      `${import.meta.env.BASE_URL.replace(/\/$/, '')}${ruta}`,
      window.location.origin,
    ).toString();
    const canonical = etiqueta('link[rel="canonical"]', () => {
      const el = document.createElement('link');
      el.setAttribute('rel', 'canonical');
      return el;
    });
    canonical.setAttribute('href', url);
    meta('og:url', url, 'property');
  }

  meta('og:title', tituloCompleto, 'property');
  meta('og:description', desc, 'property');
  meta('og:type', tipo, 'property');
  meta('og:site_name', APP_NAME, 'property');
  meta('twitter:card', 'summary_large_image');
}
