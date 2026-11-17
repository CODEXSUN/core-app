import type { State, StateValues } from "../../../../../contracts/state";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/states" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access states.");
  }
  return response.json();
}
export function loadState(signal?: AbortSignal) {
  return request<State[]>("", { signal });
}
export function getState(publicId: string, signal?: AbortSignal) {
  return request<State>("/" + encodeURIComponent(publicId), { signal });
}
export function saveState(values: StateValues, publicId?: string) {
  return request<State>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
