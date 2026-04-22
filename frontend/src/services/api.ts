import type { Game, ApiError } from '../types/game';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function handleResponse(response: Response): Promise<Game> {
  const data = await response.json();
  if (!response.ok) {
    const err = data as ApiError;
    throw new Error(err.error || 'Unknown error');
  }
  return data as Game;
}

async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch {
    throw new Error('Cannot connect to the game server. Make sure the backend is running.');
  }
}

export async function createGame(): Promise<Game> {
  const response = await safeFetch(`${API_URL}/games`, {
    method: 'POST',
  });
  return handleResponse(response);
}

export async function getGame(gameId: string): Promise<Game> {
  const response = await safeFetch(`${API_URL}/games/${encodeURIComponent(gameId)}`);
  return handleResponse(response);
}

export async function joinGame(gameId: string): Promise<Game> {
  const response = await safeFetch(`${API_URL}/games/${encodeURIComponent(gameId)}/join`, {
    method: 'POST',
  });
  return handleResponse(response);
}

export async function makeMove(
  gameId: string,
  player: string,
  row: number,
  col: number
): Promise<Game> {
  const response = await safeFetch(`${API_URL}/games/${encodeURIComponent(gameId)}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player, row, col }),
  });
  return handleResponse(response);
}
