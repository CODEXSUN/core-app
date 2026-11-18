import {appFetch} from '../../../platform-client.ts';
import type {
  WorkOrder,
  WorkOrderValues,
} from "../../../../../contracts/work-order";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await appFetch("/api/v1/work-orders" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access work-orders.");
  }
  return response.json();
}
export function loadWorkOrder(signal?: AbortSignal) {
  return request<WorkOrder[]>("", { signal });
}
export function getWorkOrder(publicId: string, signal?: AbortSignal) {
  return request<WorkOrder>("/" + encodeURIComponent(publicId), { signal });
}
export function saveWorkOrder(values: WorkOrderValues, publicId?: string) {
  return request<WorkOrder>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}
