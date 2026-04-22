import { http, HttpResponse } from "msw";
import type { MoveRequest } from "@/api/types";
import { applyMove, createGame, getGame, joinGame, MockApiError } from "./gameStore";

const ORIGIN = import.meta.env.VITE_BACKEND_ORIGIN ?? "http://localhost:3000";

function errorResponse(e: unknown) {
  if (e instanceof MockApiError) {
    return HttpResponse.json({ error: e.message }, { status: e.status });
  }
  return HttpResponse.json({ error: "Unknown" }, { status: 500 });
}

export const mockHandlers = [
  http.post(`${ORIGIN}/games`, () => {
    const game = createGame();
    return HttpResponse.json(game, { status: 201 });
  }),

  http.get(`${ORIGIN}/games/:gameId`, ({ params }) => {
    try {
      const game = getGame(params.gameId as string);
      return HttpResponse.json(game, { status: 200 });
    } catch (e) {
      return errorResponse(e);
    }
  }),

  http.post(`${ORIGIN}/games/:gameId/join`, ({ params }) => {
    try {
      const game = joinGame(params.gameId as string);
      return HttpResponse.json(game, { status: 200 });
    } catch (e) {
      return errorResponse(e);
    }
  }),

  http.post(`${ORIGIN}/games/:gameId/move`, async ({ params, request }) => {
    try {
      const body = (await request.json()) as MoveRequest;
      const game = applyMove(params.gameId as string, body);
      return HttpResponse.json(game, { status: 200 });
    } catch (e) {
      return errorResponse(e);
    }
  }),
];
