namespace TicTacToe.Api.Models;

public sealed class GameState
{
    public required string GameId { get; init; }

    public required string[][] Board { get; init; }

    public required string CurrentPlayer { get; set; }

    public required string Status { get; set; }

    public string? Winner { get; set; }

    public static GameState CreateNew(string gameId)
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
            Status = "waiting",
            Winner = null
        };
    }

    public GameState Clone()
    {
        return new GameState
        {
            GameId = GameId,
            Board = Board.Select(row => row.ToArray()).ToArray(),
            CurrentPlayer = CurrentPlayer,
            Status = Status,
            Winner = Winner
        };
    }
}