using TicTacToe.Api.Endpoints;
using TicTacToe.Api.Models;
using TicTacToe.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls(Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? "http://localhost:3000");
builder.Services.AddSingleton<IGameService, InMemoryGameService>();

const string CorsPolicyName = "FrontendCors";
var allowedOrigins = (builder.Configuration["Cors:AllowedOrigins"]
        ?? Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS")
        ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors(CorsPolicyName);

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
