import type { Board as BoardType } from "@/api/types";
import { Cell } from "./Cell";

interface Props {
  board: BoardType;
  isMyTurn: boolean;
  gameActive: boolean; // status === "in_progress"
  onMove?: ((row: 0 | 1 | 2, col: 0 | 1 | 2) => void) | undefined;
}

export function Board({ board, isMyTurn, gameActive, onMove }: Props) {
  return (
    <div
      role="grid"
      aria-label="Tic-tac-toe board"
      className="grid grid-cols-3 gap-2 w-full max-w-sm mx-auto"
    >
      {board.map((row, r) =>
        row.map((value, c) => {
          const rr = r as 0 | 1 | 2;
          const cc = c as 0 | 1 | 2;
          const occupied = value !== "";
          const disabled = !gameActive || !isMyTurn || occupied;
          return (
            <Cell
              key={`${rr}-${cc}`}
              row={rr}
              col={cc}
              value={value}
              disabled={disabled}
              onSelect={onMove}
            />
          );
        }),
      )}
    </div>
  );
}
