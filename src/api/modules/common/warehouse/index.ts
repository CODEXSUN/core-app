import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalWarehouse, listWarehouse } from "./repository.ts";
export async function listWarehouseRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/warehouse:read");
  return listWarehouse(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveWarehouseReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/warehouse:read");
  const record = await findInternalWarehouse(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected warehouse was not found or is inactive.");
  return record;
}
