export type ValidationResult =
  | { readonly ok: true; readonly value: string }
  | { readonly ok: false; readonly reason: string };

const PRINTABLE = /^[\x21-\x7E]+$/;

export function trimAndValidateGameId(input: string): ValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: "Enter a game ID." };
  }
  if (!PRINTABLE.test(trimmed)) {
    return { ok: false, reason: "Game ID contains unsupported characters." };
  }
  if (trimmed.length > 128) {
    return { ok: false, reason: "Game ID is too long." };
  }
  return { ok: true, value: trimmed };
}
