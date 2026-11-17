import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalPriority, listPriority } from "./repository.ts";
export async function listPriorityRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/priority:read");
  return listPriority(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolvePriorityReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/priority:read");
  const record = await findInternalPriority(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected priority was not found or is inactive.");
  return record;
}
