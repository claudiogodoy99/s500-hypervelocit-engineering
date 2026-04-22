using TicTacToe.Api.Models;

namespace TicTacToe.Api.Services;

public interface IGameService
{
    GameState CreateGame();

    bool TryGetGame(string gameId, out GameState? game);

    ServiceResult<GameState> JoinGame(string gameId);

    ServiceResult<GameState> MakeMove(string gameId, MoveRequest? request);
}