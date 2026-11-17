import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import {
  requireModulePermission,
  type ModuleContext,
} from "../../../database/context.ts";
import { ConflictError } from "../../../http.ts";
import { findInternalDistrict, listDistrict } from "./repository.ts";
export async function listDistrictRecords(
  db: Kysely<Database>,
  context: ModuleContext,
) {
  requireModulePermission(context, "common/district:read");
  return listDistrict(db, context);
}
// Public in-app reference boundary. The owning module verifies scope, permission and active state.
export async function resolveDistrictReference(
  db: Kysely<Database>,
  context: ModuleContext,
  publicId: string,
) {
  requireModulePermission(context, "common/district:read");
  const record = await findInternalDistrict(db, context, publicId);
  if (!record || !record.active)
    throw new ConflictError("Selected district was not found or is inactive.");
  return record;
}
