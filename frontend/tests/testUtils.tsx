import { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GameSessionProvider } from "@/session/GameSessionContext";

interface Options extends Omit<RenderOptions, "wrapper"> {
  route?: string;
  queryClient?: QueryClient;
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(ui: ReactElement, opts: Options = {}) {
  const qc = opts.queryClient ?? makeQueryClient();
  const route = opts.route ?? "/";
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={[route]}>
          <GameSessionProvider>{children}</GameSessionProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }
  return { queryClient: qc, ...render(ui, { wrapper: Wrapper, ...opts }) };
}
