import type {
  Transport,
  TransportValues,
} from "../../../../../contracts/transport";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/transports" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access transports.");
  }
  return response.json();
}
export function loadTransport(signal?: AbortSignal) {
  return request<Transport[]>("", { signal });
}
export function getTransport(publicId: string, signal?: AbortSignal) {
  return request<Transport>("/" + encodeURIComponent(publicId), { signal });
}
export function saveTransport(values: TransportValues, publicId?: string) {
  return request<Transport>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}
