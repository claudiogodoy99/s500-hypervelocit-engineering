import { describe, it, expect } from "vitest";
import { trimAndValidateGameId } from "@/utils/validation";

describe("trimAndValidateGameId", () => {
  it("trims whitespace and accepts printable IDs", () => {
    const r = trimAndValidateGameId("  abc123  ");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("abc123");
  });

  it("rejects empty input", () => {
    const r = trimAndValidateGameId("   ");
    expect(r.ok).toBe(false);
  });

  it("rejects non-printable characters", () => {
    const r = trimAndValidateGameId("abc\u0000");
    expect(r.ok).toBe(false);
  });

  it("rejects IDs longer than 128 chars", () => {
    const r = trimAndValidateGameId("a".repeat(129));
    expect(r.ok).toBe(false);
  });
});
