using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TicTacToe.Api.Tests.Contract;

public sealed class JoinGameContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public JoinGameContractTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task JoinGame_ShouldTransitionWaitingGameToInProgress()
    {
        var created = await (await _client.PostAsync("/games", null)).Content.ReadFromJsonAsync<CreateGameContractTests.GameResponse>();

        var response = await _client.PostAsync($"/games/{created!.GameId}/join", null);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var game = await response.Content.ReadFromJsonAsync<CreateGameContractTests.GameResponse>();
        game!.Status.Should().Be("in_progress");
        game.CurrentPlayer.Should().Be("X");
    }

    [Fact]
    public async Task JoinGame_ShouldRejectFullGame()
    {
        var created = await (await _client.PostAsync("/games", null)).Content.ReadFromJsonAsync<CreateGameContractTests.GameResponse>();
        await _client.PostAsync($"/games/{created!.GameId}/join", null);

        var response = await _client.PostAsync($"/games/{created.GameId}/join", null);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var error = await response.Content.ReadFromJsonAsync<GetGameContractTests.ErrorResponse>();
        error.Should().BeEquivalentTo(new GetGameContractTests.ErrorResponse("Game is already full"));
    }
}