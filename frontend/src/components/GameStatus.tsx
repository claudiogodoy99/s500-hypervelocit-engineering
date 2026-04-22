import type { Game } from '../types/game';

interface GameStatusProps {
  game: Game | null;
  playerMarker: string | null;
  errorMessage: string | null;
}

export default function GameStatus({ game, playerMarker, errorMessage }: GameStatusProps) {
  if (errorMessage) {
    return <div className="game-status game-status--error">{errorMessage}</div>;
  }

  if (!game) {
    return <div className="game-status">Create or join a game to start playing!</div>;
  }

  if (game.status === 'waiting') {
    return (
      <div className="game-status game-status--waiting">
        <p>Waiting for opponent to join...</p>
        <p className="game-id">
          Game ID: <strong>{game.gameId}</strong>
        </p>
      </div>
    );
  }

  if (game.status === 'finished') {
    if (game.winner === 'draw') {
      return <div className="game-status game-status--draw">It&apos;s a draw!</div>;
    }
    return (
      <div className="game-status game-status--winner">
        Player {game.winner} wins!
      </div>
    );
  }

  const isYourTurn = game.currentPlayer === playerMarker;
  return (
    <div className={`game-status ${isYourTurn ? 'game-status--your-turn' : 'game-status--opponent-turn'}`}>
      {isYourTurn
        ? `Your turn (${playerMarker})`
        : `Opponent's turn (${game.currentPlayer})`}
    </div>
  );
}
