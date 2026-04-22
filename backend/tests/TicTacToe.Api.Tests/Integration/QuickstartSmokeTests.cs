using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TicTacToe.Api.Tests.Integration;

public sealed class QuickstartSmokeTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public QuickstartSmokeTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task QuickstartFlow_ShouldCreateJoinMoveAndRetrieveGame()
    {
        var createdResponse = await _client.PostAsync("/games", null);
        createdResponse.StatusCode.Should().Be(HttpStatusCode.Created);

        var created = await createdResponse.Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();

        var joinResponse = await _client.PostAsync($"/games/{created!.GameId}/join", null);
        joinResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var moveResponse = await _client.PostAsJsonAsync($"/games/{created.GameId}/move", new { player = "X", row = 0, col = 0 });
        moveResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var gameResponse = await _client.GetAsync($"/games/{created.GameId}");
        gameResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var game = await gameResponse.Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();
        game!.Board[0][0].Should().Be("X");
    }
}