import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalSize, listSize } from "./repository.ts";
export async function listSizeRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/size:read");
  return listSize(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveSizeReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/size:read");
  const record = await findInternalSize(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected size was not found or is inactive.");
  return record;
}
