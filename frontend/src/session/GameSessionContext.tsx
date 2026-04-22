import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Marker } from "@/api/types";

interface GameSessionValue {
  assignedMarker: Marker | null;
  activeGameId: string | null;
  setAssignedMarker: (m: Marker | null) => void;
  setActiveGameId: (id: string | null) => void;
  clear: () => void;
}

const GameSessionContext = createContext<GameSessionValue | null>(null);

export function GameSessionProvider({ children }: { children: ReactNode }) {
  const [assignedMarker, setAssignedMarker] = useState<Marker | null>(null);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const clear = useCallback(() => {
    setAssignedMarker(null);
    setActiveGameId(null);
  }, []);

  const value = useMemo<GameSessionValue>(
    () => ({ assignedMarker, activeGameId, setAssignedMarker, setActiveGameId, clear }),
    [assignedMarker, activeGameId, clear],
  );

  return <GameSessionContext.Provider value={value}>{children}</GameSessionContext.Provider>;
}

export function useGameSession(): GameSessionValue {
  const ctx = useContext(GameSessionContext);
  if (!ctx) {
    throw new Error("useGameSession must be used within a GameSessionProvider");
  }
  return ctx;
}
