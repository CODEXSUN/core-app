import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalSalesType, listSalesType } from "./repository.ts";
export async function listSalesTypeRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/sales-type:read");
  return listSalesType(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveSalesTypeReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/sales-type:read");
  const record = await findInternalSalesType(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError(
      "Selected sales type was not found or is inactive.",
    );
  return record;
}
