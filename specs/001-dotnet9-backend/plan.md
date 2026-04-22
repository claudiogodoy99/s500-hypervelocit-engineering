# Implementation Plan: .NET 9 Tic-Tac-Toe Backend Implementation

**Branch**: `001-dotnet9-backend` | **Date**: 2026-04-22 | **Spec**: `/specs/001-dotnet9-backend/spec.md`
**Input**: Feature specification from `/specs/001-dotnet9-backend/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a local-only .NET 9 backend in `backend/` that implements the constitution-defined Tic-Tac-Toe HTTP contract, stores games in memory, supports two-player turn-based play, and packages the service with a multi-stage Dockerfile. The implementation will use ASP.NET Core Minimal APIs, a thread-safe in-memory game store, and xUnit-based unit and integration tests.

## Technical Context

**Language/Version**: C# with .NET 9  
**Primary Dependencies**: ASP.NET Core 9 Minimal APIs, System.Text.Json, xUnit, FluentAssertions, WebApplicationFactory  
**Storage**: In-memory thread-safe game store using base class library collections  
**Testing**: xUnit for unit and integration tests, FluentAssertions for assertions, WebApplicationFactory for HTTP pipeline tests  
**Target Platform**: Local macOS or Linux development environment, container runtime via Docker  
**Project Type**: Web service  
**Performance Goals**: Endpoint responses under 200 ms in local conditions, state visibility within 2 seconds for polling clients  
**Constraints**: Must match the constitution JSON contract exactly, must stay inside `backend/`, no external persistence, local-only scope, Dockerized delivery  
**Scale/Scope**: Two active players per game, at least 10 concurrent games, one backend process per local environment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Contract-first development: Pass. `contracts/openapi.yaml` mirrors the constitution endpoints, status codes, and payload shapes without introducing extra endpoints.
- Layer ownership: Pass. All planned source code lives under `backend/` and no frontend changes are required.
- Local-only scope: Pass. Storage remains in memory, the server targets local execution, and Docker is used only for local packaging.
- Real-time gameplay: Pass. Polling against `GET /games/{gameId}` is the selected mechanism and satisfies the two-second update requirement.
- Simplicity: Pass. The design avoids persistence, authentication, external services, and unnecessary abstractions.

Post-design re-check: Pass. Phase 1 artifacts remain aligned with all constitutional gates.

## Project Structure

### Documentation (this feature)

```text
specs/001-dotnet9-backend/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

```text
specs/001-dotnet9-backend/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── Dockerfile
├── src/
│   └── TicTacToe.Api/
│       ├── Program.cs
│       ├── Endpoints/
│       ├── Models/
│       ├── Services/
│       └── Validation/
└── tests/
  └── TicTacToe.Api.Tests/
    ├── Unit/
    ├── Integration/
    └── Contract/
```

**Structure Decision**: Use a backend-only web service structure rooted at `backend/`. Separate runtime code from tests, keep endpoint registration and game logic distinct, and keep the Dockerfile at the backend boundary for clear local packaging.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
