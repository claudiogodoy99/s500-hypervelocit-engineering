using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TicTacToe.Api.Tests.Integration;

public sealed class JoinGameIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public JoinGameIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task JoinGame_ShouldAllowSecondPlayerToStartMatch()
    {
        var created = await (await _client.PostAsync("/games", null)).Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();

        var joined = await (await _client.PostAsync($"/games/{created!.GameId}/join", null)).Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();

        joined!.Status.Should().Be("in_progress");
    }

    [Fact]
    public async Task JoinGame_ShouldRejectSecondJoinAttempt()
    {
        var created = await (await _client.PostAsync("/games", null)).Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();
        await _client.PostAsync($"/games/{created!.GameId}/join", null);

        var response = await _client.PostAsync($"/games/{created.GameId}/join", null);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}