import type {MasterListRemoteQuery} from '@workspace/ui/blocks/data-table';
import {loadReferencePage,loadSelectedReference,type ReferencePage} from '../../shared/reference-transport';
import {appFetch} from '../../../platform-client.ts';
import type {
  LedgerGroup,
  LedgerGroupValues,
} from "../../../../../contracts/ledger-group";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/ledger-groups" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access ledger-groups.");
  }
  return response.json();
}
export function loadLedgerGroup(signal?: AbortSignal) {
  return request<LedgerGroup[]>("", { signal });
}
export function getLedgerGroup(publicId: string, signal?: AbortSignal) {
  return request<LedgerGroup>("/" + encodeURIComponent(publicId), { signal });
}
export function saveLedgerGroup(values: LedgerGroupValues, publicId?: string) {
  return request<LedgerGroup>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}

export function loadLedgerGroupReferencePage(query:MasterListRemoteQuery,signal?:AbortSignal):Promise<ReferencePage<Pick<LedgerGroup,'public_id'|'name'|'active'>>>{return loadReferencePage('ledger-groups',query,signal);}
export function getLedgerGroupReference(id:string,signal?:AbortSignal):Promise<Pick<LedgerGroup,'public_id'|'name'|'active'>>{return loadSelectedReference('ledger-groups',id,signal);}
