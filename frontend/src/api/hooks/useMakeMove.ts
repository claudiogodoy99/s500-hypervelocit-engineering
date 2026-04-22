import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import type { Game, MoveRequest } from "../types";

export function useMakeMove(gameId: string) {
  const qc = useQueryClient();
  return useMutation<Game, Error, MoveRequest>({
    mutationFn: (move) =>
      apiClient.post<Game>(`/games/${encodeURIComponent(gameId)}/move`, move),
    // FR-012: backend response is authoritative; reconcile cache on success.
    onSuccess: (game) => {
      qc.setQueryData(["game", game.gameId], game);
    },
  });
}
