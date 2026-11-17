import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalStyle, listStyle } from "./repository.ts";
export async function listStyleRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/style:read");
  return listStyle(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveStyleReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/style:read");
  const record = await findInternalStyle(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected style was not found or is inactive.");
  return record;
}
