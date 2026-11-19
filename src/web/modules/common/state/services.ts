import type {MasterListRemoteQuery} from '@workspace/ui/blocks/data-table';
import {loadReferencePage,loadSelectedReference,type ReferencePage} from '../../shared/reference-transport';
import {appFetch} from '../../../platform-client.ts';
import type { State, StateValues } from "../../../../../contracts/state";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/states" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access states.");
  }
  return response.json();
}
export function loadState(signal?: AbortSignal) {
  return request<State[]>("", { signal });
}
export function getState(publicId: string, signal?: AbortSignal) {
  return request<State>("/" + encodeURIComponent(publicId), { signal });
}
export function saveState(values: StateValues, publicId?: string) {
  return request<State>(publicId ? "/" + encodeURIComponent(publicId) : "", {
    method: publicId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
}

export function loadStateReferencePage(query:MasterListRemoteQuery,signal?:AbortSignal,references?:{countryId?:string}):Promise<ReferencePage<Pick<State,'public_id'|'name'|'active'>>>{return loadReferencePage('states',query,signal,references as Readonly<Record<string,string>>|undefined);}
export function getStateReference(id:string,signal?:AbortSignal):Promise<Pick<State,'public_id'|'name'|'active'>>{return loadSelectedReference('states',id,signal);}
