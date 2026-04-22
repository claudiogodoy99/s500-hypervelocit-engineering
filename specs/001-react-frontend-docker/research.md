# Research: React Frontend for Jogo da Velha

**Feature**: 001-react-frontend-docker  
**Date**: 2026-04-22  
**Status**: Complete

## Research Tasks

### 1. React Project Scaffolding with Vite

**Task**: Best approach for bootstrapping a React + TypeScript project with Vite.

**Decision**: Use `npm create vite@latest` with the `react-ts` template.

**Rationale**: Vite is the recommended modern build tool for React applications. The `react-ts` template provides TypeScript configuration, HMR (Hot Module Replacement), and optimized builds out of the box. It aligns with constitution Principle V (Simplicity) — minimal configuration, fast dev server, no ejecting required.

**Alternatives considered**:
- **Create React App (CRA)**: Deprecated and no longer maintained. Slower builds, heavier configuration.
- **Next.js**: SSR/SSG framework — overkill for a local SPA with no routing or server-side needs.
- **Parcel**: Simpler but less ecosystem support and fewer React-specific optimizations than Vite.

---

### 2. Docker Configuration for React Dev Environment

**Task**: Best practices for containerizing a Vite React dev server with hot-reload.

**Decision**: Multi-concern Docker setup: a `Dockerfile` for the dev image (Node 20 Alpine base, install deps, run `vite dev`) and a `docker-compose.yml` for orchestration with volume mounts for hot-reload.

**Rationale**: Volume-mounting `./src` into the container allows Vite's HMR to detect file changes on the host and push updates to the browser without rebuilding the container. The `--host 0.0.0.0` flag on Vite is required so the dev server is accessible from outside the container. Node 20 Alpine keeps the image small.

**Key configuration details**:
- `Dockerfile`: `FROM node:20-alpine`, `WORKDIR /app`, copy `package*.json`, `npm install`, copy source, `CMD ["npm", "run", "dev"]`
- `docker-compose.yml`: volume mount `./src:/app/src` and `./index.html:/app/index.html`, port mapping `5173:5173`
- Vite config: `server.host = '0.0.0.0'` to bind to all interfaces inside the container

**Alternatives considered**:
- **No Docker Compose (Dockerfile only)**: Possible but less ergonomic — volume mounts and port mappings would need to be passed as `docker run` flags every time.
- **Production-only Docker (nginx + static build)**: Not suitable for development — no hot-reload. Could be added later as a separate production Dockerfile.

---

### 3. HTTP Polling Strategy for Game State Sync

**Task**: Best approach for polling GET /games/:gameId to sync game state within 2 seconds.

**Decision**: Custom React hook (`useGamePolling`) using `setInterval` with a 1-second polling interval. The hook calls `GET /games/:gameId`, updates component state on response, and stops polling when game status is `"finished"`.

**Rationale**: 1-second polling ensures updates are reflected within 2 seconds (worst case: move made just after a poll, next poll picks it up 1s later). This is the simplest approach per constitution Principle V. No WebSocket library, no SSE configuration, no additional backend requirements.

**Key implementation details**:
- Start polling when game enters `"in_progress"` status
- Continue polling during `"waiting"` status (to detect when opponent joins)
- Stop polling when status becomes `"finished"`
- Use `useEffect` cleanup to clear the interval on unmount
- Handle network errors gracefully (show error message, continue polling)

**Alternatives considered**:
- **WebSocket**: Lower latency but adds complexity to both frontend and backend. Constitution Principle V prefers polling if sufficient.
- **Server-Sent Events (SSE)**: Simpler than WebSocket but still requires backend support not in the current contract.
- **Long polling**: More complex than simple polling with marginal latency improvement for this use case.

---

### 4. API Client Design

**Task**: Best approach for the API client that calls the 4 contracted endpoints.

**Decision**: Single `api.ts` module using the native `fetch` API. Each endpoint is a named async function returning typed responses. The backend base URL is configurable via environment variable (`VITE_API_URL`, default: `http://localhost:3000`).

**Rationale**: The `fetch` API is built into all modern browsers — no additional dependency needed. Four functions (one per endpoint) keep the module small and readable. TypeScript types enforce contract compliance at compile time. Environment variable for the base URL allows different configurations without code changes.

**Key implementation details**:
- `createGame()` → `POST /games` → returns `Game`
- `getGame(gameId: string)` → `GET /games/:gameId` → returns `Game`
- `joinGame(gameId: string)` → `POST /games/:gameId/join` → returns `Game`
- `makeMove(gameId: string, player: string, row: number, col: number)` → `POST /games/:gameId/move` → returns `Game`
- Error responses parsed and thrown as typed errors for UI consumption

**Alternatives considered**:
- **Axios**: Popular HTTP client but adds a dependency for 4 simple fetch calls. Violates Principle V.
- **React Query / TanStack Query**: Powerful caching/polling library but adds significant complexity for a simple polling use case.

---

### 5. Component Architecture

**Task**: Minimal component set for the game UI.

**Decision**: 5 components + 1 hook + 1 service module.

| Component | Responsibility |
|-----------|---------------|
| `App.tsx` | Root component. Manages game lifecycle state (no game → creating → waiting → playing → finished). |
| `GameControls.tsx` | "Create Game" button + "Join Game" input/button. Visible when no active game. |
| `Board.tsx` | Renders 3×3 grid of Cell components. Passes cell click handler. |
| `Cell.tsx` | Single cell. Displays "" / "X" / "O". Handles click if cell is empty and it's the player's turn. |
| `GameStatus.tsx` | Displays current status: waiting message, turn indicator, winner/draw announcement, error messages. |

**Rationale**: Each component has a single responsibility. No routing needed (single view). No state management library (React `useState` + props is sufficient for ~5 components). Aligns with Principle V.

**Alternatives considered**:
- **Redux / Zustand**: State management libraries — overkill for a single-view app with minimal state.
- **React Router**: No multiple pages/views needed.
- **Separate pages for create/join/play**: Adds routing complexity. A single view with conditional rendering is simpler.

## Summary of Decisions

| Area | Decision | Key Dependency |
|------|----------|---------------|
| Scaffolding | Vite + react-ts template | `vite`, `react`, `react-dom`, `typescript` |
| Docker | Dockerfile + docker-compose.yml with volume mounts | Node 20 Alpine |
| State sync | Custom polling hook at 1s interval | Native `fetch` API |
| API client | Single `api.ts` with `fetch`, typed responses | None (native) |
| Components | 5 components, no state library, no router | React 18 |
| Testing | Vitest + React Testing Library | `vitest`, `@testing-library/react` |

All decisions align with constitution Principle V (Simplicity) and Principle I (Contract-First). No NEEDS CLARIFICATION items remain.
