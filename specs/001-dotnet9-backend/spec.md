# Feature Specification: .NET 9 Tic-Tac-Toe Backend Implementation

**Feature Branch**: `001-dotnet9-backend`  
**Created**: 2026-04-22  
**Status**: Draft  
**Input**: "Build a back-end, using .net 9. Add code to the `backend` directory. Follow the contracts in the constitutions. Use dockerfile."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a New Game (Priority: P1)

A player initiates a new game of Tic-Tac-Toe by requesting the backend to create a game session. The backend responds with a new empty game board, assigns a unique game ID, sets the first player as `X`, and marks the game status as `waiting` for the second player to join.

**Why this priority**: This is the foundational entry point for the entire game flow. Without this capability, no player can start a game. It's required before any other functionality can be used.

**Independent Test**: Can be fully tested by calling `POST /games` with an empty request body and verifying that a valid game object with an empty board and `status: "waiting"` is returned. Delivers immediate value by establishing the game session lifecycle.

**Acceptance Scenarios**:

1. **Given** the backend service is running, **When** a player calls `POST /games`, **Then** the backend responds with a 201 status code and a game object containing a unique `gameId`, empty 3x3 board, `currentPlayer: "X"`, `status: "waiting"`, and `winner: null`.

2. **Given** multiple sequential `POST /games` requests, **When** different clients call the endpoint, **Then** each receives a distinct `gameId`.

---

### User Story 2 - Retrieve Game State (Priority: P1)

A player queries the current state of a specific game to know the board layout, whose turn it is, and whether the game has ended. The backend retrieves the game from its store and returns the complete game object.

**Why this priority**: Players need real-time visibility into the game state to make informed moves. This is critical for both local synchronization and supporting multiple browser tabs.

**Independent Test**: Can be fully tested by creating a game, then calling `GET /games/:gameId` and verifying the returned state matches the created game. Works independently and delivers value by enabling read access to game data.

**Acceptance Scenarios**:

1. **Given** a game exists with `gameId: "abc123"`, **When** a player calls `GET /games/abc123`, **Then** the backend responds with 200 status and returns the complete game object including current board, currentPlayer, status, and winner.

2. **Given** a request for a non-existent game ID, **When** a player calls `GET /games/invalid123`, **Then** the backend responds with 404 status and an error message `{"error": "Game not found"}`.

---

### User Story 3 - Join an Existing Game (Priority: P1)

A second player joins a game that is in `waiting` status. The backend transitions the game to `in_progress` status and confirms the player is ready to play.

**Why this priority**: The core game experience requires two players. Without join functionality, the game cannot progress from waiting state to active play.

**Independent Test**: Can be fully tested by creating a game, calling `POST /games/:gameId/join` from a second client, and verifying the game transitions to `in_progress` and board remains unchanged.

**Acceptance Scenarios**:

1. **Given** a game in `waiting` status, **When** a second player calls `POST /games/:gameId/join`, **Then** the backend responds with 200 status, transitions the game to `status: "in_progress"`, and returns the updated game object.

2. **Given** a game already in `in_progress` status, **When** a third player calls `POST /games/:gameId/join`, **Then** the backend responds with 400 status and error message `{"error": "Game is already full"}`.

---

### User Story 4 - Execute a Player Move (Priority: P1)

A player submits a move by specifying their marker (`X` or `O`), the target row (0–2), and target column (0–2). The backend validates the move, updates the board, checks for win/draw conditions, switches the current player, and returns the updated game state.

**Why this priority**: This is the core gameplay mechanic. The game cannot be played without the ability to place moves on the board.

**Independent Test**: Can be fully tested by creating a game, joining with a second player, then submitting a valid move and verifying the board is updated and currentPlayer switches. Works independently as a core game function.

**Acceptance Scenarios**:

1. **Given** a game in `in_progress` status with `currentPlayer: "X"`, **When** player X calls `POST /games/:gameId/move` with `{"player": "X", "row": 0, "col": 0}`, **Then** the backend responds with 200 status, places `X` at position [0][0], switches `currentPlayer` to `O`, and returns the updated board.

2. **Given** a game where player X has made a move, **When** player O (not the current player) calls `POST /games/:gameId/move` with a valid move, **Then** the backend responds with 400 status and error message `{"error": "Not your turn"}`.

3. **Given** a game with a cell already occupied at [1][1], **When** a player calls `POST /games/:gameId/move` targeting that cell, **Then** the backend responds with 400 status and error message `{"error": "Cell already occupied"}`.

4. **Given** a game with `status: "finished"`, **When** a player attempts to call `POST /games/:gameId/move`, **Then** the backend responds with 400 status and error message `{"error": "Game is already over"}`.

---

### User Story 5 - Support Real-Time Game Updates (Priority: P2)

Players in two separate browser tabs receive near-instantaneous updates when the opponent makes a move. The backend provides a mechanism (polling or server-sent events) that allows the frontend to detect state changes without manual refresh.

**Why this priority**: Ensures smooth, responsive gameplay experience. Without this, users must manually refresh to see opponent moves.

**Independent Test**: Can be tested by simulating two concurrent clients, having one make a move, then verifying the other can query the updated state within 2 seconds.

**Acceptance Scenarios**:

1. **Given** two clients connected to the same game, **When** client A makes a move via `POST /games/:gameId/move`, **Then** client B can retrieve the updated state via `GET /games/:gameId` with the new board within 2 seconds.

