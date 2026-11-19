import type {MasterListRemoteQuery} from '@workspace/ui/blocks/data-table';
import {loadReferencePage,loadSelectedReference,type ReferencePage} from '../../shared/reference-transport';
import {appFetch} from '../../../platform-client.ts';
import type { Company, CompanyValues } from "../../../../../contracts/company";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/companies" + path, {
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

export function loadCompanyReferencePage(query:MasterListRemoteQuery,signal?:AbortSignal):Promise<ReferencePage<Pick<Company,'public_id'|'name'|'active'>>>{return loadReferencePage('companies',query,signal);}
export function getCompanyReference(id:string,signal?:AbortSignal):Promise<Pick<Company,'public_id'|'name'|'active'>>{return loadSelectedReference('companies',id,signal);}
