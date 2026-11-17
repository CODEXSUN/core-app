import type { Contact, ContactValues } from "../../../../../contracts/contact";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/contacts" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access contacts.");
  }
  return response.json();
}
export function loadContact(signal?: AbortSignal) {
  return request<Contact[]>("", { signal });
}
export function getContact(publicId: string, signal?: AbortSignal) {
  return request<Contact>("/" + encodeURIComponent(publicId), { signal });
}
export function saveContact(values: ContactValues, publicId?: string) {
  return request<Contact>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
