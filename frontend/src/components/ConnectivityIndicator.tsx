interface Props {
  state: "online" | "reconnecting";
}

export function ConnectivityIndicator({ state }: Props) {
  if (state === "online") return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-2 left-1/2 -translate-x-1/2 rounded-md bg-amber-100 px-4 py-2 text-sm text-amber-900 shadow"
    >
      Reconnecting to backend…
    </div>
  );
}
