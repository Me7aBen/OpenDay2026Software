import { useEffect, useState } from 'react';
import { leerExploracion, suscribir } from './almacen';

// Lee "Mi exploración" y se re-renderiza cuando cambia. Es todo el estado
// global que necesita la plataforma: no hace falta un store.
export function useExploracion() {
  const [datos, setDatos] = useState(leerExploracion);
  useEffect(() => suscribir(setDatos), []);
  return datos;
}
