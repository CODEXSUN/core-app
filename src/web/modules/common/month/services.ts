import {appFetch} from '../../../platform-client.ts';
import type { Month, MonthValues } from "../../../../../contracts/month";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/months" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access months.");
  }
  return response.json();
}
export function loadMonth(signal?: AbortSignal) {
  return request<Month[]>("", { signal });
}
export function getMonth(publicId: string, signal?: AbortSignal) {
  return request<Month>("/" + encodeURIComponent(publicId), { signal });
}
export function saveMonth(values: MonthValues, publicId?: string) {
  return request<Month>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
