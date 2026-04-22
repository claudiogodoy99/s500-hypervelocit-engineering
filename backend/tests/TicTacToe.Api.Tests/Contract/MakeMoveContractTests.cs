using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TicTacToe.Api.Tests.Contract;

public sealed class MakeMoveContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public MakeMoveContractTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task MakeMove_ShouldReturnUpdatedGameState()
    {
        var created = await (await _client.PostAsync("/games", null)).Content.ReadFromJsonAsync<CreateGameContractTests.GameResponse>();
        await _client.PostAsync($"/games/{created!.GameId}/join", null);

        var response = await _client.PostAsJsonAsync($"/games/{created.GameId}/move", new
        {
            player = "X",
            row = 0,
            col = 0
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var game = await response.Content.ReadFromJsonAsync<CreateGameContractTests.GameResponse>();
        game!.Board[0][0].Should().Be("X");
        game.CurrentPlayer.Should().Be("O");
        game.Status.Should().Be("in_progress");
        game.Winner.Should().BeNull();
    }

    [Fact]
    public async Task MakeMove_ShouldRejectOccupiedCell()
    {
        var created = await (await _client.PostAsync("/games", null)).Content.ReadFromJsonAsync<CreateGameContractTests.GameResponse>();
        await _client.PostAsync($"/games/{created!.GameId}/join", null);
        await _client.PostAsJsonAsync($"/games/{created.GameId}/move", new { player = "X", row = 0, col = 0 });
        await _client.PostAsJsonAsync($"/games/{created.GameId}/move", new { player = "O", row = 1, col = 1 });

        var response = await _client.PostAsJsonAsync($"/games/{created.GameId}/move", new { player = "X", row = 0, col = 0 });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var error = await response.Content.ReadFromJsonAsync<GetGameContractTests.ErrorResponse>();
        error.Should().BeEquivalentTo(new GetGameContractTests.ErrorResponse("Cell already occupied"));
    }
}