import { useState, useCallback, useEffect } from 'react';
import type { Game } from './types/game';
import { createGame, getGame, joinGame, makeMove } from './services/api';
import useGamePolling from './hooks/useGamePolling';
import Board from './components/Board';
import GameStatus from './components/GameStatus';
import GameControls from './components/GameControls';
import './App.css';

function App() {
  const [game, setGame] = useState<Game | null>(null);
  const [playerMarker, setPlayerMarker] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // T027: Restore game state on browser refresh
  useEffect(() => {
    const savedGameId = localStorage.getItem('gameId');
    const savedMarker = localStorage.getItem('playerMarker');
    if (savedGameId && savedMarker) {
      getGame(savedGameId)
        .then((restoredGame) => {
          setGame(restoredGame);
          setPlayerMarker(savedMarker);
        })
        .catch(() => {
          localStorage.removeItem('gameId');
          localStorage.removeItem('playerMarker');
        });
    }
  }, []);

  // Persist game state to localStorage
  useEffect(() => {
    if (game && playerMarker) {
      localStorage.setItem('gameId', game.gameId);
      localStorage.setItem('playerMarker', playerMarker);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.gameId, playerMarker]);

  const handlePollUpdate = useCallback((updatedGame: Game) => {
    setGame(updatedGame);
  }, []);

  useGamePolling(
    game?.gameId ?? null,
    game?.status ?? null,
    handlePollUpdate
  );

  async function handleCreateGame() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const newGame = await createGame();
      setGame(newGame);
      setPlayerMarker('X');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinGame(gameId: string) {
    setLoading(true);
    setErrorMessage(null);
    try {
      const joinedGame = await joinGame(gameId);
      setGame(joinedGame);
      setPlayerMarker('O');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to join game');
    } finally {
      setLoading(false);
    }
  }

  async function handleCellClick(row: number, col: number) {
    if (!game || !playerMarker) return;
    if (game.status !== 'in_progress') return;
    if (game.currentPlayer !== playerMarker) return;
    if (game.board[row][col] !== '') return;

    setErrorMessage(null);
    try {
      const updatedGame = await makeMove(game.gameId, playerMarker, row, col);
      setGame(updatedGame);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to make move');
    }
  }

  const boardDisabled =
    !game ||
    game.status === 'waiting' ||
    game.status === 'finished' ||
    game.currentPlayer !== playerMarker;

  return (
    <div className="app">
      <h1>Jogo da Velha</h1>
      <GameStatus game={game} playerMarker={playerMarker} errorMessage={errorMessage} />
      {!game && (
        <GameControls
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
          loading={loading}
        />
      )}
      {game && (
        <Board
          board={game.board}
          onCellClick={handleCellClick}
          disabled={boardDisabled}
          finished={game.status === 'finished'}
        />
      )}
    </div>
  );
}

export default App;

