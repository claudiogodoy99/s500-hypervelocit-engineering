using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TicTacToe.Api.Tests.Integration;

public sealed class ConcurrentGamesIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ConcurrentGamesIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task DifferentGames_ShouldNotAffectEachOther()
    {
        var first = await (await _client.PostAsync("/games", null)).Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();
        var second = await (await _client.PostAsync("/games", null)).Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();

        await _client.PostAsync($"/games/{first!.GameId}/join", null);
        await _client.PostAsync($"/games/{second!.GameId}/join", null);
        await _client.PostAsJsonAsync($"/games/{first.GameId}/move", new { player = "X", row = 0, col = 0 });

        var firstGame = await (await _client.GetAsync($"/games/{first.GameId}")).Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();
        var secondGame = await (await _client.GetAsync($"/games/{second.GameId}")).Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();

        firstGame!.Board[0][0].Should().Be("X");
        secondGame!.Board[0][0].Should().Be("");
    }
}