<!--
  Sync Impact Report
  ==================
  Version change: 0.0.0 → 1.0.0 (MAJOR — initial ratification)
  Modified principles: N/A (first version)
  Added sections:
    - Core Principles (5 principles)
    - Initial API Contract (JSON contract reference)
    - Development Workflow
    - Governance
  Removed sections: N/A
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed
    - .specify/templates/spec-template.md ✅ no changes needed
    - .specify/templates/tasks-template.md ✅ no changes needed
  Follow-up TODOs: none
-->

# Desafio Jogo da Velha — S500 Constitution

## Core Principles

### I. Contract-First Development (NON-NEGOTIABLE)

The JSON API contract between frontend and backend is the **single source
of truth** for all inter-layer communication.

- Both groups MUST agree on the contract **before** writing any
  integration code.
- Every HTTP endpoint, request body, response body, and status code
  MUST be documented in the contract section of this constitution.
- Any change to the contract MUST be proposed, discussed, and accepted
  by **both** groups before implementation.
- Frontend MUST NOT call endpoints that are not in the contract.
- Backend MUST NOT return shapes that differ from the contract.

**Rationale**: The challenge explicitly focuses on contract definition
and respect. Broken contracts are the primary source of integration
failures.

### II. Layer Ownership

Each group has **full ownership** of its layer and MUST NOT modify
code in the other group's directory.

- `backend/` is owned exclusively by the backend group.
- `frontend/` is owned exclusively by the frontend group.
- Cross-layer communication happens **only** via the agreed API
  contract — no shared code, no direct imports across boundaries.
- If a contract change is needed, the requesting group MUST open a
  discussion (issue or verbal agreement) before the other group
  modifies their layer.

**Rationale**: Clear ownership prevents merge conflicts, enforces
separation of concerns, and mirrors real-world team dynamics.

### III. Local-Only Scope

The game runs exclusively on `localhost`. No deployment, no cloud
services, no external hosting.

- Backend MUST bind to `localhost` on a documented port (default:
  `3000`).
- Frontend MUST serve on `localhost` on a separate port (default:
  `5173` or `8080`).
- No external databases — in-memory storage is sufficient.
- No authentication or user accounts — players are identified only
  by their marker (`X` or `O`) within a game session.

**Rationale**: Keeping scope local eliminates infrastructure
complexity and keeps the focus on contract correctness and
functional gameplay.

### IV. Real-Time Gameplay

Two browser tabs on the same machine MUST be able to play against
each other with minimal latency.

- The backend MUST provide a mechanism for the frontend to detect
  state changes (polling, SSE, or WebSocket — to be decided by
  backend group and documented in the contract).
- Turn updates MUST be reflected in the opponent's tab within
  2 seconds under normal conditions.
- The frontend MUST clearly display whose turn it is and the
  current board state at all times.

**Rationale**: The core user experience depends on responsive,
real-time interaction between two players.

### V. Simplicity

Build only what is required. No premature abstractions, no
unnecessary features.

- YAGNI: Do NOT implement features beyond the basic game flow
  (create game → join game → play turns → detect win/draw).
- Prefer the simplest technical solution that satisfies the
  contract (e.g., polling over WebSocket if polling is sufficient).
- No user accounts, no persistent storage, no game history, no
  leaderboards — unless explicitly added to the contract later.
- Code MUST be readable by any team member without deep framework
  knowledge.

**Rationale**: The challenge is time-boxed. Over-engineering
reduces the chance of delivering a working product.

## Initial API Contract

The following JSON contract defines the agreed interface between
frontend and backend. Both groups MUST implement against this
contract. Any modifications require a constitution amendment.

### `POST /games` — Create a new game

**Request**: empty body

**Response** (`201 Created`):

```json
{
  "gameId": "abc123",
  "board": [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ],
  "currentPlayer": "X",
  "status": "waiting",
  "winner": null
}
```

### `GET /games/:gameId` — Get game state

**Response** (`200 OK`):

```json
{
  "gameId": "abc123",
  "board": [
    ["X", "", "O"],
    ["", "X", ""],
    ["", "", ""]
  ],
  "currentPlayer": "O",
  "status": "in_progress",
  "winner": null
}
```

**Error** (`404 Not Found`):

```json
{
  "error": "Game not found"
}
```

### `POST /games/:gameId/join` — Join an existing game

**Request**: empty body

**Response** (`200 OK`):

```json
{
  "gameId": "abc123",
  "board": [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ],
  "currentPlayer": "X",
  "status": "in_progress",
  "winner": null
}
```

**Error** (`400 Bad Request`):

```json
{
  "error": "Game is already full"
}
```

### `POST /games/:gameId/move` — Make a move

**Request**:

```json
{
  "player": "X",
  "row": 0,
  "col": 1
}
```

- `player`: `"X"` or `"O"`
- `row`: integer `0–2`
- `col`: integer `0–2`

**Response** (`200 OK`):

```json
{
  "gameId": "abc123",
  "board": [
    ["X", "X", "O"],
    ["", "O", ""],
    ["", "", "X"]
  ],
  "currentPlayer": "O",
  "status": "in_progress",
  "winner": null
}
```

**Error** (`400 Bad Request`):

```json
{
  "error": "Not your turn"
}
```

```json
{
  "error": "Cell already occupied"
}
```

```json
{
  "error": "Game is already over"
}
```

### Game Object Schema

| Field           | Type                  | Values                                         |
|-----------------|-----------------------|------------------------------------------------|
| `gameId`        | `string`              | Unique identifier generated by backend         |
| `board`         | `string[3][3]`        | `""`, `"X"`, or `"O"`                          |
| `currentPlayer` | `string`              | `"X"` or `"O"`                                 |
| `status`        | `string`              | `"waiting"`, `"in_progress"`, `"finished"`     |
| `winner`        | `string \| null`      | `"X"`, `"O"`, `"draw"`, or `null`              |

### Status Flow

```
waiting → in_progress → finished
```

- `waiting`: Game created, only one player present.
- `in_progress`: Two players connected, game is active.
- `finished`: A player won or the board is full (draw).

## Development Workflow

- Each group works in its own directory (`backend/` or `frontend/`).
- Groups MUST agree on the contract before starting integration work.
- Integration testing is done by running both servers locally and
  opening two browser tabs.
- If a contract violation is found during integration, the violating
  group MUST fix their implementation — the contract is authoritative.
- Communication between groups (Slack, verbal, issue tracker) is
  encouraged whenever a contract question arises.

## Governance

This constitution is the authoritative document for the Jogo da Velha
challenge. It supersedes informal agreements and ad-hoc decisions.

- **Amendments**: Any change to principles or contract MUST be
  discussed by both groups and documented here with a version bump.
- **Versioning**: This constitution follows semantic versioning:
  - MAJOR: Principle removal, contract breaking change.
  - MINOR: New endpoint, new principle, material expansion.
  - PATCH: Wording clarification, typo fix, non-breaking refinement.
- **Compliance**: Both groups SHOULD review this document before
  starting implementation and after any contract dispute.
- **Conflict resolution**: If groups disagree on a contract
  interpretation, the written contract in this document wins. If
  the contract is ambiguous, both groups MUST amend it together
  before proceeding.

**Version**: 1.0.0 | **Ratified**: 2026-04-22 | **Last Amended**: 2026-04-22
