import type { Marker, Winner } from "@/api/types";

interface Props {
  winner: Winner;
  assignedMarker: Marker | null;
}

export function OutcomeBanner({ winner, assignedMarker }: Props) {
  if (winner === null) return null;
  let text: string;
  if (winner === "draw") {
    text = "Draw";
  } else if (assignedMarker && winner === assignedMarker) {
    text = "You won";
  } else if (assignedMarker) {
    text = "You lost";
  } else {
    text = `${winner} won`;
  }
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-sm rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-center text-xl font-semibold text-indigo-900"
    >
      {text}
    </div>
  );
}
