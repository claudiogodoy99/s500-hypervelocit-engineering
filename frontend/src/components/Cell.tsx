interface CellProps {
  value: string;
  onClick: () => void;
  disabled: boolean;
}

export default function Cell({ value, onClick, disabled }: CellProps) {
  return (
    <button
      className={`cell ${value ? 'cell--filled' : ''} ${disabled ? 'cell--disabled' : ''}`}
      onClick={onClick}
      disabled={disabled || value !== ''}
      aria-label={value || 'empty'}
    >
      {value}
    </button>
  );
}
