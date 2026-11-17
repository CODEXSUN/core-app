import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalState, listState } from "./repository.ts";
export async function listStateRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/state:read");
  return listState(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveStateReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/state:read");
  const record = await findInternalState(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected state was not found or is inactive.");
  return record;
}
