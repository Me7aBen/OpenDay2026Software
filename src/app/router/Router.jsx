import { useCallback, useEffect, useMemo, useState } from 'react';
import { RouterContext } from './routerContext';
import { useRuta } from './useRuta';
import { EVENTO_NAVEGACION, hrefDe, navegarA, rutaDesdeUbicacion } from './navegacion';

// Router mínimo sobre la History API.
//
// Por qué propio y no react-router: `docs/CLAUDE.md` pide no agregar
// dependencias sin preguntar y que el proyecto siga funcionando dentro de un
// año sin mantenimiento. Lo que necesitamos son URLs reales, parámetros y
// enlaces — unas 100 líneas repartidas entre este archivo y `navegacion.js`.
// Una librería para eso, en un proyecto que hoy no tiene ninguna dependencia
// además de React, no se paga.
//
// `public/404.html` devuelve el control a index.html para que las URLs
// profundas no den 404 al recargar en GitHub Pages.

export function RouterProvider({ children }) {
  const [ruta, setRuta] = useState(rutaDesdeUbicacion);

  useEffect(() => {
    const actualizar = () => setRuta(rutaDesdeUbicacion());
    window.addEventListener('popstate', actualizar);
    window.addEventListener(EVENTO_NAVEGACION, actualizar);
    return () => {
      window.removeEventListener('popstate', actualizar);
      window.removeEventListener(EVENTO_NAVEGACION, actualizar);
    };
  }, []);

  const navegar = useCallback((destino, opciones) => {
    navegarA(destino, opciones);
    // Cambiar de pantalla y quedarse a mitad de scroll es desorientador,
    // sobre todo en móvil.
    window.scrollTo(0, 0);
  }, []);

  const valor = useMemo(() => ({ ruta, navegar }), [ruta, navegar]);
  return <RouterContext.Provider value={valor}>{children}</RouterContext.Provider>;
}

// Enlace real: es un <a> con href navegable (se puede abrir en pestaña nueva,
// copiar, indexar) que además navega sin recargar cuando el clic es normal.
export function Enlace({ to, children, className, onClick, ...resto }) {
  const { navegar } = useRuta();

  function manejar(evento) {
    onClick?.(evento);
    if (evento.defaultPrevented) return;
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
    if (resto.target === '_blank') return;
    evento.preventDefault();
    navegar(to);
  }

  return (
    <a href={hrefDe(to)} className={className} onClick={manejar} {...resto}>
      {children}
    </a>
  );
}
