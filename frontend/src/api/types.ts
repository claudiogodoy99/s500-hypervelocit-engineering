// Mirror of specs/001-frontend-app/contracts/openapi.json #/components/schemas/*
// DO NOT diverge from the constitution contract.

export type Cell = "" | "X" | "O";
export type Marker = "X" | "O";
export type GameStatus = "waiting" | "in_progress" | "finished";
export type Winner = Marker | "draw" | null;

export type BoardRow = readonly [Cell, Cell, Cell];
export type Board = readonly [BoardRow, BoardRow, BoardRow];

export interface Game {
  readonly gameId: string;
  readonly board: Board;
  readonly currentPlayer: Marker;
  readonly status: GameStatus;
  readonly winner: Winner;
}

export interface MoveRequest {
  readonly player: Marker;
  readonly row: 0 | 1 | 2;
  readonly col: 0 | 1 | 2;
}

export const API_ERROR_CODES = [
  "Game not found",
  "Game is already full",
  "Not your turn",
  "Cell already occupied",
  "Game is already over",
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export interface ApiErrorBody {
  readonly error: string;
}
