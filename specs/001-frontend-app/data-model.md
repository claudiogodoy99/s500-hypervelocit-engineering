# Phase 1 Data Model: Tic-Tac-Toe Frontend

**Feature**: [spec.md](./spec.md)  
**Date**: 2026-04-22

The frontend is a thin client over the backend contract. All
authoritative state lives on the backend; the frontend only caches
and renders it. This document catalogs the in-memory shapes the
frontend maintains.

---

## 1. Mirrored Entities (from constitution contract)

These are read-only from the frontend's perspective — shapes are
defined by the backend and MUST match the constitution contract
exactly.

### 1.1 `Game`

| Field           | Type                                              | Source   | Notes |
|-----------------|---------------------------------------------------|----------|-------|
| `gameId`        | `string`                                          | Backend  | Opaque identifier, treat as unique key. |
| `board`         | `Cell[3][3]`                                      | Backend  | Row-major; each cell is `"" \| "X" \| "O"`. |
| `currentPlayer` | `"X" \| "O"`                                      | Backend  | Whose turn it is. |
| `status`        | `"waiting" \| "in_progress" \| "finished"`        | Backend  | Lifecycle. |
| `winner`        | `"X" \| "O" \| "draw" \| null`                    | Backend  | Null while `status !== "finished"`. |

**Invariants (enforced by backend, asserted by frontend type guards)**:
- `winner !== null` ⇒ `status === "finished"`.
- `status === "waiting"` ⇒ `board` is all `""`.
- Exactly one of `currentPlayer` is `"X"` or `"O"` at all times.

### 1.2 `Cell`

Type alias: `"" | "X" | "O"`. No object; stored inline in `board`.

### 1.3 `MoveRequest`

| Field    | Type              | Notes |
|----------|-------------------|-------|
| `player` | `"X" \| "O"`      | Must equal the assigned marker for the tab. |
| `row`    | `0 \| 1 \| 2`     | Zero-indexed. |
| `col`    | `0 \| 1 \| 2`     | Zero-indexed. |

### 1.4 `ApiError`

| Field    | Type     | Notes |
|----------|----------|-------|
| `error`  | `string` | Exactly matches one of the documented error strings from the contract. |

---

## 2. Frontend-Only Session State

Owned and mutated solely by the client. Not sent to the backend.

### 2.1 `PlayerSession`

Stored in a `GameSessionContext` (React context, not persisted).

| Field            | Type               | Lifecycle |
|------------------|--------------------|-----------|
| `assignedMarker` | `"X" \| "O" \| null` | Set to `"X"` on successful create, `"O"` on successful join. Cleared when leaving the game. |
| `activeGameId`   | `string \| null`   | Mirrors the URL segment; used by hooks before the route resolves. |

**Rules**:
- `assignedMarker` is the **only** authorization the frontend
  enforces locally (FR-007: disable cell clicks when it isn't this
  marker's turn). The backend remains authoritative (FR-012).
- Refreshing the page clears this context. The spec's Assumptions
  accept that the user may need to re-enter the game code — this
  is acceptable MVP behavior.

### 2.2 `JoinFormState`

Transient, lives in the entry-page component.

| Field            | Type      |
|------------------|-----------|
| `gameIdInput`    | `string`  |
| `validationError`| `string \| null` |
| `isSubmitting`   | `boolean` |

### 2.3 `ConnectivityState`

Derived from TanStack Query's `isError` / `failureCount` on the
active `GET /games/:gameId` query.

| Field           | Type                                             |
|-----------------|--------------------------------------------------|
| `state`         | `"online" \| "reconnecting"`                     |
| `consecutiveFailures` | `number`                                   |

A `ConnectivityIndicator` component reads this to render the FR-017
banner. No persistent storage.

---

## 3. State Transitions

### 3.1 Game status (mirror of backend)

```
waiting ──(second player joins)──▶ in_progress ──(win/draw move)──▶ finished
```

The frontend **observes** these transitions; it never infers them
locally.

### 3.2 Local session

```
idle
  │
  │ POST /games succeeds          POST /games/:id/join succeeds
  ▼                                          ▼
playing-as-X ──────────┐         ┌────── playing-as-O
                       ▼         ▼
                   finished (observed from backend)
                       │
                       │ user clicks "New Game"
                       ▼
                      idle
```

### 3.3 Connectivity

```
online ──(N consecutive fetch failures, N≥3)──▶ reconnecting
reconnecting ──(next fetch succeeds)──▶ online
```

Threshold `N=3` at 1 s intervals = ~3 s before the banner appears,
acceptable under SC-003.

---

## 4. Derived Values

Computed at render time, not stored.

| Derived             | Formula |
|---------------------|---------|
| `isMyTurn`          | `game.currentPlayer === session.assignedMarker && game.status === "in_progress"` |
| `canInteractWithCell(r,c)` | `isMyTurn && game.board[r][c] === ""` |
| `outcomeText`       | If `winner === "draw"` → "Draw". Else if `winner === session.assignedMarker` → "You won". Else if `winner` in {X,O} → "You lost". Else `null`. |
| `shareableUrl`      | `${window.location.origin}/game/${game.gameId}` |

---

## 5. Persistence

**None.** All state is in-memory. No `localStorage`, no
`sessionStorage`, no IndexedDB. This matches the constitution's
Principle III (no persistent storage) and the spec's Assumptions
(refresh may require re-entering the game ID).

---

## 6. TypeScript representation (summary)

```ts
type Cell = "" | "X" | "O";
type Marker = "X" | "O";
type GameStatus = "waiting" | "in_progress" | "finished";
type Winner = Marker | "draw" | null;

interface Game {
  gameId: string;
  board: [[Cell, Cell, Cell], [Cell, Cell, Cell], [Cell, Cell, Cell]];
  currentPlayer: Marker;
  status: GameStatus;
  winner: Winner;
}

interface MoveRequest {
  player: Marker;
  row: 0 | 1 | 2;
  col: 0 | 1 | 2;
}

interface ApiError {
  error: string;
}

interface PlayerSession {
  assignedMarker: Marker | null;
  activeGameId: string | null;
}
```

These types are the canonical client-side description of the
contract and are the types emitted by `src/api/types.ts` (see
[plan.md](./plan.md) for file layout).
