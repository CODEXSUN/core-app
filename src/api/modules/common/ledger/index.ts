import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalLedger, listLedger } from "./repository.ts";
export async function listLedgerRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/ledger:read");
  return listLedger(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveLedgerReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/ledger:read");
  const record = await findInternalLedger(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected ledger was not found or is inactive.");
  return record;
}
