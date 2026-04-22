using FluentAssertions;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Tests.Unit;

public sealed class GameCreationRulesTests
{
    [Fact]
    public void CreateGame_ShouldReturnWaitingGameWithEmptyBoard()
    {
        var service = new InMemoryGameService();

        var game = service.CreateGame();

        game.GameId.Should().NotBeNullOrWhiteSpace();
        game.Status.Should().Be("waiting");
        game.CurrentPlayer.Should().Be("X");
        game.Winner.Should().BeNull();
        game.Board.Should().HaveCount(3);
        game.Board.Should().OnlyContain(row => row.Length == 3);
        game.Board.SelectMany(row => row).Should().OnlyContain(cell => cell == "");
    }

    [Fact]
    public void CreateGame_ShouldGenerateUniqueIds()
    {
        var service = new InMemoryGameService();

        var first = service.CreateGame();
        var second = service.CreateGame();

        first.GameId.Should().NotBe(second.GameId);
    }
}