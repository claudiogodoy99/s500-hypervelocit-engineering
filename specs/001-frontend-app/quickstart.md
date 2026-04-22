# Quickstart: Tic-Tac-Toe Frontend

**Feature**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)  
**Date**: 2026-04-22

This document is the onboarding path for a developer (or reviewer)
who wants the frontend running on their machine alongside the
backend in under five minutes.

---

## Prerequisites

- **Node.js 20 LTS** or **22 LTS** (ships `npm 10`).
- A running backend instance listening on `http://localhost:3000`
  that implements the contract in
  [contracts/openapi.json](./contracts/openapi.json). The backend
  is maintained by the backend group; see the repository's
  top-level README once it is created.
- Two modern browser windows or tabs on the same machine (Chrome,
  Edge, Firefox, or Safari — all current stable versions).

---

## First-time setup

From the repository root:

```bash
cd frontend
npm install
```

Optional — override the backend origin (defaults to
`http://localhost:3000`):

```bash
echo 'VITE_BACKEND_ORIGIN=http://localhost:3000' > .env.local
```

---

## Run the app (development)

```bash
npm run dev
```

Vite will print a URL (default `http://localhost:5173`). Open it
in a browser. You will see the entry screen with two actions:
**Create Game** and **Join Game**.

## Play a full game in two tabs

1. In **Tab A**, click **Create Game**. Note the game ID
   displayed on screen (or copy the URL in the address bar).
2. Open **Tab B** at `http://localhost:5173`.
3. In **Tab B**, paste the game ID into the **Join Game** field
   and submit. Both tabs now show `status: in_progress`.
4. Take turns clicking empty cells. Moves appear in the
   opponent's tab within ~1–2 seconds (SC-003).
5. Continue until the backend reports a `winner` or a `draw`.
   Both tabs display the outcome and offer a **New Game**
   control (Story 4).

---

## Verify the contract is respected

With the backend running:

```bash
npm run test           # Vitest: unit + component tests (MSW-backed)
npm run test:e2e       # Playwright: full two-tab smoke test
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint flat config
```

A green run of `npm run test` proves the UI speaks exactly the
contract defined in `contracts/openapi.json`. A green
`npm run test:e2e` proves SC-006 (full two-tab gameplay on one
machine, no page refreshes).

---

## Common troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Entry screen loads but **Create Game** hangs, then the reconnection banner appears. | Backend not running on `http://localhost:3000`. | Start the backend; the frontend recovers automatically (FR-017). |
| CORS error in the browser console. | Backend missing `Access-Control-Allow-Origin: http://localhost:5173`. | Coordinate with the backend group — this is their responsibility per Principle II. |
| Join form refuses a pasted game ID with extra whitespace. | FR-016 trims input locally; extremely long or malformed IDs may still be rejected. | Re-copy the game ID carefully. |
| Opponent move takes longer than 2 s to appear. | Polling interval or backend latency. | Confirm both tabs are on the same machine; check backend CPU. Interval is set in `src/api/hooks/useGame.ts`. |

---

## Project layout (frontend only)

See [plan.md §Project Structure](./plan.md#project-structure) for
the authoritative tree. Top-level highlights:

- `frontend/src/api/` — contract types, `apiClient`, TanStack
  Query hooks. The **only** place HTTP calls are made.
- `frontend/src/pages/` — `EntryPage`, `GamePage`.
- `frontend/src/components/` — `Board`, `Cell`, `TurnIndicator`,
  `OutcomeBanner`, `ConnectivityIndicator`.
- `frontend/src/session/` — React context for the tab's assigned
  marker.
- `frontend/tests/` — unit, component, and Playwright tests.

---

## What *not* to do

- Do not add endpoints or request bodies that are not in
  [contracts/openapi.json](./contracts/openapi.json) — Principle I.
- Do not modify anything under `backend/` — Principle II.
- Do not add `localStorage`, cookies, or any other persistence —
  Principle III.
- Do not introduce user accounts, chat, or game history — Spec §Assumptions.
