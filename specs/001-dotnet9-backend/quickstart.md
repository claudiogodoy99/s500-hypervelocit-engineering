# Quickstart: .NET 9 Tic-Tac-Toe Backend

## Prerequisites

- .NET 9 SDK installed
- Docker installed for containerized execution
- Terminal opened at repository root
- `dotnet --version` returns a 9.x SDK before local build and test commands are run

## Project layout

```text
backend/
├── src/
│   └── TicTacToe.Api/
└── tests/
    └── TicTacToe.Api.Tests/
```

## Run locally with .NET

1. Create the backend project structure under `backend/`.
2. Restore dependencies:
   ```bash
   dotnet restore backend/src/TicTacToe.Api/TicTacToe.Api.csproj
   ```
3. Run the API on port 3000:
   ```bash
   ASPNETCORE_URLS=http://localhost:3000 dotnet run --project backend/src/TicTacToe.Api/TicTacToe.Api.csproj
   ```

## Run tests

```bash
dotnet test backend/tests/TicTacToe.Api.Tests
```

## Build and run with Docker

1. Build the image:
   ```bash
   docker build -t tictactoe-backend -f backend/Dockerfile backend
   ```
2. Run the container:
   ```bash
   docker run --rm -p 3000:3000 tictactoe-backend
   ```

## Smoke test the contract

### Create a game

```bash
curl -X POST http://localhost:3000/games
```

### Get a game by id

```bash
curl http://localhost:3000/games/<gameId>
```

### Join a game

```bash
curl -X POST http://localhost:3000/games/<gameId>/join
```

### Make a move

```bash
curl -X POST http://localhost:3000/games/<gameId>/move \
  -H "Content-Type: application/json" \
  -d '{"player":"X","row":0,"col":0}'
```

## Validation expectations

- Responses must match the JSON contract in the constitution.
- The API must stay local-only and use in-memory storage.
- Frontend polling against `GET /games/{gameId}` should observe move updates within two seconds.
- `docker build -t tictactoe-backend -f backend/Dockerfile backend` must succeed before release.
