# Research: .NET 9 Tic-Tac-Toe Backend

## Decision 1: Use ASP.NET Core 9 Minimal APIs

- Decision: Build the backend as an ASP.NET Core 9 Minimal API service under `backend/`.
- Rationale: The service exposes four HTTP endpoints, has no UI rendering concerns, and must stay simple and local. Minimal APIs reduce boilerplate, keep endpoint definitions close to request handling logic, and are sufficient for a contract-first local backend.
- Alternatives considered:
  - MVC Controllers: Rejected because the project surface is small and does not benefit from controller layering.
  - gRPC: Rejected because the constitution defines an HTTP JSON contract.

## Decision 2: Use only built-in framework components for runtime dependencies

- Decision: Use ASP.NET Core routing, dependency injection, and `System.Text.Json`, plus `ConcurrentDictionary` from the base class library for the in-memory game store.
- Rationale: The constitution emphasizes simplicity and local-only scope. Built-in components are enough for routing, serialization, validation, and thread-safe state access.
- Alternatives considered:
  - Entity Framework Core: Rejected because persistence is out of scope.
  - Redis or external cache: Rejected because external infrastructure is out of scope.
  - MediatR or similar abstractions: Rejected because the service is small and direct service calls are clearer.

## Decision 3: Use xUnit-based unit, integration, and contract tests

- Decision: Use xUnit for tests, FluentAssertions for assertions, and `WebApplicationFactory` for integration and contract verification.
- Rationale: The service needs lightweight testing across game rules, endpoint behavior, and JSON contract compliance. This stack is standard for ASP.NET Core and supports isolated tests with low setup cost.
- Alternatives considered:
  - NUnit: Rejected because xUnit integrates more naturally with current ASP.NET Core test templates.
  - Postman-only contract checks: Rejected because automated regression coverage is required.

## Decision 4: Use polling-friendly HTTP state retrieval for real-time updates

- Decision: Support near-real-time updates through repeated `GET /games/{gameId}` requests from the frontend.
- Rationale: The constitution allows polling, SSE, or WebSocket. Polling is the simplest option that satisfies the two-second update requirement without introducing long-lived connection management.
- Alternatives considered:
  - Server-Sent Events: Rejected for first implementation because the frontend contract does not require a dedicated stream endpoint.
  - WebSockets: Rejected because the added connection lifecycle complexity is unnecessary for a two-player local game.

## Decision 5: Use a multi-stage Dockerfile with ASP.NET runtime image

- Decision: Build the container with `mcr.microsoft.com/dotnet/sdk:9.0` and run with `mcr.microsoft.com/dotnet/aspnet:9.0`.
- Rationale: A multi-stage Dockerfile keeps the runtime image smaller and matches the user request to use Docker. The app should listen on port `3000` in the container while remaining documented as `localhost:3000` for local access.
- Alternatives considered:
  - Single-stage SDK image: Rejected because it produces a larger runtime image.
  - Distroless or chiseled images: Rejected for first delivery because standard runtime images simplify local debugging.

## Constraints Confirmed

- The backend must preserve the exact JSON shapes defined in the constitution.
- All implementation work stays inside `backend/`.
- Storage remains in memory only.
- The service must support multiple concurrent games without cross-talk.
- The service must meet the local two-tab experience with state visible within two seconds.
