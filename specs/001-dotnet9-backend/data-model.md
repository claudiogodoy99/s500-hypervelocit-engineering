# Data Model: .NET 9 Tic-Tac-Toe Backend

## Overview

The backend manages one aggregate root, `Game`, plus one request model for moves. The model is designed around the fixed contract in the constitution.

## Entity: Game

| Field | Type | Required | Description | Validation |
|---|---|---|---|---|
| `gameId` | string | Yes | Unique identifier for the game session | Non-empty, unique across active games |
| `board` | string[3][3] | Yes | Three-by-three grid with `""`, `"X"`, or `"O"` | Always 3 rows and 3 columns |
| `currentPlayer` | string | Yes | Marker for the next valid turn | Must be `"X"` or `"O"` |
| `status` | string | Yes | Current lifecycle status | Must be `"waiting"`, `"in_progress"`, or `"finished"` |
| `winner` | string or null | Yes | Winner marker or draw result | Must be `null`, `"X"`, `"O"`, or `"draw"` |

## Request Model: MoveRequest

| Field | Type | Required | Description | Validation |
|---|---|---|---|---|
| `player` | string | Yes | Player attempting the move | Must be `"X"` or `"O"` |
| `row` | integer | Yes | Target row index | Must be between 0 and 2 |
| `col` | integer | Yes | Target column index | Must be between 0 and 2 |

## Derived Rules

| Rule | Description |
|---|---|
| Turn order | `currentPlayer` starts as `"X"` and alternates after valid moves while the game is active |
| Join transition | `status` changes from `"waiting"` to `"in_progress"` when the second player joins |
| Win transition | `status` changes to `"finished"` and `winner` is set to `"X"` or `"O"` when a line is completed |
| Draw transition | `status` changes to `"finished"` and `winner` is set to `"draw"` when the board is full without a winner |
| Finished game immutability | No further moves are accepted after `status` becomes `"finished"` |

## State Transitions

### Game lifecycle

| Current State | Event | Next State | Notes |
|---|---|---|---|
| `waiting` | Create game | `waiting` | Initial state after `POST /games` |
| `waiting` | Join game | `in_progress` | Second player joins |
| `in_progress` | Valid move without winner or draw | `in_progress` | Turn switches to the other player |
| `in_progress` | Winning move | `finished` | `winner` becomes `"X"` or `"O"` |
| `in_progress` | Final non-winning move | `finished` | `winner` becomes `"draw"` |

### Move validation flow

1. Verify the game exists.
2. Verify the game status is `in_progress`.
3. Verify the requesting player matches `currentPlayer`.
4. Verify `row` and `col` are inside the board bounds.
5. Verify the targeted cell is empty.
6. Apply the move and evaluate win or draw conditions.

## In-Memory Storage Model

| Store | Key | Value | Notes |
|---|---|---|---|
| Active games map | `gameId` | `Game` | Thread-safe map scoped to the running backend process |

## Error Model

| Scenario | HTTP Status | Body |
|---|---|---|
| Game not found | 404 | `{ "error": "Game not found" }` |
| Game already full | 400 | `{ "error": "Game is already full" }` |
| Not current player | 400 | `{ "error": "Not your turn" }` |
| Occupied cell | 400 | `{ "error": "Cell already occupied" }` |
| Finished game move | 400 | `{ "error": "Game is already over" }` |
| Invalid payload | 400 | Contract-compliant error body with descriptive message |
