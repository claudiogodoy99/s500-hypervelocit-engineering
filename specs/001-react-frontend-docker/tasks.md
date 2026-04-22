# Tasks: React Frontend for Jogo da Velha

**Input**: Design documents from `/specs/001-react-frontend-docker/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not explicitly requested in feature specification. Test tasks are NOT included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the Vite + React + TypeScript project and establish base configuration

- [X] T001 Scaffold React project with Vite react-ts template in frontend/
- [X] T002 [P] Configure Vite dev server with host 0.0.0.0 binding in frontend/vite.config.ts
- [X] T003 [P] Configure TypeScript strict mode and path aliases in frontend/tsconfig.json
- [X] T004 [P] Create HTML entry point with root div in frontend/index.html

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: TypeScript types matching the API contract and the API client — all user stories depend on these

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Define Game, ApiError, and MoveRequest TypeScript interfaces matching constitution contract in frontend/src/types/game.ts
- [X] T006 Implement API client with createGame, getGame, joinGame, makeMove functions using native fetch in frontend/src/services/api.ts
- [X] T007 Create React entry point that renders App component in frontend/src/main.tsx

**Checkpoint**: Foundation ready — types enforce contract compliance, API client is the single integration point, React renders

---

## Phase 3: User Story 1 — Create a New Game (Priority: P1) 🎯 MVP

**Goal**: Player opens the app, clicks "Create Game", sees an empty 3×3 board with their marker as "X" and status "Waiting for opponent"

**Independent Test**: Open app in browser, click "Create Game", verify empty board renders with game ID displayed and waiting status shown

### Implementation for User Story 1

- [X] T008 [P] [US1] Create Cell component that renders a single board cell with X/O/empty display in frontend/src/components/Cell.tsx
- [X] T009 [P] [US1] Create Board component that renders 3×3 grid of Cell components in frontend/src/components/Board.tsx
- [X] T010 [P] [US1] Create GameStatus component that displays waiting/turn/winner/draw/error messages in frontend/src/components/GameStatus.tsx
- [X] T011 [US1] Create GameControls component with "Create Game" button (join game input added in US2) in frontend/src/components/GameControls.tsx
- [X] T012 [US1] Implement App component with game creation flow: idle state → call createGame API → render Board, GameStatus, and game ID in frontend/src/App.tsx
- [X] T013 [US1] Add basic CSS styling for board grid layout, cells, status display, and controls in frontend/src/App.css

**Checkpoint**: Player can create a game, see the empty board, see game ID to share, and see "Waiting for opponent" status

---

## Phase 4: User Story 2 — Join an Existing Game and Play Turns (Priority: P2)

**Goal**: Second player joins via game ID, both players take turns clicking cells, board updates in both tabs within 2 seconds via polling

**Independent Test**: Open two browser tabs, create game in one, join with game ID in the other, alternate moves and verify board syncs

### Implementation for User Story 2

- [X] T014 [US2] Add "Join Game" input field and button to GameControls component in frontend/src/components/GameControls.tsx
- [X] T015 [US2] Implement useGamePolling custom hook with 1-second interval polling of GET /games/:gameId in frontend/src/hooks/useGamePolling.ts
- [X] T016 [US2] Add cell click handler to Board component that calls makeMove API for empty cells when it is the player's turn in frontend/src/components/Board.tsx
- [X] T017 [US2] Update App component with join game flow, player marker tracking (X for creator, O for joiner), polling integration, and move handling in frontend/src/App.tsx
- [X] T018 [US2] Add error message display in GameStatus for "Not your turn", "Cell already occupied", and "Game is already full" responses in frontend/src/components/GameStatus.tsx

**Checkpoint**: Two-player gameplay works across tabs — create, join, take turns, real-time sync via polling, error feedback on invalid moves

---

## Phase 5: User Story 3 — Detect Win or Draw (Priority: P3)

**Goal**: When a player wins or the board fills up, both tabs show the outcome and the board becomes non-interactive

**Independent Test**: Play a full game to win/draw, verify announcement appears in both tabs and no further moves are accepted

### Implementation for User Story 3

- [X] T019 [US3] Update GameStatus component to display winner announcement ("Player X wins!") and draw message when game status is finished in frontend/src/components/GameStatus.tsx
- [X] T020 [US3] Update Board component to disable all cell interactions when game status is finished in frontend/src/components/Board.tsx
- [X] T021 [US3] Update useGamePolling hook to stop polling when game status transitions to finished in frontend/src/hooks/useGamePolling.ts
- [X] T022 [US3] Add visual styling for end-game states (winner highlight, draw indication, disabled board appearance) in frontend/src/App.css

**Checkpoint**: Complete game lifecycle works — create → join → play → win/draw with proper end-game UI in both tabs

---

## Phase 6: User Story 4 — Containerized Development Environment (Priority: P4)

**Goal**: Developer runs a single Docker command from `/frontend` and the app builds and serves with hot-reload

**Independent Test**: Run `docker compose up --build` from `/frontend`, verify app accessible at localhost:5173 and code changes hot-reload

### Implementation for User Story 4

- [X] T023 [P] [US4] Create Dockerfile with Node 20 Alpine base, dependency install, and Vite dev server command in frontend/Dockerfile
- [X] T024 [US4] Create docker-compose.yml with volume mounts for src/ and index.html, port mapping 5173:5173, and VITE_API_URL environment variable in frontend/docker-compose.yml
- [X] T025 [US4] Add .dockerignore file excluding node_modules and dist from build context in frontend/.dockerignore

**Checkpoint**: `docker compose up --build` from `/frontend` starts the app with hot-reload, accessible at http://localhost:5173

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, edge cases, and validation across all stories

- [X] T026 [P] Add error handling in App component for backend unreachable scenario with user-friendly connectivity error message in frontend/src/App.tsx
- [X] T027 [P] Add game state restoration on browser refresh by reading gameId from URL or localStorage and calling getGame API in frontend/src/App.tsx
- [X] T028 Run quickstart.md validation: verify Docker build, app startup, and full game flow end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 (Phase 3) — extends GameControls, Board, and App
- **User Story 3 (Phase 5)**: Depends on User Story 2 (Phase 4) — extends GameStatus, Board, and useGamePolling
- **User Story 4 (Phase 6)**: Depends on Setup (Phase 1) only — can run in parallel with US1-US3 (different files)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Creates Board, Cell, GameStatus, GameControls, App — foundational components
- **User Story 2 (P2)**: Extends GameControls (add join), Board (add click handler), App (add polling/moves) — builds on US1 components
- **User Story 3 (P3)**: Extends GameStatus (add win/draw), Board (disable on finished), useGamePolling (stop on finished) — builds on US2 flow
- **User Story 4 (P4)**: Independent infrastructure — Dockerfile/docker-compose don't depend on component code

### Within Each User Story

- Components marked [P] can be built in parallel (different files)
- App.tsx integration tasks depend on their component prerequisites
- CSS styling tasks can follow or parallel their corresponding components

### Parallel Opportunities

- T002, T003, T004 can all run in parallel (Setup — different files)
- T008, T009, T010 can all run in parallel (US1 — different component files)
- T023, T024, T025 can run in parallel with US1-US3 work (US4 — infrastructure files)
- T026, T027 can run in parallel (Polish — independent concerns in same file but additive)

---

## Parallel Example: User Story 1

```bash
# Launch all parallelizable US1 component tasks together:
Task T008: "Create Cell component in frontend/src/components/Cell.tsx"
Task T009: "Create Board component in frontend/src/components/Board.tsx"
Task T010: "Create GameStatus component in frontend/src/components/GameStatus.tsx"

# Then sequential integration:
Task T011: "Create GameControls component in frontend/src/components/GameControls.tsx"
Task T012: "Implement App component with game creation flow in frontend/src/App.tsx"
Task T013: "Add basic CSS styling in frontend/src/App.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (scaffold project)
2. Complete Phase 2: Foundational (types + API client)
3. Complete Phase 3: User Story 1 (create game + board display)
4. **STOP and VALIDATE**: Verify game creation renders board with waiting status
5. Demo if ready — single-player game creation works

### Incremental Delivery

1. Setup + Foundational → Project scaffold ready
2. Add User Story 1 → Game creation + board display (MVP!)
3. Add User Story 2 → Two-player gameplay with real-time sync
4. Add User Story 3 → Win/draw detection and end-game UI
5. Add User Story 4 → Docker containerization (can happen at any point)
6. Polish → Error handling, refresh recovery, quickstart validation
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Stories 1 → 2 → 3 (sequential — same files)
   - Developer B: User Story 4 (Docker — independent files)
3. Developer B can assist with Polish after US4 is complete

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Tests are NOT included — not explicitly requested in feature specification
- US2 and US3 modify files created in US1 — they must be sequential
- US4 (Docker) is fully independent and can be done at any point after Setup
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
