# Phase 0 Research: Tic-Tac-Toe Frontend

**Feature**: [spec.md](./spec.md)  
**Date**: 2026-04-22

This document resolves every open technical decision surfaced in the
feature spec's Assumptions section and the plan's Technical Context. No
`NEEDS CLARIFICATION` remain after this phase.

---

## Decision 1 — Frontend framework

**Decision**: **React 19** (functional components + hooks).

**Rationale**:
- React 19 is the current stable major (stable since Dec 2024) and
  ships the new React Compiler (opt-in), `use()` hook, and native
  Actions — mature and widely supported in April 2026.
- The team profile ("latest tech, simplicity, readable by any
  member") favors a mainstream framework with the largest talent
  pool and documentation base.
- Constitution Principle V (Simplicity) rules out experimental
  runtimes that would require framework-specific teaching.

**Alternatives considered**:
- **Solid.js 1.9 / Svelte 5 (runes)**: smaller, faster, genuinely
  "latest". Rejected: the challenge is time-boxed and readability to
  the whole team outranks micro-optimizations on a `localhost`
  3×3 grid.
- **Vanilla TypeScript + Web Components**: simplest runtime but
  verbose for state sync. Rejected: higher line count and more
  hand-rolled plumbing than React.
- **Next.js 15 / Remix (React Router v7 framework mode)**: rejected
  — SSR and filesystem routing add complexity with no benefit for a
  two-tab `localhost` app (Constitution Principle III, V).

---

## Decision 2 — Build tool / dev server

**Decision**: **Vite 6** with the official `@vitejs/plugin-react` (SWC).

**Rationale**:
- Fastest mainstream dev server; `npm create vite@latest` yields a
  working React + TS scaffold in one command.
- Built-in `server.port` config satisfies the constitution's
  `localhost:5173` default without extra tooling.
- SWC variant of the React plugin keeps first-run and HMR under
  100 ms on modest hardware.

**Alternatives considered**:
- **Turbopack standalone / Rspack / Farm**: rejected — not required,
  and Vite 6 is already best-in-class for this size of app.
- **Parcel 2**: rejected — weaker React 19 alignment and smaller
  ecosystem than Vite in 2026.

---

## Decision 3 — Language

**Decision**: **TypeScript 5.5** with `strict: true`.

**Rationale**:
- The backend contract is a fixed JSON schema (see constitution).
  Typing the request/response shapes catches contract drift at
  compile time — directly supports Principle I
  (Contract-First Development).
- `strict` mode is the zero-cost default in any greenfield TS
  project.

**Alternatives considered**:
- **Plain JavaScript**: rejected — loses compile-time contract
  validation, which is the single most valuable guardrail for this
  project.

---

## Decision 4 — Server-state synchronisation

**Decision**: **TanStack Query v5** with short-interval polling
(`refetchInterval: 1000` on the active game query).

**Rationale**:
- Spec SC-003 requires opponent moves visible within 2 s for 95 %
  of moves. Polling every 1 s comfortably meets this on
  `localhost`.
- TanStack Query provides the cache, automatic retry, stale-time
  control, and "is fetching" states we would otherwise hand-roll.
- Polling is the backend-agnostic default called out in the spec's
  Assumptions; if the backend group later exposes SSE or
  WebSocket, only the one custom hook changes — the UI code does
  not.
- Matches Constitution Principle IV (real-time gameplay) and
  Principle V (simplicity — no WS handshake state machine).

**Alternatives considered**:
- **Server-Sent Events (native `EventSource`)**: rejected for MVP —
  requires backend coordination that has not yet happened; can be
  introduced later behind the same TanStack Query hook.
- **WebSocket (`ws` / `socket.io`)**: rejected — overkill for a
  3×3 board with 1 s SLA; violates Principle V.
- **SWR**: viable but TanStack Query has richer mutation lifecycle
  (optimistic updates + rollback) which the spec requires (FR-012,
  SC-005).

---

## Decision 5 — Client-side routing

**Decision**: **React Router v7** (library mode, declarative routes).

**Rationale**:
- Three screens (`/` entry, `/game/:gameId` game, catch-all 404)
  justify a router. v7 library mode is a direct drop-in with no
  framework opinions (no SSR, no loaders required).

**Alternatives considered**:
- **No router, single page with conditional rendering**: rejected —
  the game screen needs a linkable URL so the second tab can paste
  the full URL instead of just a code, which streamlines the
  "share" UX (FR-013).
- **TanStack Router**: rejected — excellent but adds a second
  TanStack concept for no measurable gain at three routes.

---

## Decision 6 — Styling

**Decision**: **Tailwind CSS 4** (CSS-first config, Vite plugin).

**Rationale**:
- Tailwind 4 (stable Jan 2025) uses native CSS variables and a
  single `@import "tailwindcss"` with no `tailwind.config.js`
  required for defaults — fits Principle V.
- Utility classes keep the 3×3 board markup readable without
  component libraries.

**Alternatives considered**:
- **Plain CSS Modules**: viable, slightly more verbose for layout
  tweaks. Acceptable fallback.
- **shadcn/ui / Radix**: rejected — far more than this UI needs.
- **CSS-in-JS (Emotion, styled-components)**: rejected — runtime
  cost with no benefit here.

---

## Decision 7 — State management (client state)

**Decision**: **React built-ins** (`useState`, `useReducer`,
`useContext`) + **TanStack Query** for server state. No Redux / Zustand /
Jotai.

**Rationale**:
- Client state is trivial: assigned marker (`X`/`O`), current
  `gameId`, transient form inputs. `useState` plus one
  `GameSessionContext` is enough.
- Avoids introducing a store pattern the whole team would need to
  learn (Principle V).

**Alternatives considered**:
- **Zustand / Jotai**: rejected — elegant but unnecessary.
- **Redux Toolkit**: rejected — disproportionate for this scope.

---

## Decision 8 — Testing stack

**Decision**:
- **Vitest 2** + **@testing-library/react 16** + **jsdom** for
  unit and component tests.
- **MSW 2** (Mock Service Worker) for stubbing the backend
  contract in component/integration tests.
- **Playwright 1.49** for one end-to-end smoke test that drives
  two browser contexts through the full
  create → join → play → finish flow.

**Rationale**:
- Vitest shares Vite's transformer — zero extra config for TS/JSX.
- MSW lets us write one set of contract fixtures that every
  component test reuses, directly supporting Principle I: if MSW
  handlers match the constitution contract, all tests pass if and
  only if the UI calls the contract correctly.
- Two-browser-context Playwright test is the cheapest way to verify
  SC-006 (full two-tab gameplay on one machine) without depending
  on a live backend.

**Alternatives considered**:
- **Jest**: rejected — slower in a Vite workspace, needs a separate
  transformer.
- **Cypress**: rejected — single-origin testing is harder for the
  two-tab scenario; Playwright's multi-context API is a better fit.

---

## Decision 9 — Linting / formatting

**Decision**: **ESLint 9** (flat config) with
`@typescript-eslint`, `eslint-plugin-react`,
`eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` +
**Prettier 3**.

**Rationale**:
- ESLint 9 flat config is the supported default in 2026.
- `jsx-a11y` covers the accessibility defaults called out in the
  spec's Assumptions (keyboard + contrast).

**Alternatives considered**:
- **Biome 1.9**: single-binary lint + format, tempting. Rejected
  for MVP — team familiarity with ESLint is higher and Biome still
  lacks the full `jsx-a11y` ruleset.

---

## Decision 10 — Backend origin configuration

**Decision**: Single environment variable `VITE_BACKEND_ORIGIN`
(default `http://localhost:3000`) read once at module load and
wrapped in a thin `apiClient` module.

**Rationale**:
- Constitution Principle III fixes the backend at `localhost`; the
  env var only accommodates port changes (spec FR-015 explicitly
  requires distinct ports, and the backend default is 3000).
- Single point of change makes contract drift detection trivial.

**Alternatives considered**:
- **Vite dev proxy (`server.proxy`)**: avoided because same-origin
  masking can hide real CORS problems the backend group must
  handle.

---

## Decision 11 — Accessibility baseline

**Decision**: Keyboard navigation across all interactive elements;
board cells are `<button>` with `aria-label` describing row, column,
and current occupant; turn indicator and outcome live in an
`aria-live="polite"` region; WCAG AA color contrast on markers and
status.

**Rationale**: Directly covers the spec's assumption about
accessibility defaults with zero extra runtime cost.

---

## Decision 12 — Package manager

**Decision**: **npm 10** (ships with Node 20 LTS / 22 LTS).

**Rationale**: Zero install step; universal on developer machines;
Principle V.

**Alternatives considered**:
- **pnpm / bun**: faster installs, rejected only because npm is
  already everywhere for a one-package frontend.

---

## Summary of Resolutions

| Spec/Plan Unknown | Resolved To |
|-------------------|-------------|
| "Latest technologies" stack | React 19 + Vite 6 + TS 5.5 |
| State-sync mechanism | TanStack Query v5 polling @ 1000 ms |
| Styling | Tailwind CSS 4 |
| Testing | Vitest + Testing Library + MSW + Playwright |
| Routing | React Router v7 (library mode) |
| Backend origin | `VITE_BACKEND_ORIGIN` env var, default `http://localhost:3000` |
| Package manager | npm 10 |

All items flagged `NEEDS CLARIFICATION` in Technical Context are now
resolved.
