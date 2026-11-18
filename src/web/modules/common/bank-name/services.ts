import {appFetch} from '../../../platform-client.ts';
import type {
  BankName,
  BankNameValues,
} from "../../../../../contracts/bank-name";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/bank-names" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access bank-names.");
  }
  return response.json();
}
export function loadBankName(signal?: AbortSignal) {
  return request<BankName[]>("", { signal });
}
export function getBankName(publicId: string, signal?: AbortSignal) {
  return request<BankName>("/" + encodeURIComponent(publicId), { signal });
}
export function saveBankName(values: BankNameValues, publicId?: string) {
  return request<BankName>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
