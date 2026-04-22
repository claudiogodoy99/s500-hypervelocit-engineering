using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TicTacToe.Api.Tests.Integration;

public sealed class GetGameIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public GetGameIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetGame_ShouldReturnSameStateAcrossRequests()
    {
        var created = await (await _client.PostAsync("/games", null)).Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();

        var first = await (await _client.GetAsync($"/games/{created!.GameId}")).Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();
        var second = await (await _client.GetAsync($"/games/{created.GameId}")).Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();

        second.Should().BeEquivalentTo(first);
    }

    [Fact]
    public async Task GetGame_ShouldReturnNotFoundForUnknownId()
    {
        var response = await _client.GetAsync("/games/does-not-exist");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}