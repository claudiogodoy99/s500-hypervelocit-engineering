---
description: "Task list for Tic-Tac-Toe Frontend Application"
---

# Tasks: Tic-Tac-Toe Frontend Application

**Input**: Design documents from [`/specs/001-frontend-app/`](./)  
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Included. The plan mandates Vitest + Testing Library + MSW for component tests and Playwright for the end-to-end two-tab smoke test. Tests codify the contract per Constitution Principle I.

**Organization**: Tasks are grouped by user story (US1–US5 from [spec.md](./spec.md)) so each story can be implemented, tested, and demoed independently. All tasks live under `frontend/` (Constitution Principle II).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: `US1`…`US5` from [spec.md](./spec.md); omitted for Setup, Foundational, and Polish phases

## Path Conventions

- All source paths are under `frontend/` as defined in [plan.md §Project Structure](./plan.md#project-structure).
- Test paths are under `frontend/tests/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the frontend project with the stack fixed in [research.md](./research.md).

- [X] T001 Scaffold a new Vite 6 + React 19 + TypeScript 5.5 project at `frontend/` using `npm create vite@latest frontend -- --template react-swc-ts`; keep `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/index.html`, `frontend/src/main.tsx`, `frontend/src/App.tsx`.
- [X] T002 Pin the exact stack in `frontend/package.json` dependencies: `react@^19`, `react-dom@^19`, `react-router@^7`, `@tanstack/react-query@^5`; devDependencies: `typescript@~5.5`, `vite@^6`, `@vitejs/plugin-react-swc`, `tailwindcss@^4`, `@tailwindcss/vite`, `postcss`, `autoprefixer`, `vitest@^2`, `@testing-library/react@^16`, `@testing-library/jest-dom`, `jsdom`, `msw@^2`, `@playwright/test@^1.49`, `eslint@^9`, `typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, `prettier@^3`. Run `npm install` from `frontend/`.
- [X] T003 [P] Enable TypeScript strict mode in `frontend/tsconfig.json` (`"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`) and configure path alias `"@/*": ["src/*"]`.
- [X] T004 [P] Configure Tailwind CSS 4 by adding `@tailwindcss/vite` to `frontend/vite.config.ts` and creating `frontend/src/styles/index.css` containing `@import "tailwindcss";`; import that file from `frontend/src/main.tsx`.
- [X] T005 [P] Create `frontend/eslint.config.js` (flat config) with `@typescript-eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`; create `frontend/.prettierrc` with default Prettier 3 settings; add `lint` and `format` scripts to `frontend/package.json`.
- [X] T006 [P] Set dev server port in `frontend/vite.config.ts` (`server.port = 5173`, `server.strictPort = true`) per Constitution Principle III.
- [X] T007 [P] Create `frontend/.env.example` documenting `VITE_BACKEND_ORIGIN=http://localhost:3000`; add `.env.local` to `frontend/.gitignore`.
- [X] T008 [P] Add npm scripts to `frontend/package.json`: `"dev"`, `"build"`, `"preview"`, `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:e2e": "playwright test"`, `"lint"`, `"format"`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contract types, HTTP client, session context, router shell, and test harness — required by every user story. Constitution Principle I enforced here.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T009 [P] Create `frontend/src/api/types.ts` containing the TypeScript types that mirror [contracts/openapi.json](./contracts/openapi.json): `Cell`, `Marker`, `GameStatus`, `Winner`, `Game`, `MoveRequest`, `ApiError` (per [data-model.md §6](./data-model.md#6-typescript-representation-summary)).
- [X] T010 [P] Create `frontend/src/api/errors.ts` exporting `class ApiClientError extends Error` with a typed `code` field restricted to the five documented error strings from the contract, plus a `parseApiError(response: Response): Promise<ApiClientError>` helper.
- [X] T011 Create `frontend/src/api/client.ts` exporting a thin `fetch` wrapper that reads `import.meta.env.VITE_BACKEND_ORIGIN` (fallback `http://localhost:3000`), sets `Content-Type: application/json`, parses JSON responses, and throws `ApiClientError` on non-2xx responses (depends on T009, T010).
- [X] T012 Create `frontend/src/session/GameSessionContext.tsx` exposing `GameSessionProvider` and `useGameSession()` hook holding `{ assignedMarker: Marker | null, activeGameId: string | null, setAssignedMarker, setActiveGameId, clear }` per [data-model.md §2.1](./data-model.md#21-playersession) (depends on T009).
- [X] T013 Create `frontend/src/main.tsx` to wrap `<App />` in `<QueryClientProvider>` (TanStack Query), `<BrowserRouter>` (React Router 7), and `<GameSessionProvider>`, with `QueryClient` defaults `staleTime: 0`, `retry: 2` (depends on T012).
- [X] T014 Create `frontend/src/App.tsx` and `frontend/src/routes.tsx` defining routes `/` → `EntryPage`, `/game/:gameId` → `GamePage`, `*` → `NotFoundPage`, plus the shared layout shell with a header (depends on T013).
- [X] T015 [P] Create `frontend/src/utils/validation.ts` exporting `trimAndValidateGameId(input: string): { ok: true, value: string } | { ok: false, reason: string }` covering empty/whitespace/non-printable inputs (FR-016).
- [X] T016 [P] Create `frontend/tests/msw/handlers.ts` with MSW 2 handlers for every endpoint in [contracts/openapi.json](./contracts/openapi.json): `POST /games` (201), `GET /games/:gameId` (200 or 404), `POST /games/:gameId/join` (200/400/404), `POST /games/:gameId/move` (200/400/404). Handlers MUST return the exact response shapes from the OpenAPI file (depends on T009).
- [X] T017 [P] Create `frontend/tests/msw/server.ts` exporting a Node `setupServer()` configured with the T016 handlers.
- [X] T018 Create `frontend/vitest.config.ts` using `jsdom`, `globals: true`, and `setupFiles: ['./tests/setup.ts']`; create `frontend/tests/setup.ts` importing `@testing-library/jest-dom`, starting/stopping the MSW server, and resetting handlers between tests (depends on T017).
- [X] T019 Create `frontend/playwright.config.ts` with one project `chromium` pointing to `http://localhost:5173`, `webServer: { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true }`, and `use.baseURL` set accordingly.
- [X] T020 [P] Create `frontend/src/components/ConnectivityIndicator.tsx` (presentational) that reads a `state: 'online' | 'reconnecting'` prop and renders an unobtrusive banner when `reconnecting` per [data-model.md §2.3](./data-model.md#23-connectivitystate) (FR-017).

**Checkpoint**: Foundation ready — user story work can begin.

---

## Phase 3: User Story 1 — Start a new game and share it (Priority: P1) 🎯 MVP

**Goal**: A player opens the app, creates a game, and sees the empty board, their marker (`X`), a "waiting" status, and a shareable game identifier (FR-001–FR-005, FR-013).

**Independent Test**: Load the app, click **Create Game**, verify a game ID appears, the board renders empty, marker is `X`, status is "waiting", and the ID can be copied.

### Tests for User Story 1

- [X] T021 [P] [US1] Component test `frontend/tests/component/EntryPage.createGame.test.tsx`: renders EntryPage, clicks **Create Game**, asserts navigation to `/game/:id` and that the session marker is set to `X` (MSW returns the contract's 201 example).
- [X] T022 [P] [US1] Component test `frontend/tests/component/GamePage.waiting.test.tsx`: renders `GamePage` with a `waiting` game, asserts empty board, turn indicator shows "Waiting for opponent", and Share UI displays the game ID.
- [X] T023 [P] [US1] Unit test `frontend/tests/unit/client.test.ts`: asserts `apiClient.post('/games')` hits `${VITE_BACKEND_ORIGIN}/games` with `Content-Type: application/json` and returns a typed `Game`.

### Implementation for User Story 1

- [X] T024 [P] [US1] Create `frontend/src/api/hooks/useCreateGame.ts` exporting `useCreateGame()` via `useMutation` calling `apiClient.post<Game>('/games')`; on success it invalidates and seeds the `['game', gameId]` query cache.
- [X] T025 [P] [US1] Create `frontend/src/components/GameIdDisplay.tsx` rendering the `gameId` inside a read-only `<input>` with a **Copy** button using `navigator.clipboard.writeText` (FR-013); fallback to `document.execCommand('copy')` if clipboard unavailable.
- [X] T026 [US1] Create `frontend/src/pages/EntryPage.tsx` with a **Create Game** button wired to `useCreateGame()`; on success, set `assignedMarker = 'X'` in `GameSessionContext`, set `activeGameId`, and navigate to `/game/${gameId}` (depends on T024, T012, T014).
- [X] T027 [US1] Create `frontend/src/components/TurnIndicator.tsx` rendering in `aria-live="polite"` text such as "Waiting for opponent", "Your turn (X)", "Opponent's turn (O)" based on props `{ status, currentPlayer, assignedMarker }`.
- [X] T028 [US1] Create `frontend/src/components/Board.tsx` and `frontend/src/components/Cell.tsx`: `Board` renders a 3×3 grid of `Cell` `<button>` elements with `aria-label="Row R, Col C, empty|X|O"`; in US1 scope, all cells are disabled.
- [X] T029 [US1] Create `frontend/src/pages/GamePage.tsx` initial version that reads `:gameId` from the route, renders `GameIdDisplay`, `TurnIndicator`, and a disabled `Board` using the initial `Game` seeded by `useCreateGame` (depends on T024, T025, T027, T028).
- [X] T030 [US1] Handle creation failure in `EntryPage`: when `useCreateGame` errors, render a retry-able inline error (user-visible message, no stack trace) per the spec's error acceptance scenario in Story 1.

**Checkpoint**: User Story 1 is independently demoable — creating a game works end-to-end with MSW and against a real backend that implements the contract.

---

## Phase 4: User Story 2 — Join an existing game (Priority: P1)

**Goal**: A second player joins by entering a game ID, is assigned `O`, and both tabs transition to `in_progress` (FR-001, FR-003, FR-008, FR-016).

**Independent Test**: Given a waiting game, enter the ID in the Join form, submit, and verify assignment `O`, board visible, status `in_progress` in both tabs.

### Tests for User Story 2

- [X] T031 [P] [US2] Component test `frontend/tests/component/EntryPage.joinGame.test.tsx`: enters a valid game ID, submits, asserts navigation and session marker `O`.
- [X] T032 [P] [US2] Component test `frontend/tests/component/EntryPage.joinGame.errors.test.tsx`: asserts "Game not found" and "Game is already full" messages are shown when MSW returns 404 and 400 respectively; asserts local validation blocks empty/whitespace input without calling MSW.
- [X] T033 [P] [US2] Unit test `frontend/tests/unit/validation.test.ts`: covers `trimAndValidateGameId` for empty, whitespace-only, trimming, and accepted non-empty inputs.

### Implementation for User Story 2

- [X] T034 [P] [US2] Create `frontend/src/api/hooks/useJoinGame.ts` exporting `useJoinGame()` via `useMutation` calling `apiClient.post<Game>(\`/games/${gameId}/join\`)`; on success, seed `['game', gameId]` cache.
- [X] T035 [US2] Extend `frontend/src/pages/EntryPage.tsx` with a **Join Game** form: controlled input, local validation via `trimAndValidateGameId`, submit wired to `useJoinGame`. On success, set `assignedMarker = 'O'`, set `activeGameId`, navigate to `/game/${gameId}` (depends on T034, T015).
- [X] T036 [US2] Map `ApiClientError.code` to user-visible messages in `EntryPage` join flow: `"Game not found"`, `"Game is already full"` (FR-008).
- [X] T037 [US2] Add a `NotFoundPage` at `frontend/src/pages/NotFoundPage.tsx` shown for `*` route with a link back to `/` (supports Story 2 URL-typo recovery).

**Checkpoint**: Stories US1 + US2 both work independently. Two-tab gameplay can begin.

---

## Phase 5: User Story 3 — Play a turn with near real-time sync (Priority: P1)

**Goal**: The current player places a marker, the board updates locally, and the opponent tab reflects it within 2 s. Illegal moves are blocked or rejected with a clear message (FR-004–FR-012, SC-003, SC-005).

**Independent Test**: Two tabs in `in_progress`: the current player clicks an empty cell → marker appears in both tabs within 2 s; turn switches; the non-current player cannot place a marker; MSW-stubbed rejections display the contract error strings.

### Tests for User Story 3

- [X] T038 [P] [US3] Component test `frontend/tests/component/Board.interaction.test.tsx`: when `isMyTurn=true`, clicking an empty cell calls `makeMove`; when `isMyTurn=false`, cells are disabled and `aria-disabled="true"`.
- [X] T039 [P] [US3] Component test `frontend/tests/component/GamePage.polling.test.tsx` using Vitest fake timers + MSW: updates MSW's `GET /games/:id` handler mid-test, advances timers by 1 s, asserts the new board is rendered (SC-003).
- [X] T040 [P] [US3] Component test `frontend/tests/component/GamePage.moveErrors.test.tsx`: asserts each of "Not your turn", "Cell already occupied", "Game is already over" displays as a user-visible message and the board reconciles to the backend response (FR-008, FR-012, SC-005).

### Implementation for User Story 3

- [X] T041 [P] [US3] Create `frontend/src/api/hooks/useGame.ts` exporting `useGame(gameId)` via `useQuery(['game', gameId], …)` with `refetchInterval: 1000`, `refetchIntervalInBackground: false`, `enabled: Boolean(gameId)`; expose `isError`, `failureCount`, `data` (SC-003, Principle IV).
- [X] T042 [P] [US3] Create `frontend/src/api/hooks/useMakeMove.ts` exporting `useMakeMove(gameId)` via `useMutation` posting `MoveRequest`; on success, set `['game', gameId]` cache to the response (authoritative reconcile, FR-012); on error, expose typed `ApiClientError` without mutating cache.
- [X] T043 [US3] Update `frontend/src/pages/GamePage.tsx` to use `useGame(gameId)` as the source of truth for board/turn/status; compute `isMyTurn = game.currentPlayer === assignedMarker && game.status === 'in_progress'`; pass `board`, `isMyTurn`, `onCellClick` to `Board` (depends on T041).
- [X] T044 [US3] Wire `Cell` onClick in `Board` to `useMakeMove(gameId).mutate({ player: assignedMarker, row, col })`; locally guard against clicks when `!isMyTurn` or `board[r][c] !== ''` (defensive; backend remains authoritative) (depends on T042).
- [X] T045 [US3] Render move errors in `GamePage` by subscribing to `useMakeMove` `error`; display the error string inline with an auto-clear on the next successful poll (FR-008).
- [X] T046 [US3] Update `TurnIndicator` to distinguish "Your turn (X)" vs "Opponent's turn" vs "Waiting for opponent" based on `status` and `assignedMarker`; keep `aria-live="polite"`.

**Checkpoint**: Full gameplay loop (create → join → play) works between two tabs.

---

## Phase 6: User Story 4 — See the outcome when the game finishes (Priority: P2)

**Goal**: On win or draw, both tabs display the outcome, disable further moves, and offer **New Game** (FR-010, FR-011).

**Independent Test**: Play a winning sequence; both tabs show "X won" (or `O`) and disabled cells. Play a drawing sequence; both tabs show "Draw". **New Game** returns to `/`.

### Tests for User Story 4

- [X] T047 [P] [US4] Component test `frontend/tests/component/OutcomeBanner.test.tsx`: asserts the correct text for `winner === 'X'`, `winner === 'O'`, `winner === 'draw'` from the perspective of each `assignedMarker`.
- [X] T048 [P] [US4] Component test `frontend/tests/component/GamePage.finished.test.tsx`: with MSW returning `status: 'finished'`, asserts `Board` cells are all disabled and `New Game` button navigates to `/`.

### Implementation for User Story 4

- [X] T049 [P] [US4] Create `frontend/src/components/OutcomeBanner.tsx` rendering: if `winner === 'draw'` → "Draw"; if `winner === assignedMarker` → "You won"; if `winner` is the opposite marker → "You lost"; else render nothing.
- [X] T050 [US4] In `GamePage`, when `status === 'finished'`: render `OutcomeBanner`, set all `Cell` elements to `disabled`, and render a **New Game** button that calls `GameSessionContext.clear()` and navigates to `/` (depends on T049, T012, T043).
- [X] T051 [US4] Guard against stale updates in `GamePage`: once `status === 'finished'`, stop the TanStack Query refetch (set `refetchInterval` to `false`) to prevent flicker from late polls (spec Edge Cases).

**Checkpoint**: Complete game lifecycle is demoable.

---

## Phase 7: User Story 5 — Graceful reconnection (Priority: P3)

**Goal**: When the backend is unreachable, a non-blocking indicator appears; when it recovers, the board resyncs automatically (FR-017).

**Independent Test**: Stop MSW/backend during an active game → reconnection banner visible after ~3 s; resume → banner clears and board reflects current backend state, no reload required.

### Tests for User Story 5

- [X] T052 [P] [US5] Component test `frontend/tests/component/GamePage.reconnecting.test.tsx`: MSW handler for `GET /games/:id` throws network errors for 3 consecutive polls, asserts `ConnectivityIndicator` renders `reconnecting`; then recovers and asserts the banner disappears on next successful poll.

### Implementation for User Story 5

- [X] T053 [US5] In `GamePage`, compute `connectivityState` from `useGame` (`isError && failureCount >= 3 ? 'reconnecting' : 'online'`) and pass to `ConnectivityIndicator` (depends on T020, T041).
- [X] T054 [US5] Configure `useGame` with `retry: 3`, `retryDelay: 500` so a single transient failure does not flash the banner; document this in a code comment referencing FR-017 and data-model §2.3.

**Checkpoint**: All five user stories functionally complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T055 [P] End-to-end test `frontend/tests/e2e/two-tab-game.spec.ts` (Playwright) using two `browser.newContext()` instances: tab A creates a game, tab B joins, both play a winning sequence, both observe the outcome — validates SC-006. Requires a running backend or a Playwright-level mock.
- [X] T056 [P] Accessibility audit pass: confirm every interactive element is keyboard-focusable, `Board` cells have descriptive `aria-label`s, status regions are `aria-live="polite"`, and Tailwind classes meet WCAG AA contrast for X/O markers and error text (spec Assumptions).
- [X] T057 [P] Visual polish in `frontend/src/styles/index.css` and Tailwind classes on `Board`/`Cell`/`TurnIndicator`/`OutcomeBanner` — functional, not branded (spec Assumptions).
- [X] T058 [P] Add a top-level `frontend/README.md` that links to [quickstart.md](./quickstart.md) and documents `npm run dev`, `npm run test`, `npm run test:e2e`, and the `VITE_BACKEND_ORIGIN` env var.
- [X] T059 Run `npm run typecheck`, `npm run lint`, `npm run test` in `frontend/` and resolve every error/warning.
- [X] T060 Execute the [quickstart.md](./quickstart.md) two-tab walkthrough manually against a running backend; capture any deviations as follow-up issues.
- [X] T061 Final Constitution Check sweep: grep `frontend/src` for any HTTP path not listed in `contracts/openapi.json` and for any `localStorage`/`sessionStorage`/`indexedDB` usage; remove any hits (Principles I, III).

---

## Phase 9: Local Mocked Backend (Dev-only)

**Goal**: Let a developer run the frontend end-to-end (create → join → play → finish) without any real backend, using an in-browser MSW worker that implements the full contract in memory. Reuses the existing MSW handler surface from Phase 2 so the mock stays contract-faithful (Principle I). Strictly dev-only — never enabled in production builds (Principle III).

**Independent Test**: With no backend process running, start `npm run dev:mock` and complete a full two-tab game in the browser; no network errors in the console, outcome banner displays correctly, **New Game** returns to `/`.

### Tasks

- [X] T062 [P] Create `frontend/src/mocks/gameStore.ts` exporting an in-memory `Map<string, Game>` plus pure helpers `createGame()`, `joinGame(id)`, `applyMove(id, move)`, and a win/draw detector, all typed against `frontend/src/api/types.ts`. Emits the exact `ApiError` strings from [contracts/openapi.json](./contracts/openapi.json) (`"Game not found"`, `"Game is already full"`, `"Not your turn"`, `"Cell already occupied"`, `"Game is already over"`) with matching HTTP status codes.
- [X] T063 Create `frontend/src/mocks/handlers.ts` exporting MSW `http.*` handlers for the four contract endpoints wired through `gameStore.ts` (stateful, unlike the stateless `tests/msw/handlers.ts` used by Vitest). URL base MUST read `import.meta.env.VITE_BACKEND_ORIGIN ?? "http://localhost:3000"` so the mock intercepts the same origin the client calls (depends on T062).
- [X] T064 [P] Create `frontend/src/mocks/browser.ts` exporting `setupWorker(...handlers)` from `msw/browser`; add a dev-only bootstrap in `frontend/src/main.tsx` that, when `import.meta.env.VITE_USE_MOCK === "true"`, dynamically imports `./mocks/browser` and awaits `worker.start({ onUnhandledRequest: "warn" })` before `createRoot(...).render(...)`. Production builds must tree-shake this branch (depends on T063).
- [X] T065 Run `npx msw init public/ --save` in `frontend/` to generate `public/mockServiceWorker.js`; commit the generated file. Document `VITE_USE_MOCK=true` in `frontend/.env.example`.
- [X] T066 Add `"dev:mock": "cross-env VITE_USE_MOCK=true vite"` to `frontend/package.json` scripts and add `cross-env` to `devDependencies` (cross-platform env var for Windows/macOS/Linux). Update `frontend/README.md` with a **Mocked backend** section documenting the flag and the `dev:mock` script.
- [X] T067 Manual validation: run `npm run dev:mock`, open two browser tabs, and complete one full happy-path game plus one error case per contract error code; confirm the console shows no unhandled requests and the outcome banner + **New Game** flow works. Capture deviations as follow-ups.

**Checkpoint**: Frontend is fully exercisable offline without violating Constitution Principle I (contract is the single source of truth) or Principle III (mock is gated behind an explicit env flag and stays out of the production bundle).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: no dependencies.
- **Phase 2 (Foundational)**: depends on Phase 1 — BLOCKS all user stories.
- **Phases 3–7 (User Stories)**: each depends on Phase 2. US1 and US2 are both P1 and can proceed in parallel once Phase 2 is complete. US3 consumes hooks created here but can be developed in parallel once its contract types exist (T009). US4 depends on US3's `GamePage`. US5 depends on US3's `useGame` hook and on T020's `ConnectivityIndicator`.
- **Phase 8 (Polish)**: depends on US1–US4 at minimum; US5 and the E2E test are strongly recommended before declaring complete.
- **Phase 9 (Local Mocked Backend)**: depends on Phase 2 (`api/types.ts`, `api/client.ts`) and on the MSW devDependency pinned in T002; independent of Phases 3–8 but most useful once US1–US3 ship.

### Within Each User Story

- Tests (Vitest/MSW) SHOULD be written first and made to fail, then turned green by the implementation tasks in the same phase.
- Hooks (`frontend/src/api/hooks/*`) before the components/pages that consume them.
- Components before the pages that compose them.
- Contract types (T009) precede every HTTP hook and every MSW handler.

### Parallel Opportunities

- All `[P]` tasks within Phase 1 after T002 can run in parallel.
- All `[P]` tasks within Phase 2 can run in parallel (`types.ts`, `errors.ts`, `validation.ts`, MSW files, `ConnectivityIndicator`).
- All test tasks within a single user story are `[P]` — authoring the suite is parallelizable.
- US1 (T024, T025) and US2 (T034) hooks can be written in parallel once Phase 2 is done.
- US3 hooks (T041, T042) can be authored in parallel; they live in separate files.

---

## Parallel Example: Phase 2 Foundational

```text
# Safe to launch together (different files, shared dep is only T009):
T009 [P] Create frontend/src/api/types.ts
T010 [P] Create frontend/src/api/errors.ts
T015 [P] Create frontend/src/utils/validation.ts
T020 [P] Create frontend/src/components/ConnectivityIndicator.tsx

# After T009 completes, these can all run in parallel:
T016 [P] Create frontend/tests/msw/handlers.ts
T017 [P] Create frontend/tests/msw/server.ts
```

## Parallel Example: User Story 3 Tests

```text
T038 [P] [US3] frontend/tests/component/Board.interaction.test.tsx
T039 [P] [US3] frontend/tests/component/GamePage.polling.test.tsx
T040 [P] [US3] frontend/tests/component/GamePage.moveErrors.test.tsx
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Complete Phase 1 (Setup) and Phase 2 (Foundational).
2. Complete Phase 3 (US1 — create). **Stop and demo.**
3. Complete Phase 4 (US2 — join). **Stop and demo** the two-tab rendezvous.
4. Complete Phase 5 (US3 — play). **MVP reached** — a full playable game minus the outcome banner.

### Incremental Delivery

1. After MVP: add Phase 6 (US4 — outcome) for a polished finish.
2. Then Phase 7 (US5 — reconnection resilience).
3. Phase 8 (Polish) closes the feature.

### Parallel Team Strategy

With two frontend developers:

- After Phase 2, Developer A takes US1 (Phase 3) while Developer B takes US2 (Phase 4) — they share only `EntryPage.tsx`, so coordinate that one merge.
- US3 is shared work because it touches `GamePage` and the `Board`; pair on it or split hooks vs. components.
- US4 and US5 can each be picked up by whoever finishes US3 first.

---

## Summary
7
- **Per user story**: US1 = 10 (T021–T030), US2 = 7 (T031–T037), US3 = 9 (T038–T046), US4 = 5 (T047–T051), US5 = 3 (T052–T054)
- **Setup**: 8 tasks (T001–T008)
- **Foundational**: 12 tasks (T009–T020)
- **Polish / cross-cutting**: 7 tasks (T055–T061)
- **Local mocked backend (dev-only)**: 6 tasks (T062–T067)
- **End-to-end happy path**: 1 task (T068)
- **Parallel opportunities**: 28 tasks marked `[P]`
- **Independent test criteria**: Each user-story phase defines one sentence that lets a reviewer verify that story alone; see the **Independent Test** line at the top of each phase.
- **Suggested MVP**: Phases 1–5 (Setup + Foundational + US1 + US2 + US3). This is the smallest increment that delivers the core gameplay loop mandated by Constitution Principle IV.
- **Format validation**: Every task above starts with `- [X]` or `- [ ]`, has a sequential Task ID (`T001`…`T068`), carries `[P]` where applicable and a `[USx]` label on user-story-phase tasks only, and names an exact file path.

---

## Phase 10: End-to-End Happy-Path Coverage

**Goal**: Lock in the full create → join → play-to-win flow against the real dev-server + MSW service worker, covering what component tests cannot: React Router navigation, TanStack Query 1 s polling, the browser service worker from Phase 9, and cross-tab state sync. Satisfies the `test:e2e` script already wired in `frontend/package.json` and closes the validation gap noted by T067.

**Independent Test**: `cd frontend; npm run build; npm run test:e2e` passes on a clean checkout with no backend process running; the spec creates a game in one context, joins in a second context, plays a winning sequence, and asserts the outcome banner in both contexts.

### Tasks

- [X] T068 [P] End-to-end test `frontend/tests/e2e/happy-path.spec.ts` (Playwright) that launches `npm run dev:mock` via `playwright.config.ts` `webServer`, opens two `browser.newContext()` instances against `http://localhost:5173`, drives tab A to create a game and copy the `gameId` from the URL, drives tab B to join via `/join/:gameId`, alternates four moves to force an X-row win, and asserts `OutcomeBanner` text `"X wins"` is visible in both contexts within the 1 s poll window. Uses only `@playwright/test` (already in devDependencies) and requires no real backend — validates Phase 9 end-to-end and fulfils the manual step from T067.