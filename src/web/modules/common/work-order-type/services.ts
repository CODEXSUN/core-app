import type {
  WorkOrderType,
  WorkOrderTypeValues,
} from "../../../../../contracts/work-order-type";
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/v1/work-order-types" + path, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? "Unable to access work-order-types.");
  }
  return response.json();
}
export function loadWorkOrderType(signal?: AbortSignal) {
  return request<WorkOrderType[]>("", { signal });
}
export function getWorkOrderType(publicId: string, signal?: AbortSignal) {
  return request<WorkOrderType>("/" + encodeURIComponent(publicId), { signal });
}
export function saveWorkOrderType(
  values: WorkOrderTypeValues,
  publicId?: string,
) {
  return request<WorkOrderType>(
    publicId ? "/" + encodeURIComponent(publicId) : "",
    {
      method: publicId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    },
  );
}
