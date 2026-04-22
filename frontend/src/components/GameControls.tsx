import { useState } from 'react';

interface GameControlsProps {
  onCreateGame: () => void;
  onJoinGame: (gameId: string) => void;
  loading: boolean;
}

export default function GameControls({ onCreateGame, onJoinGame, loading }: GameControlsProps) {
  const [joinGameId, setJoinGameId] = useState('');

  function handleJoinSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = joinGameId.trim();
    if (trimmed) {
      onJoinGame(trimmed);
    }
  }

  return (
    <div className="game-controls">
      <button onClick={onCreateGame} disabled={loading} className="btn btn--create">
        {loading ? 'Creating...' : 'Create Game'}
      </button>
      <form className="join-form" onSubmit={handleJoinSubmit}>
        <input
          type="text"
          placeholder="Enter Game ID"
          value={joinGameId}
          onChange={(e) => setJoinGameId(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !joinGameId.trim()} className="btn btn--join">
          {loading ? 'Joining...' : 'Join Game'}
        </button>
      </form>
    </div>
  );
}
