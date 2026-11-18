import {appFetch} from '../../../platform-client.ts';
import type {
  Priority,
  PriorityValues,
} from "../../../../../contracts/priority";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/priorities" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access priorities.");
  }
  return response.json();
}
export function loadPriority(signal?: AbortSignal) {
  return request<Priority[]>("", { signal });
}
export function getPriority(publicId: string, signal?: AbortSignal) {
  return request<Priority>("/" + encodeURIComponent(publicId), { signal });
}
export function savePriority(values: PriorityValues, publicId?: string) {
  return request<Priority>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
