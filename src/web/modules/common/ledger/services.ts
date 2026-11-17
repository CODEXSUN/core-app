import type { Ledger, LedgerValues } from "../../../../../contracts/ledger";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/ledgers" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access ledgers.");
  }
  return response.json();
}
export function loadLedger(signal?: AbortSignal) {
  return request<Ledger[]>("", { signal });
}
export function getLedger(publicId: string, signal?: AbortSignal) {
  return request<Ledger>("/" + encodeURIComponent(publicId), { signal });
}
export function saveLedger(values: LedgerValues, publicId?: string) {
  return request<Ledger>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
