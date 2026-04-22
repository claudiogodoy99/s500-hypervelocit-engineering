using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TicTacToe.Api.Tests.Integration;

public sealed class MakeMoveIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public MakeMoveIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task MakeMove_ShouldAdvanceTurnAfterValidMove()
    {
        var created = await (await _client.PostAsync("/games", null)).Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();
        await _client.PostAsync($"/games/{created!.GameId}/join", null);

        var response = await _client.PostAsJsonAsync($"/games/{created.GameId}/move", new { player = "X", row = 1, col = 1 });
        var game = await response.Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        game!.CurrentPlayer.Should().Be("O");
    }

    [Fact]
    public async Task MakeMove_ShouldRejectMoveBeforeGameStarts()
    {
        var created = await (await _client.PostAsync("/games", null)).Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();

        var response = await _client.PostAsJsonAsync($"/games/{created!.GameId}/move", new { player = "X", row = 0, col = 0 });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}