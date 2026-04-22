import { useState } from "react";

interface Props {
  gameId: string;
}

export function GameIdDisplay({ gameId }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(gameId);
      } else {
        // Minimal fallback for older environments (no-op if unsupported).
        const el = document.createElement("textarea");
        el.value = gameId;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="game-id-display" className="text-sm text-slate-600">
        Game ID:
      </label>
      <input
        id="game-id-display"
        type="text"
        readOnly
        value={gameId}
        className="w-48 rounded-md border border-slate-300 bg-white px-2 py-1 font-mono text-sm"
      />
      <button
        type="button"
        onClick={copy}
        className="rounded-md bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
