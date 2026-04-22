using TicTacToe.Api.Models;
using TicTacToe.Api.Services;

namespace TicTacToe.Api.Endpoints;

public static class GameEndpoints
{
    public static IEndpointRouteBuilder MapGameEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/games", (IGameService service) =>
        {
            var game = service.CreateGame();
            return TypedResults.Created($"/games/{game.GameId}", game);
        });

        endpoints.MapGet("/games/{gameId}", (string gameId, HttpContext httpContext, IGameService service) =>
        {
            httpContext.Response.Headers.CacheControl = "no-store";

            return service.TryGetGame(gameId, out var game)
                ? Results.Ok(game)
                : Results.NotFound(new ErrorResponse("Game not found"));
        });

        endpoints.MapPost("/games/{gameId}/join", (string gameId, IGameService service) =>
        {
            var result = service.JoinGame(gameId);
            return ToResult(result);
        });

        endpoints.MapPost("/games/{gameId}/move", (string gameId, MoveRequest request, IGameService service) =>
        {
            var result = service.MakeMove(gameId, request);
            return ToResult(result);
        });

        return endpoints;
    }

    private static IResult ToResult(ServiceResult<GameState> result)
    {
        if (result.IsSuccess)
        {
            return Results.Ok(result.Value);
        }

        return result.StatusCode switch
        {
            StatusCodes.Status404NotFound => Results.NotFound(result.Error),
            _ => Results.BadRequest(result.Error)
        };
    }
}