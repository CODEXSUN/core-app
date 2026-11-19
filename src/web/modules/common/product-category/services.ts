import type {MasterListRemoteQuery} from '@workspace/ui/blocks/data-table';
import {loadReferencePage,loadSelectedReference,type ReferencePage} from '../../shared/reference-transport';
import {appFetch} from '../../../platform-client.ts';
import type {
  ProductCategory,
  ProductCategoryValues,
} from "../../../../../contracts/product-category";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/product-categories" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access product-categories.");
  }
  return response.json();
}
export function loadProductCategory(signal?: AbortSignal) {
  return request<ProductCategory[]>("", { signal });
}
export function getProductCategory(publicId: string, signal?: AbortSignal) {
  return request<ProductCategory>("/" + encodeURIComponent(publicId), {
    signal,
  });
}
export function saveProductCategory(
  values: ProductCategoryValues,
  publicId?: string,
) {
  return request<ProductCategory>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}

export function loadProductCategoryReferencePage(query:MasterListRemoteQuery,signal?:AbortSignal):Promise<ReferencePage<Pick<ProductCategory,'public_id'|'name'|'active'>>>{return loadReferencePage('product-categories',query,signal);}
export function getProductCategoryReference(id:string,signal?:AbortSignal):Promise<Pick<ProductCategory,'public_id'|'name'|'active'>>{return loadSelectedReference('product-categories',id,signal);}
