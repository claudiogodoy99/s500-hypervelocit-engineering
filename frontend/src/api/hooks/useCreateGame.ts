import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";
import type { Game } from "../types";

export function useCreateGame() {
  const qc = useQueryClient();
  return useMutation<Game, Error>({
    mutationFn: () => apiClient.post<Game>("/games"),
    onSuccess: (game) => {
      qc.setQueryData(["game", game.gameId], game);
    },
  });
}
