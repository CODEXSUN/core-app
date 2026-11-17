import type {
  Destination,
  DestinationValues,
} from "../../../../../contracts/destination";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/destinations" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access destinations.");
  }
  return response.json();
}
export function loadDestination(signal?: AbortSignal) {
  return request<Destination[]>("", { signal });
}
export function getDestination(publicId: string, signal?: AbortSignal) {
  return request<Destination>("/" + encodeURIComponent(publicId), { signal });
}
export function saveDestination(values: DestinationValues, publicId?: string) {
  return request<Destination>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}
