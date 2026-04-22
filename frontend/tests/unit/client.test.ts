import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../msw/server";
import { apiClient } from "@/api/client";
import { ApiClientError } from "@/api/errors";

const ORIGIN = "http://localhost:3000";

describe("apiClient", () => {
  it("parses JSON on 2xx", async () => {
    const data = await apiClient.post<{ gameId: string }>("/games");
    expect(data.gameId).toBe("abc123");
  });

  it("throws ApiClientError with typed code on known error", async () => {
    server.use(
      http.get(`${ORIGIN}/games/:gameId`, () =>
        HttpResponse.json({ error: "Game not found" }, { status: 404 }),
      ),
    );
    await expect(apiClient.get("/games/missing")).rejects.toBeInstanceOf(ApiClientError);
    try {
      await apiClient.get("/games/missing");
    } catch (e) {
      const err = e as ApiClientError;
      expect(err.status).toBe(404);
      expect(err.code).toBe("Game not found");
    }
  });

  it("falls back to Unknown on non-contract errors", async () => {
    server.use(
      http.get(`${ORIGIN}/games/:gameId`, () =>
        HttpResponse.json({ error: "Boom" }, { status: 500 }),
      ),
    );
    try {
      await apiClient.get("/games/anything");
      throw new Error("expected to throw");
    } catch (e) {
      const err = e as ApiClientError;
      expect(err.code).toBe("Unknown");
      expect(err.status).toBe(500);
    }
  });
});
