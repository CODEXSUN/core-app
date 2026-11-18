import {appFetch} from '../../../platform-client.ts';
import type { Size, SizeValues } from "../../../../../contracts/size";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/sizes" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access sizes.");
  }
  return response.json();
}
export function loadSize(signal?: AbortSignal) {
  return request<Size[]>("", { signal });
}
export function getSize(publicId: string, signal?: AbortSignal) {
  return request<Size>("/" + encodeURIComponent(publicId), { signal });
}
export function saveSize(values: SizeValues, publicId?: string) {
  return request<Size>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
