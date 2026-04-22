namespace TicTacToe.Api.Models;

public sealed class MoveRequest
{
    public required string Player { get; init; }

    public required int Row { get; init; }

    public required int Col { get; init; }
}