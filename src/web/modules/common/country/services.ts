import type {MasterListRemoteQuery} from '@workspace/ui/blocks/data-table';
import {loadReferencePage,loadSelectedReference,type ReferencePage} from '../../shared/reference-transport';
import {appFetch} from '../../../platform-client.ts';
import type { Country, CountryValues } from "../../../../../contracts/country";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/countries" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access countries.");
  }
  return response.json();
}
export function loadCountry(signal?: AbortSignal) {
  return request<Country[]>("", { signal });
}
export function getCountry(publicId: string, signal?: AbortSignal) {
  return request<Country>("/" + encodeURIComponent(publicId), { signal });
}
export function saveCountry(values: CountryValues, publicId?: string) {
  return request<Country>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}

export function loadCountryReferencePage(query:MasterListRemoteQuery,signal?:AbortSignal):Promise<ReferencePage<Pick<Country,'public_id'|'name'|'active'>>>{return loadReferencePage('countries',query,signal);}
export function getCountryReference(id:string,signal?:AbortSignal):Promise<Pick<Country,'public_id'|'name'|'active'>>{return loadSelectedReference('countries',id,signal);}
