import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalTax, listTax } from "./repository.ts";
export async function listTaxRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/tax:read");
  return listTax(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveTaxReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/tax:read");
  const record = await findInternalTax(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected tax was not found or is inactive.");
  return record;
}
