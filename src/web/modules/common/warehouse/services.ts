import type {
  Warehouse,
  WarehouseValues,
} from "../../../../../contracts/warehouse";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/warehouses" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access warehouses.");
  }
  return response.json();
}
export function loadWarehouse(signal?: AbortSignal) {
  return request<Warehouse[]>("", { signal });
}
export function getWarehouse(publicId: string, signal?: AbortSignal) {
  return request<Warehouse>("/" + encodeURIComponent(publicId), { signal });
}
export function saveWarehouse(values: WarehouseValues, publicId?: string) {
  return request<Warehouse>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}
