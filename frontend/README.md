# Tic-Tac-Toe Frontend

See [../specs/001-frontend-app/quickstart.md](../specs/001-frontend-app/quickstart.md) for the full onboarding path.

## Commands

- `npm run dev` — Vite dev server on `http://localhost:5173` (expects a real backend).
- `npm run dev:mock` — Vite dev server with an in-browser MSW mocked backend; no backend process required.
- `npm run build` — production build.
- `npm run typecheck` — `tsc --noEmit`.
- `npm run test` — unit + component tests (Vitest + Testing Library + MSW).
- `npm run test:e2e` — Playwright two-tab end-to-end smoke test (requires a running backend).
- `npm run lint` — ESLint flat config.

## Configuration

- `VITE_BACKEND_ORIGIN` (default `http://localhost:3000`) — HTTP origin of the backend implementing the [contract](../specs/001-frontend-app/contracts/openapi.json). Copy `.env.example` to `.env.local` to override.
- `VITE_USE_MOCK` (default `false`) — when `true` in a dev build, loads `src/mocks/browser.ts` and starts an MSW service worker that implements the contract in memory. Tree-shaken out of production builds. Set automatically by `npm run dev:mock`.

## Mocked backend (dev only)

Run `npm run dev:mock` to exercise the full contract locally with no backend:

- Games live in memory in the browser tab that started the worker; other tabs on the **same** origin share that worker.
- All four contract endpoints are implemented (`POST /games`, `GET /games/:id`, `POST /games/:id/join`, `POST /games/:id/move`) and return the exact error strings from [contracts/openapi.json](../specs/001-frontend-app/contracts/openapi.json).
- To reset state, stop the dev server or unregister the service worker from DevTools → Application → Service Workers.
