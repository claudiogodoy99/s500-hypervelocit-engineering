using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TicTacToe.Api.Tests.Integration;

public sealed class RealtimePollingIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public RealtimePollingIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task PollingClient_ShouldObserveUpdatedStateWithinTwoSeconds()
    {
        using var clientA = _factory.CreateClient();
        using var clientB = _factory.CreateClient();

        var created = await (await clientA.PostAsync("/games", null)).Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();
        await clientA.PostAsync($"/games/{created!.GameId}/join", null);

        var moveResponse = await clientA.PostAsJsonAsync($"/games/{created.GameId}/move", new { player = "X", row = 2, col = 2 });
        moveResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var stopwatch = Stopwatch.StartNew();
        Contract.CreateGameContractTests.GameResponse? observed = null;

        while (stopwatch.Elapsed < TimeSpan.FromSeconds(2))
        {
            observed = await (await clientB.GetAsync($"/games/{created.GameId}")).Content.ReadFromJsonAsync<Contract.CreateGameContractTests.GameResponse>();
            if (observed!.Board[2][2] == "X")
            {
                break;
            }
        }

        observed.Should().NotBeNull();
        observed!.Board[2][2].Should().Be("X");
        stopwatch.Elapsed.Should().BeLessThan(TimeSpan.FromSeconds(2));
    }
}