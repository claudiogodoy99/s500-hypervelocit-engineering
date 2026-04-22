namespace TicTacToe.Api.Validation;

public static class GameRules
{
    public static string? GetWinner(string[][] board)
    {
        for (var index = 0; index < 3; index++)
        {
            if (IsWinningLine(board[index][0], board[index][1], board[index][2]))
            {
                return board[index][0];
            }

            if (IsWinningLine(board[0][index], board[1][index], board[2][index]))
            {
                return board[0][index];
            }
        }

        if (IsWinningLine(board[0][0], board[1][1], board[2][2]))
        {
            return board[0][0];
        }

        if (IsWinningLine(board[0][2], board[1][1], board[2][0]))
        {
            return board[0][2];
        }

        return null;
    }

    public static bool IsBoardFull(string[][] board)
    {
        return board.All(row => row.All(cell => !string.IsNullOrEmpty(cell)));
    }

    public static string SwitchPlayer(string currentPlayer)
    {
        return currentPlayer == "X" ? "O" : "X";
    }

    private static bool IsWinningLine(string first, string second, string third)
    {
        return !string.IsNullOrEmpty(first) && first == second && second == third;
    }
}