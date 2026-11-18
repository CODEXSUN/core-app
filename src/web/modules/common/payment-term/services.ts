import {appFetch} from '../../../platform-client.ts';
import type {
  PaymentTerm,
  PaymentTermValues,
} from "../../../../../contracts/payment-term";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/payment-terms" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access payment-terms.");
  }
  return response.json();
}
export function loadPaymentTerm(signal?: AbortSignal) {
  return request<PaymentTerm[]>("", { signal });
}
export function getPaymentTerm(publicId: string, signal?: AbortSignal) {
  return request<PaymentTerm>("/" + encodeURIComponent(publicId), { signal });
}
export function savePaymentTerm(values: PaymentTermValues, publicId?: string) {
  return request<PaymentTerm>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}
