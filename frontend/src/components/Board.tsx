import Cell from './Cell';

interface BoardProps {
  board: string[][];
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
  finished?: boolean;
}

export default function Board({ board, onCellClick, disabled, finished }: BoardProps) {
  return (
    <div className={`board ${finished ? 'board--finished' : ''}`}>
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            value={cell}
            onClick={() => onCellClick(rowIndex, colIndex)}
            disabled={disabled}
          />
        ))
      )}
    </div>
  );
}
