import {appFetch} from '../../../platform-client.ts';
import type {
  AddressType,
  AddressTypeValues,
} from "../../../../../contracts/address-type";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/address-types" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access address-types.");
  }
  return response.json();
}
export function loadAddressType(signal?: AbortSignal) {
  return request<AddressType[]>("", { signal });
}
export function getAddressType(publicId: string, signal?: AbortSignal) {
  return request<AddressType>("/" + encodeURIComponent(publicId), { signal });
}
export function saveAddressType(values: AddressTypeValues, publicId?: string) {
  return request<AddressType>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}
