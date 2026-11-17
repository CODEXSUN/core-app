import type { City, CityValues } from "../../../../../contracts/city";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/cities" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access cities.");
  }
  return response.json();
}
export function loadCity(signal?: AbortSignal) {
  return request<City[]>("", { signal });
}
export function getCity(publicId: string, signal?: AbortSignal) {
  return request<City>("/" + encodeURIComponent(publicId), { signal });
}
export function saveCity(values: CityValues, publicId?: string) {
  return request<City>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
