using TicTacToe.Api.Models;

namespace TicTacToe.Api.Validation;

public static class MoveRequestValidator
{
    public static string? Validate(MoveRequest? request)
    {
        if (request is null)
        {
            return "Request body is required";
        }

        if (request.Player is not ("X" or "O"))
        {
            return "Player must be X or O";
        }

        if (request.Row is < 0 or > 2)
        {
            return "Row must be between 0 and 2";
        }

        if (request.Col is < 0 or > 2)
        {
            return "Col must be between 0 and 2";
        }

        return null;
    }
}