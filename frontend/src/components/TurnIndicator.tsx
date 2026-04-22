import type { GameStatus, Marker } from "@/api/types";

interface Props {
  status: GameStatus;
  currentPlayer: Marker;
  assignedMarker: Marker | null;
}

export function TurnIndicator({ status, currentPlayer, assignedMarker }: Props) {
  let text: string;
  if (status === "waiting") {
    text = "Waiting for opponent to join…";
  } else if (status === "finished") {
    text = "Game finished.";
  } else if (assignedMarker && currentPlayer === assignedMarker) {
    text = `Your turn (${assignedMarker})`;
  } else {
    text = `Opponent's turn (${currentPlayer})`;
  }
  return (
    <p
      aria-live="polite"
      className="text-center text-lg font-medium text-slate-700"
    >
      {text}
    </p>
  );
}
