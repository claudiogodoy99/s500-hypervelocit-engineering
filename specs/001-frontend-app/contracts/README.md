# Frontend ↔ Backend Contract

**Source of truth**: [../../../.specify/memory/constitution.md](../../../.specify/memory/constitution.md) §"Initial API Contract"

This folder re-expresses the constitution's JSON contract in a
machine-readable form that the frontend consumes:

- [openapi.json](./openapi.json) — OpenAPI 3.1 schema for the four
  endpoints (`POST /games`, `GET /games/:gameId`,
  `POST /games/:gameId/join`, `POST /games/:gameId/move`).

## Usage in the frontend

1. TypeScript types in `frontend/src/api/types.ts` are hand-written
   to mirror the `#/components/schemas/*` definitions in
   `openapi.json`. A CI check (future enhancement, out of MVP)
   could diff them; for now the reviewer verifies manually.
2. `frontend/src/test/msw/handlers.ts` implements Mock Service
   Worker handlers that return the exact response shapes and
   status codes listed in `openapi.json`. Tests passing against
   these handlers prove the UI respects the contract, not the
   other way around.
3. Any change here MUST be preceded by a constitution amendment
   (Principle I, Governance section). Do not edit `openapi.json`
   without updating `constitution.md` in the same change.

## Non-goals

- This folder does not describe the backend's *internal* data
  model or its push-channel implementation (polling vs. SSE vs.
  WebSocket). The frontend defaults to polling per
  [research.md §Decision 4](../research.md).
- No authentication or authorization: the constitution forbids it
  (Principle III).
