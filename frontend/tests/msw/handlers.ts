import { http, HttpResponse } from "msw";
import type { Game } from "@/api/types";

const DEFAULT_ORIGIN = "http://localhost:3000";

const emptyBoard = [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
] as Game["board"];

export const waitingGame: Game = {
  gameId: "abc123",
  board: emptyBoard,
  currentPlayer: "X",
  status: "waiting",
  winner: null,
};

export const inProgressGame: Game = {
  gameId: "abc123",
  board: emptyBoard,
  currentPlayer: "X",
  status: "in_progress",
  winner: null,
};

export const handlers = [
  http.post(`${DEFAULT_ORIGIN}/games`, () => {
    return HttpResponse.json(waitingGame, { status: 201 });
  }),
  http.post(`${DEFAULT_ORIGIN}/games/:gameId/join`, () => {
    return HttpResponse.json(inProgressGame, { status: 200 });
  }),
  http.get(`${DEFAULT_ORIGIN}/games/:gameId`, () => {
    return HttpResponse.json(inProgressGame, { status: 200 });
  }),
  http.post(`${DEFAULT_ORIGIN}/games/:gameId/move`, () => {
    return HttpResponse.json(inProgressGame, { status: 200 });
  }),
];
