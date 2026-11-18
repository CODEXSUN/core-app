import {appFetch} from '../../../platform-client.ts';
import type {
  FinancialYear,
  FinancialYearValues,
} from "../../../../../contracts/financial-year";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/financial-years" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access financial-years.");
  }
  return response.json();
}
export function loadFinancialYear(signal?: AbortSignal) {
  return request<FinancialYear[]>("", { signal });
}
export function getFinancialYear(publicId: string, signal?: AbortSignal) {
  return request<FinancialYear>("/" + encodeURIComponent(publicId), { signal });
}
export function saveFinancialYear(
  values: FinancialYearValues,
  publicId?: string,
) {
  return request<FinancialYear>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}
