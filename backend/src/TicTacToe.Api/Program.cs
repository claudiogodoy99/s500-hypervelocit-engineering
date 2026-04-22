using TicTacToe.Api.Endpoints;
using TicTacToe.Api.Models;
using TicTacToe.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls(Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? "http://localhost:3000");
builder.Services.AddSingleton<IGameService, InMemoryGameService>();

var app = builder.Build();

app.Use(async (context, next) =>
{
	try
	{
		await next();
	}
	catch (Exception)
	{
		if (!context.Response.HasStarted)
		{
			context.Response.StatusCode = StatusCodes.Status500InternalServerError;
			await context.Response.WriteAsJsonAsync(new ErrorResponse("An unexpected error occurred"));
		}
	}
});

app.MapGameEndpoints();

app.Run();

public partial class Program;
