import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalHsnCode, listHsnCode } from "./repository.ts";
export async function listHsnCodeRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/hsn-code:read");
  return listHsnCode(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveHsnCodeReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/hsn-code:read");
  const record = await findInternalHsnCode(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected hsn code was not found or is inactive.");
  return record;
}
