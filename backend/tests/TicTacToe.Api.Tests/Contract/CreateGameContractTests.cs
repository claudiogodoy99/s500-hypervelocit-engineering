using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TicTacToe.Api.Tests.Contract;

public sealed class CreateGameContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public CreateGameContractTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task PostGames_ShouldMatchContract()
    {
        var response = await _client.PostAsync("/games", null);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var game = await response.Content.ReadFromJsonAsync<GameResponse>();
        game.Should().NotBeNull();
        game!.GameId.Should().NotBeNullOrWhiteSpace();
        game.CurrentPlayer.Should().Be("X");
        game.Status.Should().Be("waiting");
        game.Winner.Should().BeNull();
        game.Board.Should().HaveCount(3);
        game.Board.Should().OnlyContain(row => row.Length == 3);
        game.Board.SelectMany(row => row).Should().OnlyContain(cell => cell == "");
    }

    internal sealed class GameResponse
    {
        public string GameId { get; set; } = string.Empty;
        public string[][] Board { get; set; } = [];
        public string CurrentPlayer { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Winner { get; set; }
    }
}