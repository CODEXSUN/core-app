import type {
  District,
  DistrictValues,
} from "../../../../../contracts/district";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/districts" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access districts.");
  }
  return response.json();
}
export function loadDistrict(signal?: AbortSignal) {
  return request<District[]>("", { signal });
}
export function getDistrict(publicId: string, signal?: AbortSignal) {
  return request<District>("/" + encodeURIComponent(publicId), { signal });
}
export function saveDistrict(values: DistrictValues, publicId?: string) {
  return request<District>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
