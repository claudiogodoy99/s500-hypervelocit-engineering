export interface Game {
  gameId: string;
  board: string[][];
  currentPlayer: string;
  status: 'waiting' | 'in_progress' | 'finished';
  winner: string | null;
}

export interface ApiError {
  error: string;
}

export interface MoveRequest {
  player: string;
  row: number;
  col: number;
}
