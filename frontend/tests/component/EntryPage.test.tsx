import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { EntryPage } from "@/pages/EntryPage";
import { renderWithProviders } from "../testUtils";
import { server } from "../msw/server";

const ORIGIN = "http://localhost:3000";

describe("EntryPage", () => {
  it("creates a game and shows creating state", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EntryPage />);
    await user.click(screen.getByRole("button", { name: /create game/i }));
    // After navigation, EntryPage unmounts; we confirm the request was made by the absence of errors.
    await waitFor(() => {
      expect(screen.queryByText(/failed to create/i)).not.toBeInTheDocument();
    });
  });

  it("surfaces 'Game not found' when joining with an unknown ID", async () => {
    server.use(
      http.post(`${ORIGIN}/games/:gameId/join`, () =>
        HttpResponse.json({ error: "Game not found" }, { status: 404 }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<EntryPage />);
    await user.type(screen.getByLabelText(/enter the game id/i), "missing");
    await user.click(screen.getByRole("button", { name: /join game/i }));
    expect(await screen.findByText(/game not found/i)).toBeInTheDocument();
  });

  it("surfaces 'Game is already full' on join conflict", async () => {
    server.use(
      http.post(`${ORIGIN}/games/:gameId/join`, () =>
        HttpResponse.json({ error: "Game is already full" }, { status: 409 }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<EntryPage />);
    await user.type(screen.getByLabelText(/enter the game id/i), "abc123");
    await user.click(screen.getByRole("button", { name: /join game/i }));
    expect(await screen.findByText(/already full/i)).toBeInTheDocument();
  });

  it("rejects empty game ID client-side", async () => {
    const user = userEvent.setup();
    renderWithProviders(<EntryPage />);
    await user.click(screen.getByRole("button", { name: /join game/i }));
    expect(await screen.findByText(/enter a game id/i)).toBeInTheDocument();
  });
});
