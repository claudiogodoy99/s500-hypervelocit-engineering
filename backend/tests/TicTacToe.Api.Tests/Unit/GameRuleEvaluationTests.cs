using FluentAssertions;
using TicTacToe.Api.Models;
using TicTacToe.Api.Services;
using TicTacToe.Api.Validation;

namespace TicTacToe.Api.Tests.Unit;

public sealed class GameRuleEvaluationTests
{
    [Fact]
    public void GetWinner_ShouldDetectRowWinner()
    {
        var board = new[]
        {
            new[] { "X", "X", "X" },
            new[] { "", "O", "" },
            new[] { "O", "", "" }
        };

        var winner = GameRules.GetWinner(board);

        winner.Should().Be("X");
    }

    [Fact]
    public void MakeMove_ShouldRejectWrongPlayerTurn()
    {
        var service = new InMemoryGameService();
        var game = service.CreateGame();
        service.JoinGame(game.GameId);

        var result = service.MakeMove(game.GameId, new MoveRequest
        {
            Player = "O",
            Row = 0,
            Col = 0
        });

        result.IsSuccess.Should().BeFalse();
        result.Error!.Error.Should().Be("Not your turn");
    }

    [Fact]
    public void MakeMove_ShouldFinishGameWhenWinningMoveIsMade()
    {
        var service = new InMemoryGameService();
        var game = service.CreateGame();
        service.JoinGame(game.GameId);

        service.MakeMove(game.GameId, new MoveRequest { Player = "X", Row = 0, Col = 0 });
        service.MakeMove(game.GameId, new MoveRequest { Player = "O", Row = 1, Col = 0 });
        service.MakeMove(game.GameId, new MoveRequest { Player = "X", Row = 0, Col = 1 });
        service.MakeMove(game.GameId, new MoveRequest { Player = "O", Row = 1, Col = 1 });

        var result = service.MakeMove(game.GameId, new MoveRequest { Player = "X", Row = 0, Col = 2 });

        result.IsSuccess.Should().BeTrue();
        result.Value!.Status.Should().Be("finished");
        result.Value.Winner.Should().Be("X");
    }

    [Fact]
    public void MakeMove_ShouldMarkDrawWhenBoardIsFilledWithoutWinner()
    {
        var service = new InMemoryGameService();
        var game = service.CreateGame();
        service.JoinGame(game.GameId);

        var moves = new[]
        {
            new MoveRequest { Player = "X", Row = 0, Col = 0 },
            new MoveRequest { Player = "O", Row = 0, Col = 1 },
            new MoveRequest { Player = "X", Row = 0, Col = 2 },
            new MoveRequest { Player = "O", Row = 1, Col = 1 },
            new MoveRequest { Player = "X", Row = 1, Col = 0 },
            new MoveRequest { Player = "O", Row = 1, Col = 2 },
            new MoveRequest { Player = "X", Row = 2, Col = 1 },
            new MoveRequest { Player = "O", Row = 2, Col = 0 },
            new MoveRequest { Player = "X", Row = 2, Col = 2 }
        };

        ServiceResult<GameState>? finalResult = null;
        foreach (var move in moves)
        {
            finalResult = service.MakeMove(game.GameId, move);
        }

        finalResult.Should().NotBeNull();
        finalResult!.Value!.Status.Should().Be("finished");
        finalResult.Value.Winner.Should().Be("draw");
    }
}