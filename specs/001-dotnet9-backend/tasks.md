# Tasks: .NET 9 Tic-Tac-Toe Backend Implementation

**Input**: Design documents from `/specs/001-dotnet9-backend/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`

**Tests**: This feature includes unit, integration, and contract tests because the plan and quickstart require automated validation of the HTTP contract and gameplay rules.

**Organization**: Tasks are grouped by user story so each slice can be implemented and validated independently as far as the game flow allows.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the backend solution and development baseline under `backend/`

- [ ] T001 Create the solution and project structure in `backend/TicTacToe.sln`, `backend/src/TicTacToe.Api/TicTacToe.Api.csproj`, and `backend/tests/TicTacToe.Api.Tests/TicTacToe.Api.Tests.csproj`
- [ ] T002 Configure .NET 9 dependencies, test packages, and project references in `backend/src/TicTacToe.Api/TicTacToe.Api.csproj` and `backend/tests/TicTacToe.Api.Tests/TicTacToe.Api.Tests.csproj`
- [ ] T003 [P] Create container build files in `backend/Dockerfile` and `backend/.dockerignore`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the core runtime structure that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create shared game domain models in `backend/src/TicTacToe.Api/Models/GameState.cs`, `backend/src/TicTacToe.Api/Models/MoveRequest.cs`, and `backend/src/TicTacToe.Api/Models/ErrorResponse.cs`
- [ ] T005 [P] Implement rule and request validation helpers in `backend/src/TicTacToe.Api/Validation/GameRules.cs` and `backend/src/TicTacToe.Api/Validation/MoveRequestValidator.cs`
- [ ] T006 [P] Implement the in-memory service contract and thread-safe game store in `backend/src/TicTacToe.Api/Services/IGameService.cs` and `backend/src/TicTacToe.Api/Services/InMemoryGameService.cs`
- [ ] T007 [P] Configure application bootstrap, dependency injection, JSON serialization, and global error handling in `backend/src/TicTacToe.Api/Program.cs`
- [ ] T008 Create endpoint registration scaffolding in `backend/src/TicTacToe.Api/Endpoints/GameEndpoints.cs`

**Checkpoint**: Foundation ready. User story implementation can begin.

---

## Phase 3: User Story 1 - Create a New Game (Priority: P1)

**Goal**: Allow a player to create a new game and receive the initial game state.

**Independent Test**: Call `POST /games` and verify a `201 Created` response with a unique `gameId`, empty board, `currentPlayer` set to `X`, `status` set to `waiting`, and `winner` set to `null`.

### Tests for User Story 1

- [ ] T009 [P] [US1] Add contract test for `POST /games` in `backend/tests/TicTacToe.Api.Tests/Contract/CreateGameContractTests.cs`
- [ ] T010 [P] [US1] Add integration test for the create-game flow in `backend/tests/TicTacToe.Api.Tests/Integration/CreateGameIntegrationTests.cs`
- [ ] T011 [P] [US1] Add unit tests for initial game creation rules in `backend/tests/TicTacToe.Api.Tests/Unit/GameCreationRulesTests.cs`

### Implementation for User Story 1

- [ ] T012 [US1] Implement new game creation behavior in `backend/src/TicTacToe.Api/Services/InMemoryGameService.cs`
- [ ] T013 [US1] Implement the `POST /games` endpoint and response mapping in `backend/src/TicTacToe.Api/Endpoints/GameEndpoints.cs`

**Checkpoint**: User Story 1 returns the contract-compliant initial game state and is testable on its own.

---

## Phase 4: User Story 2 - Retrieve Game State (Priority: P1)

**Goal**: Allow a player to retrieve the current state of an existing game or receive a contract-compliant not-found error.

**Independent Test**: Create a game, call `GET /games/{gameId}`, and verify the stored state is returned. Call the endpoint with a missing id and verify a `404` response with `{ "error": "Game not found" }`.

### Tests for User Story 2

- [ ] T014 [P] [US2] Add contract test for `GET /games/{gameId}` in `backend/tests/TicTacToe.Api.Tests/Contract/GetGameContractTests.cs`
- [ ] T015 [P] [US2] Add integration test for existing and missing game retrieval in `backend/tests/TicTacToe.Api.Tests/Integration/GetGameIntegrationTests.cs`

