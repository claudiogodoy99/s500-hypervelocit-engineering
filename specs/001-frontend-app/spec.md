# Feature Specification: Tic-Tac-Toe Frontend Application

**Feature Branch**: `frontend`  
**Created**: 2026-04-22  
**Status**: Draft  
**Input**: User description: "create a frontend with the latest technologies for this project based on the constitution.md with all the contract for the backend"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a new game and share it with an opponent (Priority: P1)

A player opens the application in a browser tab, creates a new game with a
single action, and is immediately shown a game screen displaying a unique
game identifier they can share with a second player. The first player is
assigned the `X` marker and sees the board in its initial empty state with
a clear indication that the game is waiting for a second player.

**Why this priority**: Creating a game is the entry point to every other
journey. Without this, no gameplay is possible. It is the smallest slice
that proves the frontend can initiate a session and render backend state.

**Independent Test**: Open the application, click "New Game", and verify a
game identifier appears, the board renders empty, the player's marker is
shown as `X`, and a "waiting for opponent" indicator is visible.

**Acceptance Scenarios**:

1. **Given** the application is loaded, **When** the player activates
   "Create Game", **Then** a new game is created and the player sees a
   game identifier, an empty 3x3 board, their marker (`X`), and a
   "waiting" status.
2. **Given** a game has just been created, **When** the player views the
   game screen, **Then** the game identifier is displayed in a form that
   is easy to copy or share.
3. **Given** game creation fails (backend unreachable), **When** the
   player activates "Create Game", **Then** a clear error message is
   shown and the player can retry.

---

### User Story 2 - Join an existing game using a game identifier (Priority: P1)

A second player, in another browser tab on the same machine, enters or
pastes a game identifier and joins the game. They are assigned the `O`
marker, see the current board state, and the game transitions into an
active state for both players.

**Why this priority**: A two-player game is useless without the second
player. Joining completes the minimum viable gameplay loop.

**Independent Test**: With a game created by another tab, enter its
identifier in the "Join Game" field, confirm, and verify the joining
player sees the same board, is assigned `O`, and the game status
updates to "in progress" in both tabs.

**Acceptance Scenarios**:

1. **Given** a valid game identifier for a waiting game, **When** the
   player submits it in the join flow, **Then** they are taken to the
   game screen, assigned `O`, and the status shows "in progress".
2. **Given** an invalid or unknown game identifier, **When** the player
   submits it, **Then** an error message indicates the game was not
   found, and the player can try again.
3. **Given** a game that already has two players, **When** a third party
   attempts to join with that identifier, **Then** an error message
   indicates the game is already full.

---

### User Story 3 - Play a turn and see opponent moves in near real time (Priority: P1)

During an active game, the player whose turn it is selects an empty cell
to place their marker. The board updates immediately for the acting
player, and within two seconds the opponent's tab reflects the same
updated board. A clear indicator shows whose turn it is at all times.

**Why this priority**: Turn-taking is the core mechanic of the game.
Without reliable move updates across tabs, the product does not fulfill
its purpose.

**Independent Test**: With two tabs in an active game, click an empty
cell as the current player, verify the marker appears in both tabs
within 2 seconds, verify the turn indicator switches, and verify the
non-current player cannot place a marker.

**Acceptance Scenarios**:

1. **Given** it is the player's turn, **When** they select an empty
   cell, **Then** their marker appears in that cell, the turn indicator
   switches to the opponent, and the opponent's tab shows the updated
   board within 2 seconds.
2. **Given** it is not the player's turn, **When** they attempt to
   select a cell, **Then** no marker is placed and the UI clearly
   communicates that it is the opponent's turn.
3. **Given** a cell is already occupied, **When** the player selects
   it, **Then** no change occurs and the UI indicates the cell is
   unavailable.
