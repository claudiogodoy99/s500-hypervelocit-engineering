import { useEffect, useRef } from 'react';
import type { Game } from '../types/game';
import { getGame } from '../services/api';

const POLL_INTERVAL_MS = 1000;

export default function useGamePolling(
  gameId: string | null,
  currentStatus: string | null,
  onUpdate: (game: Game) => void
) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  useEffect(() => {
    if (!gameId || currentStatus === 'finished') {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const game = await getGame(gameId);
        onUpdateRef.current(game);
      } catch {
        // Silently continue polling on error
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [gameId, currentStatus]);
}