### Implementation for User Story 2

- [ ] T016 [US2] Implement game lookup behavior in `backend/src/TicTacToe.Api/Services/InMemoryGameService.cs`
- [ ] T017 [US2] Implement the `GET /games/{gameId}` endpoint and `404` error mapping in `backend/src/TicTacToe.Api/Endpoints/GameEndpoints.cs`

**Checkpoint**: User Stories 1 and 2 work together, and game state retrieval is independently verifiable.

---

## Phase 5: User Story 3 - Join an Existing Game (Priority: P1)

**Goal**: Allow a second player to join a waiting game and transition it to `in_progress`.

**Independent Test**: Create a game, call `POST /games/{gameId}/join`, and verify the returned game has `status` set to `in_progress`. A second join attempt must return `{ "error": "Game is already full" }` with `400`.

### Tests for User Story 3

- [ ] T018 [P] [US3] Add contract test for `POST /games/{gameId}/join` in `backend/tests/TicTacToe.Api.Tests/Contract/JoinGameContractTests.cs`
- [ ] T019 [P] [US3] Add integration test for join success and full-game rejection in `backend/tests/TicTacToe.Api.Tests/Integration/JoinGameIntegrationTests.cs`

### Implementation for User Story 3

- [ ] T020 [US3] Implement join-game transition rules in `backend/src/TicTacToe.Api/Services/InMemoryGameService.cs`
- [ ] T021 [US3] Implement the `POST /games/{gameId}/join` endpoint and error mapping in `backend/src/TicTacToe.Api/Endpoints/GameEndpoints.cs`

**Checkpoint**: User Stories 1 through 3 support game creation, lookup, and transition to active play.

---

## Phase 6: User Story 4 - Execute a Player Move (Priority: P1)

**Goal**: Allow valid moves, enforce turn order and board constraints, and detect wins and draws.

**Independent Test**: Create and join a game, submit valid moves to complete a normal turn, a winning sequence, and a draw sequence, and verify invalid move cases return the contract-compliant `400` errors.

### Tests for User Story 4

- [ ] T022 [P] [US4] Add contract test for `POST /games/{gameId}/move` in `backend/tests/TicTacToe.Api.Tests/Contract/MakeMoveContractTests.cs`
- [ ] T023 [P] [US4] Add integration test for valid and invalid move scenarios in `backend/tests/TicTacToe.Api.Tests/Integration/MakeMoveIntegrationTests.cs`
- [ ] T024 [P] [US4] Add unit tests for turn enforcement, win detection, and draw detection in `backend/tests/TicTacToe.Api.Tests/Unit/GameRuleEvaluationTests.cs`

### Implementation for User Story 4

- [ ] T025 [US4] Implement move validation, board mutation, and win or draw evaluation in `backend/src/TicTacToe.Api/Services/InMemoryGameService.cs`
- [ ] T026 [US4] Implement the `POST /games/{gameId}/move` endpoint and request validation in `backend/src/TicTacToe.Api/Endpoints/GameEndpoints.cs`

**Checkpoint**: User Stories 1 through 4 deliver a fully playable local game flow.

---

## Phase 7: User Story 5 - Support Real-Time Game Updates (Priority: P2)

**Goal**: Ensure separate clients can observe up-to-date game state through polling within the required two-second window.

**Independent Test**: Run two clients against the same game, make a move from one client, and verify the second client sees the updated state through `GET /games/{gameId}` within two seconds.

### Tests for User Story 5

- [ ] T027 [P] [US5] Add integration test for two-client polling visibility in `backend/tests/TicTacToe.Api.Tests/Integration/RealtimePollingIntegrationTests.cs`
- [ ] T028 [P] [US5] Add integration test for concurrent independent games without cross-talk in `backend/tests/TicTacToe.Api.Tests/Integration/ConcurrentGamesIntegrationTests.cs`

### Implementation for User Story 5

- [ ] T029 [US5] Harden concurrent read and write behavior for polling clients in `backend/src/TicTacToe.Api/Services/InMemoryGameService.cs`
- [ ] T030 [US5] Add polling-friendly cache control behavior to game retrieval responses in `backend/src/TicTacToe.Api/Endpoints/GameEndpoints.cs`

**Checkpoint**: All user stories are complete, and the local two-tab polling experience is validated.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements that affect multiple user stories

