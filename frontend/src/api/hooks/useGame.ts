import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../client";
import type { Game } from "../types";

const STOPPED_STATUSES = new Set<string>(["finished"]);

export function useGame(gameId: string | null | undefined) {
  return useQuery<Game, Error>({
    queryKey: ["game", gameId],
    queryFn: () => apiClient.get<Game>(`/games/${encodeURIComponent(gameId as string)}`),
    enabled: Boolean(gameId),
    // FR-017 / data-model.md §2.3: transient failures don't flash the banner.
    retry: 3,
    retryDelay: 500,
    refetchInterval: (query) => {
      const data = query.state.data as Game | undefined;
      if (data && STOPPED_STATUSES.has(data.status)) return false;
      return 1000;
    },
    refetchIntervalInBackground: false,
  });
}
