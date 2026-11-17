import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalWorkOrderType, listWorkOrderType } from "./repository.ts";
export async function listWorkOrderTypeRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/work-order-type:read");
  return listWorkOrderType(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveWorkOrderTypeReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/work-order-type:read");
  const record = await findInternalWorkOrderType(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError(
      "Selected work order type was not found or is inactive.",
    );
  return record;
}
