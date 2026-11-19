import type {MasterListRemoteQuery} from '@workspace/ui/blocks/data-table';
import {loadReferencePage,loadSelectedReference,type ReferencePage} from '../../shared/reference-transport';
import {appFetch} from '../../../platform-client.ts';
import type { Pincode, PincodeValues } from "../../../../../contracts/pincode";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/pincodes" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access pincodes.");
  }
  return response.json();
}
export function loadPincode(signal?: AbortSignal) {
  return request<Pincode[]>("", { signal });
}
export function getPincode(publicId: string, signal?: AbortSignal) {
  return request<Pincode>("/" + encodeURIComponent(publicId), { signal });
}
export function savePincode(values: PincodeValues, publicId?: string) {
  return request<Pincode>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}

export function loadPincodeReferencePage(query:MasterListRemoteQuery,signal?:AbortSignal,references?:{cityId?:string}):Promise<ReferencePage<Pick<Pincode,'public_id'|'name'|'active'>>>{return loadReferencePage('pincodes',query,signal,references);}
export function getPincodeReference(id:string,signal?:AbortSignal):Promise<Pick<Pincode,'public_id'|'name'|'active'>>{return loadSelectedReference('pincodes',id,signal);}
