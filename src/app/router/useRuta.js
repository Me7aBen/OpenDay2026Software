import { useContext } from 'react';
import { RouterContext } from './routerContext';

export function useRuta() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRuta debe usarse dentro de <RouterProvider>');
  return ctx;
}
