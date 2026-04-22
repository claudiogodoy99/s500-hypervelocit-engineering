import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "@/api/hooks/useGame";
import { useMakeMove } from "@/api/hooks/useMakeMove";
import { useGameSession } from "@/session/GameSessionContext";
import { Board } from "@/components/Board";
import { TurnIndicator } from "@/components/TurnIndicator";
import { OutcomeBanner } from "@/components/OutcomeBanner";
import { GameIdDisplay } from "@/components/GameIdDisplay";
import { ConnectivityIndicator } from "@/components/ConnectivityIndicator";
import { ApiClientError } from "@/api/errors";

const RECONNECT_THRESHOLD = 3;

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const session = useGameSession();
  const query = useGame(gameId);
  const makeMove = useMakeMove(gameId ?? "");
  const [moveError, setMoveError] = useState<string | null>(null);

  useEffect(() => {
    if (gameId) session.setActiveGameId(gameId);
  }, [gameId, session]);

  // Clear move error whenever server state advances.
  useEffect(() => {
    if (query.data) setMoveError(null);
  }, [query.data]);

  const game = query.data;

  const connectivityState: "online" | "reconnecting" = useMemo(() => {
    return query.isError && query.failureCount >= RECONNECT_THRESHOLD ? "reconnecting" : "online";
  }, [query.isError, query.failureCount]);

  if (!gameId) {
    return <p className="p-6 text-red-700">Missing game ID.</p>;
  }

  if (query.isLoading || !game) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <ConnectivityIndicator state={connectivityState} />
        <p className="text-center text-slate-600">Loading game…</p>
      </main>
    );
  }

  const isMyTurn =
    session.assignedMarker !== null &&
    game.currentPlayer === session.assignedMarker &&
    game.status === "in_progress";

  function handleMove(row: 0 | 1 | 2, col: 0 | 1 | 2) {
    if (!session.assignedMarker) return;
    if (!game) return;
    if (game.board[row]?.[col] !== "") return;
    makeMove.mutate(
      { player: session.assignedMarker, row, col },
      {
        onError: (err) => {
          const message =
            err instanceof ApiClientError ? err.message : err instanceof Error ? err.message : "Move failed.";
          setMoveError(message);
        },
      },
    );
  }

  function handleNewGame() {
    session.clear();
    navigate("/");
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 p-6">
      <ConnectivityIndicator state={connectivityState} />

      <header className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold">Jogo da Velha</h1>
        <GameIdDisplay gameId={game.gameId} />
        {session.assignedMarker && (
          <p className="text-sm text-slate-600">
            You are playing as <span className="font-bold">{session.assignedMarker}</span>.
          </p>
        )}
      </header>

      <TurnIndicator
        status={game.status}
        currentPlayer={game.currentPlayer}
        assignedMarker={session.assignedMarker}
      />

      <Board
        board={game.board}
        isMyTurn={isMyTurn}
        gameActive={game.status === "in_progress"}
        onMove={handleMove}
      />

      {moveError && (
        <p role="alert" className="text-center text-sm text-red-700">
          {moveError}
        </p>
      )}

      {game.status === "finished" && (
        <div className="flex flex-col items-center gap-4">
          <OutcomeBanner winner={game.winner} assignedMarker={session.assignedMarker} />
          <button
            type="button"
            onClick={handleNewGame}
            className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500"
          >
            New Game
          </button>
        </div>
      )}
    </main>
  );
}
