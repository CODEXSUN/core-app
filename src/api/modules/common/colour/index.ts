import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalColour, listColour } from "./repository.ts";
export async function listColourRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/colour:read");
  return listColour(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveColourReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/colour:read");
  const record = await findInternalColour(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected colour was not found or is inactive.");
  return record;
}
