import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalLedgerGroup, listLedgerGroup } from "./repository.ts";
export async function listLedgerGroupRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/ledger-group:read");
  return listLedgerGroup(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveLedgerGroupReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/ledger-group:read");
  const record = await findInternalLedgerGroup(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError(
      "Selected ledger group was not found or is inactive.",
    );
  return record;
}
