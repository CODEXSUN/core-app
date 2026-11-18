import {appFetch} from '../../../platform-client.ts';
import type {
  Currency,
  CurrencyValues,
} from "../../../../../contracts/currency";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/currencies" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access currencies.");
  }
  return response.json();
}
export function loadCurrency(signal?: AbortSignal) {
  return request<Currency[]>("", { signal });
}
export function getCurrency(publicId: string, signal?: AbortSignal) {
  return request<Currency>("/" + encodeURIComponent(publicId), { signal });
}
export function saveCurrency(values: CurrencyValues, publicId?: string) {
  return request<Currency>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
