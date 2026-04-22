import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import type { Game } from "../types";

export function useJoinGame() {
  const qc = useQueryClient();
  return useMutation<Game, Error, string>({
    mutationFn: (gameId: string) => apiClient.post<Game>(`/games/${encodeURIComponent(gameId)}/join`),
    onSuccess: (game) => {
      qc.setQueryData(["game", game.gameId], game);
    },
  });
}
