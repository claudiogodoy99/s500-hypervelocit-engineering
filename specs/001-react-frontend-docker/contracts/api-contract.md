# API Contract: Frontend → Backend

**Feature**: 001-react-frontend-docker  
**Date**: 2026-04-22  
**Source**: Constitution v1.0.0 — Initial API Contract

## Base URL

```
http://localhost:3000
```

Configurable via `VITE_API_URL` environment variable.

## Endpoints

### 1. Create Game

```
POST /games
```

**Request**: Empty body  
**Content-Type**: Not required

**Success Response** (`201 Created`):
```json
{
  "gameId": "string",
  "board": [["", "", ""], ["", "", ""], ["", "", ""]],
  "currentPlayer": "X",
  "status": "waiting",
  "winner": null
}
```

**Frontend usage**: Called when player clicks "Create Game". Response displayed as the initial game view with the `gameId` shown for sharing.

---

### 2. Get Game State

```
GET /games/:gameId
```

**Path parameters**:
- `gameId` (string): The game identifier

**Success Response** (`200 OK`):
```json
{
  "gameId": "string",
  "board": [["string", "string", "string"], ["string", "string", "string"], ["string", "string", "string"]],
  "currentPlayer": "X" | "O",
  "status": "waiting" | "in_progress" | "finished",
  "winner": "X" | "O" | "draw" | null
}
```

**Error Response** (`404 Not Found`):
```json
{
  "error": "Game not found"
}
```

**Frontend usage**: Polled at 1-second intervals to sync game state. Also called on browser refresh to restore state.

---

### 3. Join Game

```
POST /games/:gameId/join
```

**Path parameters**:
- `gameId` (string): The game identifier

**Request**: Empty body  
**Content-Type**: Not required

**Success Response** (`200 OK`):
```json
{
  "gameId": "string",
  "board": [["", "", ""], ["", "", ""], ["", "", ""]],
  "currentPlayer": "X",
  "status": "in_progress",
  "winner": null
}
```

**Error Response** (`400 Bad Request`):
```json
{
  "error": "Game is already full"
}
```

**Frontend usage**: Called when player enters a game ID and clicks "Join Game". On success, player is assigned as "O" and gameplay begins.

---

### 4. Make Move

```
POST /games/:gameId/move
```

**Path parameters**:
- `gameId` (string): The game identifier

**Request body** (`application/json`):
```json
{
  "player": "X" | "O",
  "row": 0 | 1 | 2,
  "col": 0 | 1 | 2
}
```

**Success Response** (`200 OK`):
```json
{
  "gameId": "string",
  "board": [["string", "string", "string"], ["string", "string", "string"], ["string", "string", "string"]],
  "currentPlayer": "X" | "O",
  "status": "in_progress" | "finished",
  "winner": "X" | "O" | "draw" | null
}
```

**Error Responses** (`400 Bad Request`):
```json
{ "error": "Not your turn" }
```
```json
{ "error": "Cell already occupied" }
```
```json
{ "error": "Game is already over" }
```

**Frontend usage**: Called when the current player clicks an empty cell. On success, the response updates the board immediately (before the next poll).

## Error Handling Contract

All error responses follow the same shape:

```json
{
  "error": "string"
}
```

The frontend MUST:
1. Check HTTP status codes (201, 200, 400, 404)
2. Parse the `error` field from non-2xx responses
3. Display the error message to the user
4. Not crash or enter an inconsistent state on any error response

## CORS Note

Since frontend (port 5173) and backend (port 3000) run on different ports, the backend MUST enable CORS for `http://localhost:5173`. This is a backend responsibility documented here for integration awareness.
