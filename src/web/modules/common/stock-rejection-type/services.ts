import {appFetch} from '../../../platform-client.ts';
import type {
  StockRejectionType,
  StockRejectionTypeValues,
} from "../../../../../contracts/stock-rejection-type";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/stock-rejection-types" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access stock-rejection-types.");
  }
  return response.json();
}
export function loadStockRejectionType(signal?: AbortSignal) {
  return request<StockRejectionType[]>("", { signal });
}
export function getStockRejectionType(publicId: string, signal?: AbortSignal) {
  return request<StockRejectionType>("/" + encodeURIComponent(publicId), {
    signal,
  });
}
export function saveStockRejectionType(
  values: StockRejectionTypeValues,
  publicId?: string,
) {
  return request<StockRejectionType>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}