- [ ] T031 [P] Add final Docker runtime wiring and port configuration validation in `backend/Dockerfile` and `backend/src/TicTacToe.Api/Program.cs`
- [ ] T032 [P] Add end-to-end quickstart validation coverage in `backend/tests/TicTacToe.Api.Tests/Integration/QuickstartSmokeTests.cs`
- [ ] T033 Update local run and verification steps in `specs/001-dotnet9-backend/quickstart.md`
- [ ] T034 Run the full backend validation workflow in `backend/tests/TicTacToe.Api.Tests` and verify the container build from `backend/Dockerfile`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. Start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. Blocks all user stories.
- **User Stories (Phase 3 onward)**: Depend on Foundational completion.
- **Polish (Phase 8)**: Depends on completion of all targeted user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational. No dependency on other user stories.
- **User Story 2 (P1)**: Starts after Foundational. Uses game creation from US1 for end-to-end verification but has its own endpoint behavior.
- **User Story 3 (P1)**: Starts after Foundational. Uses game creation from US1 for end-to-end verification.
- **User Story 4 (P1)**: Starts after Foundational. Requires the US1 and US3 flows to exercise the full gameplay journey.
- **User Story 5 (P2)**: Starts after Foundational. Depends functionally on US2 and US4 because polling verifies updated game state after moves.

### Within Each User Story

- Tests must be written first and fail before implementation.
- Service logic must be implemented before endpoint wiring.
- Endpoint behavior must be complete before story-level validation.
- Each story must pass its independent test before moving forward.

### Story Completion Order

1. US1 Create a New Game
2. US2 Retrieve Game State
3. US3 Join an Existing Game
4. US4 Execute a Player Move
5. US5 Support Real-Time Game Updates

### Parallel Opportunities

- T003 can run in parallel with T001 and T002.
- T005, T006, and T007 can run in parallel after T004.
- Within each user story, the test tasks marked `[P]` can run in parallel.
- US5 test tasks T027 and T028 can run in parallel once gameplay endpoints are complete.
- Polish tasks T031 and T032 can run in parallel before T033 and T034.

---

## Parallel Example: User Story 1

```bash
# Run the US1 tests in parallel:
Task: T009 backend/tests/TicTacToe.Api.Tests/Contract/CreateGameContractTests.cs
Task: T010 backend/tests/TicTacToe.Api.Tests/Integration/CreateGameIntegrationTests.cs
Task: T011 backend/tests/TicTacToe.Api.Tests/Unit/GameCreationRulesTests.cs
```

## Parallel Example: User Story 4

```bash
# Run the US4 test suite in parallel:
Task: T022 backend/tests/TicTacToe.Api.Tests/Contract/MakeMoveContractTests.cs
Task: T023 backend/tests/TicTacToe.Api.Tests/Integration/MakeMoveIntegrationTests.cs
Task: T024 backend/tests/TicTacToe.Api.Tests/Unit/GameRuleEvaluationTests.cs
```

## Parallel Example: User Story 5

```bash
# Run the US5 integration checks in parallel:
Task: T027 backend/tests/TicTacToe.Api.Tests/Integration/RealtimePollingIntegrationTests.cs
Task: T028 backend/tests/TicTacToe.Api.Tests/Integration/ConcurrentGamesIntegrationTests.cs
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 through US4.
3. Validate the playable game loop locally.
4. Stop and confirm the backend contract and gameplay before adding US5.

### Incremental Delivery

1. Deliver US1 to establish contract-compliant game creation.
2. Deliver US2 to support state retrieval.
3. Deliver US3 to activate two-player sessions.
4. Deliver US4 to complete the playable game flow.
5. Deliver US5 to validate the near-real-time polling experience.
6. Finish with Polish tasks for Docker and quickstart validation.

### Suggested MVP Scope

The first fully valuable backend increment is **US1 through US4**, because those phases produce a complete playable local game. US5 extends the experience with explicit polling validation and concurrency confidence.

---

## Notes

- `[P]` marks tasks that can run in parallel because they touch separate files or independent test slices.
- `[US1]` through `[US5]` map each implementation task back to the feature specification.
- Every task includes an exact file path so the implementation is immediately actionable.
- `T034` is a validation task and intentionally has no `[P]` marker because it depends on the earlier phases being complete.
