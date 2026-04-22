using TicTacToe.Api.Models;

namespace TicTacToe.Api.Tests.Testing;

internal static class TestGameFactory
{
    public static GameState CreateInProgressGame(string gameId = "game-1")
    {
        return new GameState
        {
            GameId = gameId,
            Board =
            [
                ["", "", ""],
                ["", "", ""],
                ["", "", ""]
            ],
            CurrentPlayer = "X",
            Status = "in_progress",
            Winner = null
        };
    }
}