4. **Given** the backend rejects a move (e.g., "Not your turn", "Cell
   already occupied", "Game is already over"), **When** the response
   arrives, **Then** the error message is displayed to the player and
   the board reflects the authoritative backend state.

---

### User Story 4 - See the outcome when the game finishes (Priority: P2)

When a player wins by completing a line, or the board fills without a
winner, both tabs display a clear end-of-game screen stating the
outcome: who won or that the game ended in a draw. A control is offered
to start a new game.

**Why this priority**: Completing the game loop gives the product a
satisfying conclusion. It is not required to prove playability but is
required for a polished MVP.

**Independent Test**: Play a sequence of moves that ends in a win for
one marker; verify both tabs show a "Player X won" (or `O`) message and
a "New Game" control. Repeat with a sequence that fills the board
without a winner; verify both tabs show a "Draw" message.

**Acceptance Scenarios**:

1. **Given** a move completes a winning line, **When** the move is
   confirmed by the backend, **Then** both tabs display the winner and
   disable further moves.
2. **Given** all cells are filled without a winner, **When** the final
   move is confirmed, **Then** both tabs display a "Draw" outcome.
3. **Given** the game has finished, **When** the player selects "New
   Game", **Then** they are taken back to the entry screen where a new
   game can be created or joined.

---

### User Story 5 - Recover gracefully from transient connectivity issues (Priority: P3)

If the backend becomes temporarily unreachable during a game, the player
sees a non-blocking indicator that the connection is impaired. When
connectivity returns, the board synchronizes with the authoritative
backend state without requiring a page reload.

**Why this priority**: Improves robustness but is not required for a
functional two-tab local demo. Acceptable to ship without this if time
is constrained.

**Independent Test**: Stop the backend process during an active game,
confirm a reconnection indicator appears, restart the backend, and
verify the board resumes reflecting accurate state within a few
seconds.

**Acceptance Scenarios**:

1. **Given** the frontend loses contact with the backend, **When** the
   failure persists more than a short threshold, **Then** a visible
   "reconnecting" indicator is shown.
2. **Given** the backend returns, **When** the next state refresh
   succeeds, **Then** the indicator clears and the board matches the
   backend state.

---

### Edge Cases

- What happens when the player refreshes the page mid-game? The
  application MUST allow returning to the same game by re-entering or
  retaining the game identifier (in-session memory is acceptable).
- What happens when the second player has not joined and the first
  player tries to play? The move control MUST be disabled and the UI
  MUST communicate that the game is waiting for an opponent.
- What happens when the backend rejects a move due to race conditions
  (two near-simultaneous submissions)? The frontend MUST show the
  rejection message and reconcile to the backend's authoritative
  board state.
- What happens if the player enters an obviously malformed game
  identifier (empty, whitespace, wrong characters)? The join action
  MUST be blocked locally with an inline validation message, with no
  backend call made.
- What happens when a finished game's screen is displayed and a late
  state update arrives? The final state MUST not be overwritten by
  stale data.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST provide an entry screen where a
  player can either create a new game or join an existing game by
  entering a game identifier.
- **FR-002**: The application MUST create a new game by calling the
  backend `POST /games` endpoint and display the returned `gameId`,
  `board`, `currentPlayer`, and `status` fields as defined in the
  constitution contract.
- **FR-003**: The application MUST allow a second player to join an
  existing game by calling `POST /games/:gameId/join` and render the
  returned game state.
- **FR-004**: The application MUST render a 3x3 game board that
  reflects the `board` field from the backend, displaying `X`, `O`, or
  an empty cell for each position.
- **FR-005**: The application MUST indicate at all times whose turn it
  is based on the `currentPlayer` field from the backend.
- **FR-006**: The application MUST submit moves by calling
  `POST /games/:gameId/move` with the acting player's marker, row
  (`0–2`), and column (`0–2`).
- **FR-007**: The application MUST prevent the non-current player from
  submitting moves via the UI, and MUST prevent selecting cells that
  are already occupied.
- **FR-008**: The application MUST display error messages for all
  documented backend error responses: "Game not found", "Game is
  already full", "Not your turn", "Cell already occupied", and "Game
  is already over".
- **FR-009**: The application MUST detect game state changes made by
  the opponent and reflect them on screen within 2 seconds under
  normal local conditions (polling, Server-Sent Events, or WebSocket
  as agreed with backend).
- **FR-010**: The application MUST display the final outcome when
  `status` is `finished`: the winning marker (`X` or `O`) or "Draw"
  when `winner` is `"draw"`.
- **FR-011**: When a game is finished, the application MUST disable
  further move submissions and offer a control to start or join a new
  game.
- **FR-012**: The application MUST treat the backend response as the
  authoritative game state; any optimistic UI update MUST reconcile
  to the backend response on confirmation or rejection.
- **FR-013**: The application MUST display the current game's
  identifier in a form that is easy to copy and share with a second
  player in another tab.
- **FR-014**: The application MUST only call endpoints documented in
  the constitution contract (`POST /games`, `GET /games/:gameId`,
  `POST /games/:gameId/join`, `POST /games/:gameId/move`) and MUST
  NOT rely on any response shape beyond the agreed schema.
- **FR-015**: The application MUST run on `localhost` on a port
  distinct from the backend's port and MUST NOT depend on any
  external service, hosting, or authentication.
- **FR-016**: The application MUST validate game identifier input
  locally (non-empty, trimmed) before submitting a join request.
- **FR-017**: The application MUST present a visible indicator when
  the backend is unreachable and MUST recover automatically when the
  backend becomes reachable again, without requiring a page reload.

### Key Entities *(include if feature involves data)*

- **Game**: A single tic-tac-toe session identified by `gameId`. Holds
  the current 3x3 `board`, the marker of the player whose turn is
  next (`currentPlayer`), a lifecycle `status` (`waiting`,
  `in_progress`, `finished`), and a `winner` which is a marker, the
  string `draw`, or absent while the game is ongoing. Owned by the
  backend; the frontend only reads and submits moves against it.
- **Player (local session role)**: The marker assigned to the
  current browser tab (`X` for the creator, `O` for the joiner).
  Exists only in the frontend's session memory; no user account or
  persistent identity.
- **Move**: An action by a player specifying their marker and the
  `row` and `col` of the cell being claimed. Submitted to the
  backend; the backend's response is the authoritative outcome.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time user can create a game and see the empty
  board with a shareable game identifier in under 5 seconds from
  opening the application.
- **SC-002**: A second user can join an existing game and see the
  board rendered in under 5 seconds from submitting the game
  identifier.
- **SC-003**: A move made in one browser tab is visible in the
  opponent's tab within 2 seconds for 95% of moves under normal local
  conditions.
- **SC-004**: 100% of documented backend error responses result in a
  user-visible message that explains the problem in plain language.
- **SC-005**: The application never places a marker locally that is
  not confirmed by the backend; a disagreement between optimistic UI
  and backend response is reconciled in under 1 second.
- **SC-006**: A complete game (create → join → play to completion)
  can be played end-to-end in two browser tabs on one machine without
  any manual page refresh.
- **SC-007**: First-time users complete their first move within 60
  seconds of loading the application without consulting documentation.

## Assumptions

- The backend is implemented exactly as defined in the constitution
  contract and is reachable at a documented `localhost` origin (default
  `http://localhost:3000`). The exact origin is configurable at
  frontend startup.
- The mechanism for state-change detection (polling interval, SSE, or
  WebSocket) will be confirmed with the backend group before
  integration begins; the frontend plan will default to short-interval
  polling (for example every 1 second) unless the backend exposes a
  push channel, in line with the constitution's simplicity principle.
- Two browser tabs on the same machine are the only supported
  gameplay configuration. Mobile, tablet, cross-device, and multi-user
  accounts are out of scope.
- No authentication, user accounts, avatars, chat, leaderboards, or
  game history are in scope. Players are identified solely by their
  marker within a session.
- In-memory session storage is acceptable; refreshing the page may
  require re-entering the game identifier (full recovery after reload
  is not required for MVP).
- Visual design is functional and accessible but not branded; the
  priority is clarity of turn, board state, and outcome over visual
  polish.
- "Latest technologies" is interpreted as a current, well-supported
  web frontend stack that favors simplicity and fast iteration; the
  specific stack selection is deferred to the planning phase and is
  intentionally not specified here to keep this document
  implementation-agnostic.
- Accessibility meets reasonable defaults: keyboard operability for
  all primary actions and sufficient color contrast for board
  markers and status indicators.
