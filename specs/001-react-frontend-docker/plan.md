# Implementation Plan: React Frontend for Jogo da Velha

**Branch**: `001-react-frontend-docker` | **Date**: 2026-04-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-react-frontend-docker/spec.md`

## Summary

Build a React-based frontend for the Jogo da Velha (Tic-Tac-Toe) game, containerized with Docker, residing entirely in the `/frontend` directory. The frontend communicates with the backend exclusively through the API contract defined in the constitution (4 endpoints: create, get, join, move). Game state synchronization uses HTTP polling. The application is served on localhost for two-player gameplay across browser tabs.

## Technical Context

**Language/Version**: TypeScript 5.x, Node 20 LTS (container base image)  
**Primary Dependencies**: React 18, Vite (build tool/dev server)  
**Storage**: N/A — all state managed by backend API  
**Testing**: Vitest (unit), React Testing Library (component)  
**Target Platform**: Desktop browsers (Chrome, Firefox), served on localhost  
**Project Type**: Web application (SPA frontend)  
**Performance Goals**: Board updates reflected within 2 seconds (polling interval ≤ 1s)  
**Constraints**: Local-only (no cloud/external services), no authentication, no persistent frontend storage  
**Scale/Scope**: Single-page app, ~5 components, 4 API integrations, 1 Docker container

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Contract-First Development** | ✅ PASS | Frontend calls only the 4 contracted endpoints (POST /games, GET /games/:gameId, POST /games/:gameId/join, POST /games/:gameId/move). No extra endpoints. Request/response shapes match constitution exactly. |
| **II. Layer Ownership** | ✅ PASS | All code resides in `/frontend`. No modifications to `backend/`. No shared code or cross-boundary imports. |
| **III. Local-Only Scope** | ✅ PASS | Frontend serves on localhost (port 5173). No external services, no cloud, no auth, no persistent storage. |
| **IV. Real-Time Gameplay** | ✅ PASS | Polling GET /games/:gameId at ≤1s interval ensures updates within 2 seconds. Turn indicator and board state always visible. |
| **V. Simplicity** | ✅ PASS | Minimal component set. Polling over WebSocket. No game logic on frontend. No accounts, history, or leaderboards. Vite is the simplest modern React tooling. |

**GATE RESULT**: All 5 principles pass. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-react-frontend-docker/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Root component with routing/views
│   ├── components/
│   │   ├── Board.tsx         # 3×3 grid rendering and cell click handling
│   │   ├── Cell.tsx          # Individual board cell
│   │   ├── GameStatus.tsx    # Status display (turn, waiting, winner, draw)
│   │   └── GameControls.tsx  # Create game / Join game UI
│   ├── services/
│   │   └── api.ts            # API client (all 4 contract endpoints)
│   ├── hooks/
│   │   └── useGamePolling.ts # Polling hook for game state sync
│   └── types/
│       └── game.ts           # TypeScript interfaces matching API contract
└── tests/
    ├── components/
    │   ├── Board.test.tsx
    │   ├── Cell.test.tsx
    │   ├── GameStatus.test.tsx
    │   └── GameControls.test.tsx
    ├── services/
    │   └── api.test.ts
    └── hooks/
        └── useGamePolling.test.ts
```

**Structure Decision**: Frontend-only SPA within `/frontend`. Flat component structure (no nested routing/pages) since the entire UI fits in a single view. `services/api.ts` is the sole integration point with the backend, enforcing contract-first communication.

## Complexity Tracking

> No constitution violations — table not required.
