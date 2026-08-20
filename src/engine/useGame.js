import { useContext } from 'react';
import { GameContext } from './gameContextObject';

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame debe usarse dentro de <GameProvider>');
  return ctx;
}
