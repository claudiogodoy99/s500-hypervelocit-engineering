import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { GameSessionProvider } from "./session/GameSessionContext";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: 2,
    },
  },
});

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root missing from index.html");
}

async function bootstrap() {
  // Dev-only in-browser mock backend. Production builds tree-shake this branch
  // because VITE_USE_MOCK is inlined at build time.
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === "true") {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "warn" });
  }

  createRoot(rootEl!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <GameSessionProvider>
            <App />
          </GameSessionProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
}

void bootstrap();
