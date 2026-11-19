import type {MasterListRemoteQuery} from '@workspace/ui/blocks/data-table';
import {loadReferencePage,loadSelectedReference,type ReferencePage} from '../../shared/reference-transport';
import {appFetch} from '../../../platform-client.ts';
import type { Tax, TaxValues } from "../../../../../contracts/tax";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/taxes" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access taxes.");
  }
  return response.json();
}
export function loadTax(signal?: AbortSignal) {
  return request<Tax[]>("", { signal });
}
export function getTax(publicId: string, signal?: AbortSignal) {
  return request<Tax>("/" + encodeURIComponent(publicId), { signal });
}
export function saveTax(values: TaxValues, publicId?: string) {
  return request<Tax>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}

export function loadTaxReferencePage(query:MasterListRemoteQuery,signal?:AbortSignal):Promise<ReferencePage<Pick<Tax,'public_id'|'name'|'active'>>>{return loadReferencePage('taxes',query,signal);}
export function getTaxReference(id:string,signal?:AbortSignal):Promise<Pick<Tax,'public_id'|'name'|'active'>>{return loadSelectedReference('taxes',id,signal);}
