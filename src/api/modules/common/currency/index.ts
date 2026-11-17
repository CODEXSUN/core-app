import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalCurrency, listCurrency } from "./repository.ts";
export async function listCurrencyRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/currency:read");
  return listCurrency(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveCurrencyReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/currency:read");
  const record = await findInternalCurrency(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected currency was not found or is inactive.");
  return record;
}
