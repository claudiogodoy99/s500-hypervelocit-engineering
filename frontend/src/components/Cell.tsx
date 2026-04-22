import type { Cell as CellValue, Marker } from "@/api/types";

interface Props {
  row: 0 | 1 | 2;
  col: 0 | 1 | 2;
  value: CellValue;
  disabled: boolean;
  onSelect?: ((row: 0 | 1 | 2, col: 0 | 1 | 2) => void) | undefined;
}

function describe(value: CellValue): string {
  if (value === "") return "empty";
  return value;
}

export function Cell({ row, col, value, disabled, onSelect }: Props) {
  const label = `Row ${row + 1}, Col ${col + 1}, ${describe(value)}`;
  const marker: Marker | null = value === "" ? null : value;
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={() => onSelect?.(row, col)}
      className="aspect-square w-full rounded-md border border-slate-300 bg-white text-5xl font-bold text-slate-800 shadow-sm transition hover:enabled:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {marker}
    </button>
  );
}
