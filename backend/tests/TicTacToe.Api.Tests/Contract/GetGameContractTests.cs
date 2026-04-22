using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TicTacToe.Api.Tests.Contract;

public sealed class GetGameContractTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public GetGameContractTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetGame_ShouldReturnCreatedGame()
    {
        var created = await (await _client.PostAsync("/games", null)).Content.ReadFromJsonAsync<CreateGameContractTests.GameResponse>();

        var response = await _client.GetAsync($"/games/{created!.GameId}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Headers.CacheControl!.NoStore.Should().BeTrue();
        var game = await response.Content.ReadFromJsonAsync<CreateGameContractTests.GameResponse>();
        game!.GameId.Should().Be(created.GameId);
        game.Status.Should().Be("waiting");
    }

    [Fact]
    public async Task GetGame_ShouldReturnNotFoundError()
    {
        var response = await _client.GetAsync("/games/missing");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        var error = await response.Content.ReadFromJsonAsync<ErrorResponse>();
        error.Should().BeEquivalentTo(new ErrorResponse("Game not found"));
    }

    internal sealed record ErrorResponse(string Error);
}