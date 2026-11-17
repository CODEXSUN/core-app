import type {
  DefaultCompany,
  DefaultCompanyValues,
} from "../../../../../contracts/default-company";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/default-companies" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access default-companies.");
  }
  return response.json();
}
export function loadDefaultCompany(signal?: AbortSignal) {
  return request<DefaultCompany[]>("", { signal });
}
export function getDefaultCompany(publicId: string, signal?: AbortSignal) {
  return request<DefaultCompany>("/" + encodeURIComponent(publicId), {
    signal,
  });
}
export function saveDefaultCompany(
  values: DefaultCompanyValues,
  publicId?: string,
) {
  return request<DefaultCompany>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}
