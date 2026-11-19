import type {MasterListRemoteQuery} from '@workspace/ui/blocks/data-table';
import {loadReferencePage,loadSelectedReference,type ReferencePage} from '../../shared/reference-transport';
import {appFetch} from '../../../platform-client.ts';
import type {
  District,
  DistrictValues,
} from "../../../../../contracts/district";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/districts" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access districts.");
  }
  return response.json();
}
export function loadDistrict(signal?: AbortSignal) {
  return request<District[]>("", { signal });
}
export function getDistrict(publicId: string, signal?: AbortSignal) {
  return request<District>("/" + encodeURIComponent(publicId), { signal });
}
export function saveDistrict(values: DistrictValues, publicId?: string) {
  return request<District>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}

export function loadDistrictReferencePage(query:MasterListRemoteQuery,signal?:AbortSignal,references?:{stateId?:string}):Promise<ReferencePage<Pick<District,'public_id'|'name'|'active'>>>{return loadReferencePage('districts',query,signal,references as Readonly<Record<string,string>>|undefined);}
export function getDistrictReference(id:string,signal?:AbortSignal):Promise<Pick<District,'public_id'|'name'|'active'>>{return loadSelectedReference('districts',id,signal);}
