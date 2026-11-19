import type {MasterListRemoteQuery} from '@workspace/ui/blocks/data-table';
import {loadReferencePage,loadSelectedReference,type ReferencePage} from '../../shared/reference-transport';
import {appFetch} from '../../../platform-client.ts';
import type { Brand, BrandValues } from "../../../../../contracts/brand";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/brands" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access brands.");
  }
  return response.json();
}
export function loadBrand(signal?: AbortSignal) {
  return request<Brand[]>("", { signal });
}
export function getBrand(publicId: string, signal?: AbortSignal) {
  return request<Brand>("/" + encodeURIComponent(publicId), { signal });
}
export function saveBrand(values: BrandValues, publicId?: string) {
  return request<Brand>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}

export function loadBrandReferencePage(query:MasterListRemoteQuery,signal?:AbortSignal):Promise<ReferencePage<Pick<Brand,'public_id'|'name'|'active'>>>{return loadReferencePage('brands',query,signal);}
export function getBrandReference(id:string,signal?:AbortSignal):Promise<Pick<Brand,'public_id'|'name'|'active'>>{return loadSelectedReference('brands',id,signal);}
