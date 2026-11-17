import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalWorkOrder, listWorkOrder } from "./repository.ts";
export async function listWorkOrderRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "master/work-order:read");
  return listWorkOrder(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveWorkOrderReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "master/work-order:read");
  const record = await findInternalWorkOrder(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError(
      "Selected work order was not found or is inactive.",
    );
  return record;
}
