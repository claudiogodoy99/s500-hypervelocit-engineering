import { parseApiError } from "./errors";

const DEFAULT_ORIGIN = "http://localhost:3000";

export function getBackendOrigin(): string {
  const v = import.meta.env.VITE_BACKEND_ORIGIN;
  return v && v.length > 0 ? v : DEFAULT_ORIGIN;
}

async function request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const url = `${getBackendOrigin()}${path}`;
  const init: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  const response = await fetch(url, init);
  if (!response.ok) {
    throw await parseApiError(response);
  }
  return (await response.json()) as T;
}

export const apiClient = {
  get<T>(path: string): Promise<T> {
    return request<T>("GET", path);
  },
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>("POST", path, body);
  },
};
