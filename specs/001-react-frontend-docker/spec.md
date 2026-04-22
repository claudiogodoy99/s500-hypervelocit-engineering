# Feature Specification: React Frontend for Jogo da Velha

**Feature Branch**: `001-react-frontend-docker`  
**Created**: 2026-04-22  
**Status**: Draft  
**Input**: User description: "build a frontend project using react. must use docker, all the implementation is going to be on /frontend directory. follow the constituition"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a New Game (Priority: P1)

A player opens the application in their browser and creates a new Tic-Tac-Toe game. They are assigned as Player X and see an empty 3×3 board. The game status shows "Waiting for opponent" until a second player joins.

**Why this priority**: Creating a game is the entry point for all gameplay. Without this, no other feature is usable. This delivers the core visual experience — the board, the game creation flow, and the waiting state.

**Independent Test**: Can be fully tested by opening the app in a browser tab, clicking "Create Game", and verifying the empty board renders with the correct waiting status. Delivers the foundational UI and game creation flow.

**Acceptance Scenarios**:

1. **Given** the player has opened the application, **When** they click "Create Game", **Then** a new game is created and they see an empty 3×3 board with their marker displayed as "X" and the status shown as "Waiting for opponent".
2. **Given** a game has been created and is in "waiting" status, **When** the player views the board, **Then** all 9 cells are empty and no moves can be made until an opponent joins.

---

### User Story 2 - Join an Existing Game and Play Turns (Priority: P2)

A second player opens the application in a separate browser tab and joins an existing game using the game ID. Once joined, the game status changes to "In Progress" and both players take turns placing their markers on the board. The board updates after each move, and the current player's turn is clearly indicated.

**Why this priority**: Joining a game and making moves is the core gameplay loop. This story depends on game creation (P1) and enables the full two-player interactive experience.

**Independent Test**: Can be tested by opening two browser tabs, creating a game in one, joining with the game ID in the other, and alternating moves. Delivers the interactive turn-based gameplay.

**Acceptance Scenarios**:

1. **Given** a game exists in "waiting" status, **When** a second player joins using the game ID, **Then** the game status changes to "In Progress" in both browser tabs and the board indicates it is Player X's turn.
2. **Given** a game is "In Progress" and it is Player X's turn, **When** Player X clicks an empty cell, **Then** the cell shows "X", the turn switches to Player O, and both tabs reflect the updated board within 2 seconds.
3. **Given** a game is "In Progress" and it is Player O's turn, **When** Player O clicks an empty cell, **Then** the cell shows "O", the turn switches to Player X, and both tabs reflect the updated board within 2 seconds.
4. **Given** it is not the current player's turn, **When** they click a cell, **Then** the move is rejected and an appropriate message is displayed.
5. **Given** a cell is already occupied, **When** a player clicks it, **Then** the move is rejected and an appropriate message is displayed.

---

### User Story 3 - Detect Win or Draw (Priority: P3)

When a player achieves three markers in a row (horizontally, vertically, or diagonally), the game ends and both players see a "Winner" announcement. If all cells are filled without a winner, both players see a "Draw" announcement. The board becomes non-interactive after the game ends.

**Why this priority**: Win/draw detection completes the game lifecycle. It depends on the move-making flow (P2) and provides the resolution to every game session.

**Independent Test**: Can be tested by playing a full game to a win or draw condition and verifying the correct end-game message appears in both tabs with no further moves allowed.

**Acceptance Scenarios**:

1. **Given** a game is "In Progress", **When** a player places a marker that completes three in a row, **Then** the game status changes to "Finished", the winner is announced to both players, and no further moves are accepted.
2. **Given** a game is "In Progress", **When** all 9 cells are filled with no three-in-a-row, **Then** the game status changes to "Finished", a "Draw" message is displayed to both players, and no further moves are accepted.
3. **Given** a game has ended, **When** a player attempts to click any cell, **Then** no action occurs and the final board state remains displayed.

---

### User Story 4 - Containerized Development Environment (Priority: P4)

A developer clones the repository and starts the frontend application using Docker. The container builds and serves the frontend application on localhost, making it accessible from the host machine's browser without requiring any local toolchain installation.

**Why this priority**: Docker containerization is an explicit requirement from the user but is an infrastructure concern rather than a gameplay feature. It enables consistent development environments.

**Independent Test**: Can be tested by running a single Docker command from the `/frontend` directory and verifying the application is accessible at the expected localhost port in a browser.

**Acceptance Scenarios**:

1. **Given** Docker is installed on the developer's machine, **When** they run the container build and start command from the `/frontend` directory, **Then** the frontend application builds successfully and is accessible at localhost on the configured port.
2. **Given** the frontend container is running, **When** a developer makes a code change, **Then** the change is reflected in the browser without manually rebuilding the container (hot-reload via volume mount).

### Edge Cases

- What happens when a player tries to join a game that is already full (two players present)? The player sees an error message: "Game is already full."
- What happens when a player tries to make a move in a game that has already ended? The move is rejected and the final game state remains displayed.
- What happens when an invalid game ID is used to join? The player sees an error message: "Game not found."
- What happens when the backend is unreachable? The player sees a clear connectivity error message and the board does not update.
- What happens when a player refreshes the browser mid-game? The game state is fetched from the backend and the board is restored to the current state.
- What happens when both players attempt to move at the same time? The backend enforces turn order; only the valid move is accepted and the other player sees a "Not your turn" message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The frontend MUST render a 3×3 Tic-Tac-Toe board that visually represents the current game state (empty cells, X markers, O markers).
- **FR-002**: The frontend MUST allow a player to create a new game, which displays the assigned game ID for sharing with an opponent.
- **FR-003**: The frontend MUST allow a player to join an existing game by entering a game ID.
- **FR-004**: The frontend MUST display whose turn it is at all times during an active game.
- **FR-005**: The frontend MUST allow the current player to place their marker by clicking an empty cell on the board.
- **FR-006**: The frontend MUST prevent interaction with occupied cells and display feedback when an invalid move is attempted.
- **FR-007**: The frontend MUST poll or listen for game state updates from the backend so that the opponent's moves appear within 2 seconds.
- **FR-008**: The frontend MUST display the game outcome (winner announcement or draw) when the game ends.
- **FR-009**: The frontend MUST disable board interaction once the game has ended (status is "finished").
- **FR-010**: The frontend MUST display user-friendly error messages for all error responses from the backend (game not found, game full, not your turn, cell occupied, game over).
- **FR-011**: The frontend MUST communicate with the backend exclusively through the API contract defined in the constitution (POST /games, GET /games/:gameId, POST /games/:gameId/join, POST /games/:gameId/move).
- **FR-012**: The frontend MUST be containerized using Docker, with a Dockerfile located in the `/frontend` directory.
- **FR-013**: The frontend container MUST serve the application on localhost on a configurable port (default: 5173 or 8080, per constitution).
- **FR-014**: The Docker setup MUST support hot-reload during development so code changes are reflected without rebuilding the container.
- **FR-015**: All frontend source code MUST reside exclusively within the `/frontend` directory.

### Key Entities

- **Game**: Represents a Tic-Tac-Toe match identified by a unique game ID. Contains the board state (3×3 grid), current player turn, game status (waiting, in_progress, finished), and winner information.
- **Board Cell**: An individual cell in the 3×3 grid, identified by row (0–2) and column (0–2). Can be empty, contain "X", or contain "O".
- **Player**: A participant in the game, identified by their marker ("X" or "O"). Player X always goes first and is the game creator.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A player can create a new game and see the empty board within 3 seconds of clicking "Create Game".
- **SC-002**: A second player can join an existing game using the game ID within 3 seconds.
- **SC-003**: After a move is made, the opponent's board reflects the update within 2 seconds.
- **SC-004**: A complete game (from creation to win/draw) can be played across two browser tabs without errors.
- **SC-005**: The frontend container builds and starts successfully with a single command from the `/frontend` directory.
- **SC-006**: Code changes made on the host are reflected in the running containerized application without a manual rebuild.
- **SC-007**: All error conditions (invalid game ID, game full, occupied cell, wrong turn, game over) display clear, user-facing messages.
- **SC-008**: The application is usable and readable on a standard desktop browser without horizontal scrolling or layout issues.

## Assumptions

- The backend API is developed and maintained by the backend group per the constitution's API contract and will be available at `localhost:3000` during integration testing.
- Docker and Docker Compose are available on the developer's machine.
- The frontend communicates with the backend via HTTP on localhost — no external network or cloud services are required (per constitution Principle III).
- No authentication or user accounts are needed — players are identified only by their marker within a game session (per constitution Principle III).
- No persistent storage is needed on the frontend — all game state is managed by the backend.
- Game state synchronization uses polling (simplest approach per constitution Principle V); upgrading to SSE or WebSocket is out of scope unless explicitly added to the contract.
- The frontend does not implement game logic (win detection, turn validation) — this is the backend's responsibility. The frontend only renders state received from the API.
- Mobile-responsive design is not required for this version — the target is desktop browsers with two tabs open.
- Only one game can be active per browser tab at a time.
