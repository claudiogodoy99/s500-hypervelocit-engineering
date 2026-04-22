# Implementation Plan: Tic-Tac-Toe Frontend Application

**Branch**: `001-frontend-app` | **Date**: 2026-04-22 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from [`specs/001-frontend-app/spec.md`](./spec.md)

## Summary

Deliver a React 19 + Vite 6 + TypeScript 5.5 single-page web
application that implements the Tic-Tac-Toe frontend against the
four endpoints defined in the constitution's API contract
(`POST /games`, `GET /games/:gameId`, `POST /games/:gameId/join`,
`POST /games/:gameId/move`). Server state is synchronised with the
backend using TanStack Query v5 with 1 s polling, satisfying the
spec's 2-second opponent-move visibility SLA (SC-003). The app runs
on `http://localhost:5173`, depends on no cloud service, and holds
no persistent state. All design decisions flow from the constitution's
five principles (Contract-First, Layer Ownership, Local-Only,
Real-Time, Simplicity). Technical rationale is captured in
[research.md](./research.md); full contract in
[contracts/openapi.json](./contracts/openapi.json); onboarding in
[quickstart.md](./quickstart.md).

## Technical Context

**Language/Version**: TypeScript 5.5 (strict mode), targeting ES2022 browsers  
**Primary Dependencies**: React 19, React DOM 19, React Router 7 (library mode), TanStack Query 5, Tailwind CSS 4, Vite 6 with `@vitejs/plugin-react-swc`  
**Storage**: None. In-memory only. No `localStorage`, no `sessionStorage`, no IndexedDB (Constitution Principle III).  
**Testing**: Vitest 2 + @testing-library/react 16 + jsdom for unit/component; MSW 2 for contract mocking; Playwright 1.49 for one two-browser-context end-to-end smoke test.  
**Target Platform**: Current stable Chromium, Firefox, and WebKit on desktop. Served from `http://localhost:5173`.  
**Project Type**: Web application — frontend single-page app paired with an out-of-scope backend service.  
**Performance Goals**: Opponent move visible in own tab within 2 s for ≥95 % of moves (SC-003); first interactive render ≤2 s on a cold load on a developer laptop; Vite dev HMR ≤150 ms.  
**Constraints**: Must run on `localhost` only (no cloud, no auth). Must only call the four documented endpoints. Must reconcile UI to backend state on every move response (FR-012). Must not modify anything under `backend/` (Principle II).  
**Scale/Scope**: Two concurrent browser tabs on one machine, one active game per pair. Approximate code size: ~800 LOC of TS/TSX, ~300 LOC of tests.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Plan compliance | Status |
|-----------|-------------|------------------|--------|
| I. Contract-First Development (NON-NEGOTIABLE) | Frontend only calls documented endpoints; no invented shapes. | [contracts/openapi.json](./contracts/openapi.json) transcribes constitution verbatim; TS types in `src/api/types.ts` mirror it; MSW handlers in tests enforce it. | PASS |
| II. Layer Ownership | No cross-layer code; no edits under `backend/`. | All code lives under `frontend/`; no imports cross boundaries (enforced by directory layout). | PASS |
| III. Local-Only Scope | `localhost` ports, no external services, no auth, no persistent DB. | Vite serves `localhost:5173`; backend origin is `localhost:3000` via `VITE_BACKEND_ORIGIN`; no storage of any kind. | PASS |
| IV. Real-Time Gameplay | Opponent updates within 2 s; clear turn indicator. | TanStack Query polls `GET /games/:gameId` every 1 s while mounted; `TurnIndicator` component renders `currentPlayer` via `aria-live="polite"`. | PASS |
| V. Simplicity | YAGNI; simplest viable solution. | No Redux, no SSR, no WebSocket, no component library, no persistence. React built-ins for client state. | PASS |

**Post-design re-check (after Phase 1)**: Still PASS. Design introduced
no cross-layer couplings, no persistent storage, no endpoints outside
the contract, and no authentication.

