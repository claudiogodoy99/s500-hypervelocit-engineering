import { test, expect, type Page } from "@playwright/test";

// Happy-path e2e against the dev:mock in-browser MSW backend (Phase 9).
// Runs two pages in a single BrowserContext so they share origin + localStorage,
// which is how the dev mock syncs state across tabs. No real backend required.

const CELL = (row: 1 | 2 | 3, col: 1 | 2 | 3, state: "empty" | "X" | "O") =>
  new RegExp(`Row ${row}, Col ${col}, ${state}`);

async function clickCell(page: Page, row: 1 | 2 | 3, col: 1 | 2 | 3) {
  await page.getByLabel(CELL(row, col, "empty")).click();
}

async function expectCell(page: Page, row: 1 | 2 | 3, col: 1 | 2 | 3, marker: "X" | "O") {
  await expect(page.getByLabel(CELL(row, col, marker))).toBeVisible({ timeout: 5_000 });
}

test("two tabs complete a winning game via dev:mock", async ({ browser }) => {
  const context = await browser.newContext();

  const pageA = await context.newPage();
  const pageB = await context.newPage();

  // Tab A creates a new game and receives marker X.
  await pageA.goto("/");
  await pageA.getByRole("button", { name: /create game/i }).click();
  await expect(pageA).toHaveURL(/\/game\//);
  const gameId = await pageA.getByLabel(/^Game ID:$/i).inputValue();
  expect(gameId).toBeTruthy();

  // Tab B joins with that game id and receives marker O.
  await pageB.goto("/");
  await pageB.getByLabel(/enter the game id/i).fill(gameId);
  await pageB.getByRole("button", { name: /join game/i }).click();
  await expect(pageB).toHaveURL(/\/game\//);

  // X-row win sequence: X plays the top row; O plays the middle row.
  await clickCell(pageA, 1, 1);
  await expectCell(pageA, 1, 1, "X");
  await expectCell(pageB, 1, 1, "X"); // polled across tabs

  await clickCell(pageB, 2, 1);
  await expectCell(pageA, 2, 1, "O");

  await clickCell(pageA, 1, 2);
  await expectCell(pageB, 1, 2, "X");

  await clickCell(pageB, 2, 2);
  await expectCell(pageA, 2, 2, "O");

  await clickCell(pageA, 1, 3); // X wins top row

  // Both tabs observe the outcome banner within the 1 s polling window.
  // Outcome wording is from the player's perspective: A=X (winner) sees "You won", B=O sees "You lost".
  await expect(pageA.getByText(/^You won$/)).toBeVisible({ timeout: 5_000 });
  await expect(pageB.getByText(/^You lost$/)).toBeVisible({ timeout: 5_000 });

  await context.close();
});
