import type { Unit, UnitValues } from "../../../../../contracts/unit";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/units" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access units.");
  }
  return response.json();
}
export function loadUnit(signal?: AbortSignal) {
  return request<Unit[]>("", { signal });
}
export function getUnit(publicId: string, signal?: AbortSignal) {
  return request<Unit>("/" + encodeURIComponent(publicId), { signal });
}
export function saveUnit(values: UnitValues, publicId?: string) {
  return request<Unit>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
