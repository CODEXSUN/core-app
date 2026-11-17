import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalFinancialYear, listFinancialYear } from "./repository.ts";
export async function listFinancialYearRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "master/financial-year:read");
  return listFinancialYear(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveFinancialYearReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "master/financial-year:read");
  const record = await findInternalFinancialYear(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError(
      "Selected financial year was not found or is inactive.",
    );
  return record;
}
