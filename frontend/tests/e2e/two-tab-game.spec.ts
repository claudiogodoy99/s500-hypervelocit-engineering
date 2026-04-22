import { test, expect } from "@playwright/test";

// Requires the backend to be running at VITE_BACKEND_ORIGIN (default http://localhost:3000).
// Per Constitution §III, backend is not spun up by this suite. Skip when unavailable.
const backendAvailable = Boolean(process.env.E2E_BACKEND);
const describeFn = backendAvailable ? test.describe : test.describe.skip;

describeFn("two-tab game", () => {
  test("two browser contexts complete a game round", async ({ browser }) => {
    const ctxA = await browser.newContext();
    const ctxB = await browser.newContext();
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    await pageA.goto("/");
    await pageA.getByRole("button", { name: /create game/i }).click();
    await expect(pageA).toHaveURL(/\/game\//);
    const gameIdInput = pageA.getByLabel(/game id/i);
    const gameId = await gameIdInput.inputValue();
    expect(gameId).toBeTruthy();

    await pageB.goto("/");
    await pageB.getByLabel(/enter the game id/i).fill(gameId);
    await pageB.getByRole("button", { name: /join game/i }).click();
    await expect(pageB).toHaveURL(/\/game\//);

    // Player A (X) plays center.
    await pageA.getByLabel(/Row 2, Col 2/).click();
    await expect(pageA.getByLabel(/Row 2, Col 2, X/)).toBeVisible();
    // Poll propagates to B.
    await expect(pageB.getByLabel(/Row 2, Col 2, X/)).toBeVisible({ timeout: 5_000 });

    await ctxA.close();
    await ctxB.close();
  });
});
