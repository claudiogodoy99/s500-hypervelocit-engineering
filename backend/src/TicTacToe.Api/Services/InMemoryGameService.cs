using System.Collections.Concurrent;
using TicTacToe.Api.Models;
using TicTacToe.Api.Validation;

namespace TicTacToe.Api.Services;

public sealed class InMemoryGameService : IGameService
{
    private readonly ConcurrentDictionary<string, GameState> _games = new();

    public GameState CreateGame()
    {
        var game = GameState.CreateNew(Guid.NewGuid().ToString("N"));
        _games[game.GameId] = game;
        return game.Clone();
    }

    public bool TryGetGame(string gameId, out GameState? game)
    {
        if (_games.TryGetValue(gameId, out var storedGame))
        {
            game = storedGame.Clone();
            return true;
        }

        game = null;
        return false;
    }

    public ServiceResult<GameState> JoinGame(string gameId)
    {
        if (!_games.TryGetValue(gameId, out var game))
        {
            return ServiceResult<GameState>.Failure("Game not found", StatusCodes.Status404NotFound);
        }

        lock (game)
        {
            if (game.Status != "waiting")
            {
                return ServiceResult<GameState>.Failure("Game is already full", StatusCodes.Status400BadRequest);
            }

            game.Status = "in_progress";
            return ServiceResult<GameState>.Success(game.Clone());
        }
    }

    public ServiceResult<GameState> MakeMove(string gameId, MoveRequest? request)
    {
        var validationError = MoveRequestValidator.Validate(request);
        if (validationError is not null)
        {
            return ServiceResult<GameState>.Failure(validationError, StatusCodes.Status400BadRequest);
        }

        if (!_games.TryGetValue(gameId, out var game))
        {
            return ServiceResult<GameState>.Failure("Game not found", StatusCodes.Status404NotFound);
        }

        lock (game)
        {
            if (game.Status == "finished")
            {
                return ServiceResult<GameState>.Failure("Game is already over", StatusCodes.Status400BadRequest);
            }

            if (game.Status != "in_progress")
            {
                return ServiceResult<GameState>.Failure("Game is not ready to accept moves", StatusCodes.Status400BadRequest);
            }

            if (request!.Player != game.CurrentPlayer)
            {
                return ServiceResult<GameState>.Failure("Not your turn", StatusCodes.Status400BadRequest);
            }

            if (!string.IsNullOrEmpty(game.Board[request.Row][request.Col]))
            {
                return ServiceResult<GameState>.Failure("Cell already occupied", StatusCodes.Status400BadRequest);
            }

            game.Board[request.Row][request.Col] = request.Player;

            var winner = GameRules.GetWinner(game.Board);
            if (winner is not null)
            {
                game.Status = "finished";
                game.Winner = winner;
                return ServiceResult<GameState>.Success(game.Clone());
            }

            if (GameRules.IsBoardFull(game.Board))
            {
                game.Status = "finished";
                game.Winner = "draw";
                return ServiceResult<GameState>.Success(game.Clone());
            }

            game.CurrentPlayer = GameRules.SwitchPlayer(game.CurrentPlayer);
            return ServiceResult<GameState>.Success(game.Clone());
        }
    }
}