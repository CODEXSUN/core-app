import {appFetch} from '../../../platform-client.ts';
import type {
  ContactType,
  ContactTypeValues,
} from "../../../../../contracts/contact-type";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/contact-types" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access contact-types.");
  }
  return response.json();
}
export function loadContactType(signal?: AbortSignal) {
  return request<ContactType[]>("", { signal });
}
export function getContactType(publicId: string, signal?: AbortSignal) {
  return request<ContactType>("/" + encodeURIComponent(publicId), { signal });
}
export function saveContactType(values: ContactTypeValues, publicId?: string) {
  return request<ContactType>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}
