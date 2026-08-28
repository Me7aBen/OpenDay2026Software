import { useEffect, useState } from 'react';
import { leerBackendRush, suscribirBackendRush } from './backendRush';

// Lee el estado compartido de BACKEND RUSH y re-renderiza cuando cambia.
export function useBackendRush() {
  const [estado, setEstado] = useState(leerBackendRush);
  useEffect(() => suscribirBackendRush(setEstado), []);
  return estado;
}
