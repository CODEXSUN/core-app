import type {
  SalesType,
  SalesTypeValues,
} from "../../../../../contracts/sales-type";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/sales-types" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access sales-types.");
  }
  return response.json();
}
export function loadSalesType(signal?: AbortSignal) {
  return request<SalesType[]>("", { signal });
}
export function getSalesType(publicId: string, signal?: AbortSignal) {
  return request<SalesType>("/" + encodeURIComponent(publicId), { signal });
}
export function saveSalesType(values: SalesTypeValues, publicId?: string) {
  return request<SalesType>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}