No violations to justify. **Complexity Tracking** section below is empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-frontend-app/
├── plan.md              # This file
├── spec.md              # Feature spec (already authored)
├── research.md          # Phase 0 — all "NEEDS CLARIFICATION" resolved
├── data-model.md        # Phase 1 — TS types and session state
├── quickstart.md        # Phase 1 — how to run and verify
├── contracts/
│   ├── README.md        # Orientation + constitution pointer
│   └── openapi.json     # OpenAPI 3.1 contract (verbatim transcription)
├── checklists/
│   └── requirements.md  # Spec quality checklist (already passed)
└── tasks.md             # Created later by /speckit.tasks — NOT by this command
```

### Source Code (repository root)

```text
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── postcss.config.cjs
├── .env.example                      # Documents VITE_BACKEND_ORIGIN
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                      # React 19 root, QueryClientProvider
│   ├── App.tsx                       # Router + layout shell
│   ├── routes.tsx                    # React Router 7 route table
│   ├── styles/
│   │   └── index.css                 # @import "tailwindcss";
│   ├── api/
│   │   ├── types.ts                  # Mirror of contracts/openapi.json schemas
│   │   ├── client.ts                 # fetch wrapper; reads VITE_BACKEND_ORIGIN
│   │   ├── errors.ts                 # Typed ApiError parsing
│   │   └── hooks/
│   │       ├── useGame.ts            # TanStack Query: GET with 1s polling
│   │       ├── useCreateGame.ts      # Mutation: POST /games
│   │       ├── useJoinGame.ts        # Mutation: POST /games/:id/join
│   │       └── useMakeMove.ts        # Mutation: POST /games/:id/move
│   ├── session/
│   │   └── GameSessionContext.tsx    # assignedMarker + activeGameId
│   ├── pages/
│   │   ├── EntryPage.tsx             # Create + Join (Stories 1 & 2)
│   │   └── GamePage.tsx              # Board + turn + outcome (Stories 3, 4, 5)
│   ├── components/
│   │   ├── Board.tsx                 # 3×3 grid of Cell
│   │   ├── Cell.tsx                  # <button> with aria-label
│   │   ├── TurnIndicator.tsx         # aria-live="polite"
│   │   ├── OutcomeBanner.tsx         # finished-state screen
│   │   ├── ConnectivityIndicator.tsx # FR-017 banner
│   │   └── GameIdDisplay.tsx         # copy-to-clipboard UI (FR-013)
│   └── utils/
│       └── validation.ts             # trimAndValidateGameId (FR-016)
└── tests/
    ├── msw/
    │   ├── server.ts                 # setupServer()
    │   └── handlers.ts               # Contract-faithful mocks
    ├── unit/
    │   ├── validation.test.ts
    │   └── client.test.ts
    ├── component/
    │   ├── Board.test.tsx
    │   ├── EntryPage.test.tsx
    │   └── GamePage.test.tsx
    └── e2e/
        └── two-tab-game.spec.ts      # Playwright, two browser contexts
```

**Structure Decision**: Web application layout (the constitution
explicitly splits `frontend/` and `backend/`). Only the `frontend/`
subtree is owned by this feature. The `specs/001-frontend-app/`
subtree holds the planning artifacts. No files are created under
`backend/` by this plan (Principle II).

## Phase 0 Output

Completed. See [research.md](./research.md). All Technical Context
items are resolved — no `NEEDS CLARIFICATION` remain.

Key decisions (summary):

- **Framework**: React 19 + Vite 6 + TypeScript 5.5.
- **State**: TanStack Query v5 polling at 1 s for server state;
  `useState` + one React context for client state.
- **Styling**: Tailwind CSS 4.
- **Routing**: React Router 7 (library mode).
- **Tests**: Vitest + Testing Library + MSW + Playwright (one E2E).
- **Config**: Single env var `VITE_BACKEND_ORIGIN` (default
  `http://localhost:3000`).

## Phase 1 Output

Completed.

- **Data model**: [data-model.md](./data-model.md) — TS type
  catalogue mirroring the contract, plus client-only session state
  and derived values.
- **Contracts**: [contracts/openapi.json](./contracts/openapi.json)
  and [contracts/README.md](./contracts/README.md) — OpenAPI 3.1
  transcription of the constitution's JSON contract.
- **Quickstart**: [quickstart.md](./quickstart.md) — two-tab
  walkthrough and verification commands.
- **Agent context update**: The plan reference between the
  `<!-- SPECKIT START -->` / `<!-- SPECKIT END -->` markers in
  [.github/copilot-instructions.md](../../.github/copilot-instructions.md)
  points to this file.

## Complexity Tracking

> Empty. Constitution Check passed with no violations.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _(none)_  | _(n/a)_    | _(n/a)_                             |
