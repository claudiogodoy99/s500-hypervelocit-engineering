import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateGame } from "@/api/hooks/useCreateGame";
import { useJoinGame } from "@/api/hooks/useJoinGame";
import { useGameSession } from "@/session/GameSessionContext";
import { trimAndValidateGameId } from "@/utils/validation";
import { ApiClientError } from "@/api/errors";

export function EntryPage() {
  const navigate = useNavigate();
  const session = useGameSession();
  const create = useCreateGame();
  const join = useJoinGame();

  const [idInput, setIdInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleCreate() {
    create.mutate(undefined, {
      onSuccess: (game) => {
        session.setAssignedMarker("X");
        session.setActiveGameId(game.gameId);
        navigate(`/game/${encodeURIComponent(game.gameId)}`);
      },
    });
  }

  function handleJoin(e: FormEvent) {
    e.preventDefault();
    setValidationError(null);
    const result = trimAndValidateGameId(idInput);
    if (!result.ok) {
      setValidationError(result.reason);
      return;
    }
    join.mutate(result.value, {
      onSuccess: (game) => {
        session.setAssignedMarker("O");
        session.setActiveGameId(game.gameId);
        navigate(`/game/${encodeURIComponent(game.gameId)}`);
      },
    });
  }

  const createError = create.error instanceof Error ? create.error.message : null;
  const joinError =
    join.error instanceof ApiClientError ? join.error.message : join.error instanceof Error ? join.error.message : null;

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 p-6">
      <h1 className="text-3xl font-bold text-center">Jogo da Velha</h1>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">Create a game</h2>
        <p className="mb-4 text-sm text-slate-600">
          Starts a new game and assigns you marker <span className="font-bold">X</span>.
        </p>
        <button
          type="button"
          onClick={handleCreate}
          disabled={create.isPending}
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {create.isPending ? "Creating…" : "Create Game"}
        </button>
        {createError && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            Failed to create game: {createError}. Please try again.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">Join a game</h2>
        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <label htmlFor="game-id" className="text-sm text-slate-600">
            Enter the game ID shared by the other player:
          </label>
          <input
            id="game-id"
            type="text"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 font-mono"
            placeholder="abc123"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={join.isPending}
            className="self-start rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {join.isPending ? "Joining…" : "Join Game"}
          </button>
          {validationError && (
            <p role="alert" className="text-sm text-red-700">
              {validationError}
            </p>
          )}
          {joinError && (
            <p role="alert" className="text-sm text-red-700">
              {joinError}
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
