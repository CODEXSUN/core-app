import type {
  ProductGroup,
  ProductGroupValues,
} from "../../../../../contracts/product-group";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/product-groups" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access product-groups.");
  }
  return response.json();
}
export function loadProductGroup(signal?: AbortSignal) {
  return request<ProductGroup[]>("", { signal });
}
export function getProductGroup(publicId: string, signal?: AbortSignal) {
  return request<ProductGroup>("/" + encodeURIComponent(publicId), { signal });
}
export function saveProductGroup(
  values: ProductGroupValues,
  publicId?: string,
) {
  return request<ProductGroup>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}
