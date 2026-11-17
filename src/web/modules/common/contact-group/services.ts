import type {
  ContactGroup,
  ContactGroupValues,
} from "../../../../../contracts/contact-group";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/contact-groups" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access contact-groups.");
  }
  return response.json();
}
export function loadContactGroup(signal?: AbortSignal) {
  return request<ContactGroup[]>("", { signal });
}
export function getContactGroup(publicId: string, signal?: AbortSignal) {
  return request<ContactGroup>("/" + encodeURIComponent(publicId), { signal });
}
export function saveContactGroup(
  values: ContactGroupValues,
  publicId?: string,
) {
  return request<ContactGroup>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}
