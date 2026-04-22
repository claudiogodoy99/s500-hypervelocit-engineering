import type { Board, Game, Marker, MoveRequest, Winner } from "@/api/types";

const EMPTY_BOARD: Board = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

const store = new Map<string, Game>();
let idCounter = 0;

// Dev-only cross-tab sync for the MSW mock so two browser tabs sharing an
// origin (same Playwright BrowserContext) observe the same game state.
// This is NOT app persistence (Principle III); the mocks/ tree is dev-only
// and tree-shaken from production builds.
const STORAGE_KEY = "__ttt_mock_store_v1";

function getLocalStorage(): Storage | null {
  try {
    const g = globalThis as { localStorage?: Storage };
    return g.localStorage ?? null;
  } catch {
    return null;
  }
}

function hydrate(): void {
  const ls = getLocalStorage();
  if (!ls) return;
  try {
    const raw = ls.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { games: Array<[string, Game]>; idCounter: number };
    store.clear();
    for (const [k, v] of parsed.games) store.set(k, v);
    if (parsed.idCounter > idCounter) idCounter = parsed.idCounter;
  } catch {
    /* ignore corrupt mock state */
  }
}

function persist(): void {
  const ls = getLocalStorage();
  if (!ls) return;
  try {
    ls.setItem(
      STORAGE_KEY,
      JSON.stringify({ games: Array.from(store.entries()), idCounter }),
    );
  } catch {
    /* ignore quota errors */
  }
}

function nextId(): string {
  idCounter += 1;
  return `mock-${idCounter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneBoard(b: Board): [["" | Marker, "" | Marker, "" | Marker], ["" | Marker, "" | Marker, "" | Marker], ["" | Marker, "" | Marker, "" | Marker]] {
  return [
    [b[0][0], b[0][1], b[0][2]],
    [b[1][0], b[1][1], b[1][2]],
    [b[2][0], b[2][1], b[2][2]],
  ];
}

function detectWinner(b: Board): Winner {
  const lines: Array<[[number, number], [number, number], [number, number]]> = [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]],
  ];
  for (const [a, c, d] of lines) {
    const v = b[a[0]]?.[a[1]];
    if (v && v === b[c[0]]?.[c[1]] && v === b[d[0]]?.[d[1]]) {
      return v as Marker;
    }
  }
  const hasEmpty = b.some((row) => row.some((cell) => cell === ""));
  return hasEmpty ? null : "draw";
}

export class MockApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "MockApiError";
    this.status = status;
  }
}

export function createGame(): Game {
  hydrate();
  const game: Game = {
    gameId: nextId(),
    board: EMPTY_BOARD,
    currentPlayer: "X",
    status: "waiting",
    winner: null,
  };
  store.set(game.gameId, game);
  persist();
  return game;
}

export function getGame(id: string): Game {
  hydrate();
  const g = store.get(id);
  if (!g) throw new MockApiError(404, "Game not found");
  return g;
}

export function joinGame(id: string): Game {
  hydrate();
  const g = store.get(id);
  if (!g) throw new MockApiError(404, "Game not found");
  if (g.status !== "waiting") {
    throw new MockApiError(409, "Game is already full");
  }
  const updated: Game = { ...g, status: "in_progress" };
  store.set(id, updated);
  persist();
  return updated;
}

export function applyMove(id: string, move: MoveRequest): Game {
  hydrate();
  const g = store.get(id);
  if (!g) throw new MockApiError(404, "Game not found");
  if (g.status === "finished") {
    throw new MockApiError(409, "Game is already over");
  }
  if (g.status !== "in_progress") {
    throw new MockApiError(409, "Game is already over");
  }
  if (move.player !== g.currentPlayer) {
    throw new MockApiError(409, "Not your turn");
  }
  if (g.board[move.row]?.[move.col] !== "") {
    throw new MockApiError(409, "Cell already occupied");
  }
  const nextBoard = cloneBoard(g.board);
  nextBoard[move.row][move.col] = move.player;
  const winner = detectWinner(nextBoard);
  const status: Game["status"] = winner === null ? "in_progress" : "finished";
  const nextPlayer: Marker = g.currentPlayer === "X" ? "O" : "X";
  const updated: Game = {
    gameId: g.gameId,
    board: nextBoard,
    currentPlayer: status === "finished" ? g.currentPlayer : nextPlayer,
    status,
    winner,
  };
  store.set(id, updated);
  persist();
  return updated;
}

export function __resetStoreForTests(): void {
  store.clear();
  idCounter = 0;
  const ls = getLocalStorage();
  try {
    ls?.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
