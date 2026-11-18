import {appFetch} from '../../../platform-client.ts';
import type { HsnCode, HsnCodeValues } from "../../../../../contracts/hsn-code";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/hsn-codes" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access hsn-codes.");
  }
  return response.json();
}
export function loadHsnCode(signal?: AbortSignal) {
  return request<HsnCode[]>("", { signal });
}
export function getHsnCode(publicId: string, signal?: AbortSignal) {
  return request<HsnCode>("/" + encodeURIComponent(publicId), { signal });
}
export function saveHsnCode(values: HsnCodeValues, publicId?: string) {
  return request<HsnCode>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