---

### Edge Cases

- What happens when a player completes a row, column, or diagonal with three of their markers?
- How does the system detect a draw when the board is full with no winner?
- What is the behavior if a malformed request (invalid JSON, missing fields) is sent to an endpoint?
- How does the system handle concurrent move submissions from both players on the same cell?
- What happens if a client attempts to join a game that is already finished?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Backend MUST implement `POST /games` endpoint that creates a new game session with an empty 3x3 board, assigns a unique `gameId`, sets `currentPlayer` to `"X"`, sets `status` to `"waiting"`, and sets `winner` to `null`.

- **FR-002**: Backend MUST implement `GET /games/:gameId` endpoint that retrieves the complete game state for a given `gameId`, returning 200 with the game object on success or 404 with error message if game is not found.

- **FR-003**: Backend MUST implement `POST /games/:gameId/join` endpoint that transitions a game from `"waiting"` to `"in_progress"` status, rejecting join attempts if the game is already full (status not `"waiting"`) with a 400 error.

- **FR-004**: Backend MUST implement `POST /games/:gameId/move` endpoint that accepts a move request containing `player` (`"X"` or `"O"`), `row` (0–2), and `col` (0–2).

- **FR-005**: Backend MUST validate each move by ensuring:
  - The specified cell is empty (contains `""`).
  - The requesting player matches the current player.
  - The game status is `"in_progress"`.

- **FR-006**: Backend MUST update the board after a valid move, place the player's marker at the specified coordinates, and return the updated game state.

- **FR-007**: Backend MUST detect win conditions by checking all rows, columns, and diagonals. If three consecutive matching markers exist, set the `winner` field to the winning player (`"X"` or `"O"`) and `status` to `"finished"`.

- **FR-008**: Backend MUST detect draw conditions: if the board is completely full with no winner, set `winner` to `"draw"` and `status` to `"finished"`.

- **FR-009**: Backend MUST alternate the `currentPlayer` between `"X"` and `"O"` after each valid move, unless the game has ended.

- **FR-010**: Backend MUST store all active games in memory. Multiple concurrent games are supported, each identified by a unique `gameId`.

- **FR-011**: Backend MUST return HTTP 201 (Created) on successful game creation (`POST /games`), 200 (OK) on successful game state retrieval or move execution, and appropriate 4xx/5xx errors for invalid requests.

- **FR-012**: Backend MUST validate all request payloads and return 400 (Bad Request) with descriptive error messages for:
  - Invalid move (cell occupied, not player's turn, game over).
  - Game not found (404).
  - Malformed JSON or missing required fields.

- **FR-013**: Backend MUST bind to `localhost` on port `3000` by default and document the port configuration.

### Key Entities

- **Game**: Represents a Tic-Tac-Toe game session.
  - `gameId` (string): Unique identifier.
  - `board` (string[3][3]): 3x3 grid; values are `""` (empty), `"X"`, or `"O"`.
  - `currentPlayer` (string): `"X"` or `"O"` indicating whose turn it is.
  - `status` (string): `"waiting"`, `"in_progress"`, or `"finished"`.
  - `winner` (string | null): `"X"`, `"O"`, `"draw"`, or `null` if game not finished.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All four core endpoints (`POST /games`, `GET /games/:gameId`, `POST /games/:gameId/join`, `POST /games/:gameId/move`) respond within 200ms under normal conditions.

- **SC-002**: A complete game (create → join → 5 moves to win) can be played end-to-end without errors, with all state transitions occurring correctly.

- **SC-003**: The backend correctly identifies and enforces all win conditions (three rows, three columns, two diagonals) and draw conditions (full board with no winner) with 100% accuracy across all tested scenarios.

- **SC-004**: Move validation prevents invalid moves (occupied cell, wrong player turn, game over) with all error messages returned in the documented contract format.

- **SC-005**: The backend can support at least 10 concurrent games running simultaneously without data corruption or crosstalk between games.

- **SC-006**: Two browser tabs on the same machine can retrieve the updated game state within 2 seconds after one tab submits a move.

- **SC-007**: Docker container builds successfully without errors and the application starts and listens on `localhost:3000` when the container runs.

## Assumptions

- **.NET Runtime**: .NET 9 runtime is available in the development and deployment environments.

- **In-Memory Storage**: Game data persists only for the duration of the backend process. Data is not persisted to disk or external databases. Restarting the backend clears all games.

- **Local-Only Network**: All clients connect to the backend on `localhost:3000`. No remote deployment or cloud integration is required.

- **Minimal Latency Requirement**: "Within 2 seconds" is achievable through simple polling from the frontend; WebSocket or Server-Sent Events are optional enhancements, not required.

- **No Concurrent Write Conflicts**: The game design assumes simple sequential turns. Backend does not need to handle simultaneous move submissions on the same cell; first submission wins.

- **HTTP-Based Protocol**: Communication between frontend and backend uses standard HTTP/REST. No special protocol negotiation is required.

- **Container Deployment**: The backend is packaged in a Docker container as specified. Docker must be available in the deployment environment.

- **Single Backend Instance**: Only one instance of the backend runs at a time. No load balancing, clustering, or distributed state management is required.

- **Error Response Format**: All error responses follow the documented JSON contract (e.g., `{"error": "message"}`).
