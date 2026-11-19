import type {MasterListRemoteQuery} from '@workspace/ui/blocks/data-table';
import {loadReferencePage,loadSelectedReference,type ReferencePage} from '../../shared/reference-transport';
import {appFetch} from '../../../platform-client.ts';
import type {
  ProductType,
  ProductTypeValues,
} from "../../../../../contracts/product-type";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/product-types" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access product-types.");
  }
  return response.json();
}
export function loadProductType(signal?: AbortSignal) {
  return request<ProductType[]>("", { signal });
}
export function getProductType(publicId: string, signal?: AbortSignal) {
  return request<ProductType>("/" + encodeURIComponent(publicId), { signal });
}
export function saveProductType(values: ProductTypeValues, publicId?: string) {
  return request<ProductType>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}

export function loadProductTypeReferencePage(query:MasterListRemoteQuery,signal?:AbortSignal):Promise<ReferencePage<Pick<ProductType,'public_id'|'name'|'active'>>>{return loadReferencePage('product-types',query,signal);}
export function getProductTypeReference(id:string,signal?:AbortSignal):Promise<Pick<ProductType,'public_id'|'name'|'active'>>{return loadSelectedReference('product-types',id,signal);}
