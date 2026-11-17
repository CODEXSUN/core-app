import type { Style, StyleValues } from "../../../../../contracts/style";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/styles" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access styles.");
  }
  return response.json();
}
export function loadStyle(signal?: AbortSignal) {
  return request<Style[]>("", { signal });
}
export function getStyle(publicId: string, signal?: AbortSignal) {
  return request<Style>("/" + encodeURIComponent(publicId), { signal });
}
export function saveStyle(values: StyleValues, publicId?: string) {
  return request<Style>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
