import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalCompany, listCompany } from "./repository.ts";
export async function listCompanyRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "master/company:read");
  return listCompany(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveCompanyReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "master/company:read");
  const record = await findInternalCompany(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected company was not found or is inactive.");
  return record;
}
