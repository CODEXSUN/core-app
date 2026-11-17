import type { Product, ProductValues } from "../../../../../contracts/product";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/products" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access products.");
  }
  return response.json();
}
export function loadProduct(signal?: AbortSignal) {
  return request<Product[]>("", { signal });
}
export function getProduct(publicId: string, signal?: AbortSignal) {
  return request<Product>("/" + encodeURIComponent(publicId), { signal });
}
export function saveProduct(values: ProductValues, publicId?: string) {
  return request<Product>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}
