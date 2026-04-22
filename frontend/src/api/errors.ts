import type { ApiErrorBody, ApiErrorCode } from "./types";
import { API_ERROR_CODES } from "./types";

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode | "Unknown";

  constructor(status: number, code: ApiErrorCode | "Unknown", message?: string) {
    super(message ?? code);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

export async function parseApiError(response: Response): Promise<ApiClientError> {
  let body: ApiErrorBody | null = null;
  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    body = null;
  }
  const raw = body?.error ?? "";
  const code: ApiErrorCode | "Unknown" =
    (API_ERROR_CODES as readonly string[]).includes(raw) ? (raw as ApiErrorCode) : "Unknown";
  return new ApiClientError(response.status, code, raw || response.statusText);
}
