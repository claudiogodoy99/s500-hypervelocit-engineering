# Quickstart: React Frontend for Jogo da Velha

**Feature**: 001-react-frontend-docker  
**Date**: 2026-04-22

## Prerequisites

- Docker and Docker Compose installed
- Backend running on `localhost:3000` (for integration testing)

## Start with Docker (recommended)

```bash
cd frontend
docker compose up --build
```

The application will be available at **http://localhost:5173**.

To stop:
```bash
docker compose down
```

## Start without Docker (local Node.js)

```bash
cd frontend
npm install
npm run dev
```

Requires Node.js 20+ installed locally.

## Run Tests

```bash
# With Docker
docker compose exec frontend npm test

# Without Docker
cd frontend
npm test
```

## Environment Variables

| Variable       | Default                  | Description            |
|----------------|--------------------------|------------------------|
| `VITE_API_URL` | `http://localhost:3000`  | Backend API base URL   |

## How to Play

1. Open **http://localhost:5173** in a browser tab
2. Click **Create Game** — you are Player X
3. Copy the **Game ID** shown on screen
4. Open a **second browser tab** at the same URL
5. Paste the Game ID and click **Join Game** — you are Player O
6. Take turns clicking empty cells on the board
7. The game ends when someone gets three in a row or all cells are filled

## Project Structure

```
frontend/
├── Dockerfile           # Dev container image
├── docker-compose.yml   # Orchestration with volume mounts
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── index.html           # HTML entry point
├── src/
│   ├── main.tsx         # React entry point
│   ├── App.tsx          # Root component
│   ├── components/      # UI components (Board, Cell, GameStatus, GameControls)
│   ├── services/        # API client
│   ├── hooks/           # Polling hook
│   └── types/           # TypeScript interfaces
└── tests/               # Unit and component tests
```
