import type { Company, CompanyValues } from "../../../../../contracts/company";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/companies" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access companies.");
  }
  return response.json();
}
export function loadCompany(signal?: AbortSignal) {
  return request<Company[]>("", { signal });
}
export function getCompany(publicId: string, signal?: AbortSignal) {
  return request<Company>("/" + encodeURIComponent(publicId), { signal });
}
export function saveCompany(values: CompanyValues, publicId?: string) {
  return request<Company>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
