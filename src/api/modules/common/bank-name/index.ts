import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalBankName, listBankName } from "./repository.ts";
export async function listBankNameRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/bank-name:read");
  return listBankName(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveBankNameReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/bank-name:read");
  const record = await findInternalBankName(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected bank name was not found or is inactive.");
  return record;
}
